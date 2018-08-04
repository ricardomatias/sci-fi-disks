'use strict';

/* exported preload setup draw windowResized */
var presets = new PresetsManager();

var sketch = new Sketch();

var paletteStudio = new PaletteStudio({
	palettes: [
		[ '#000000', '#152B3C', '#E32D40', '#11644D', '#F2C94E', '#C02942', '#ECD078', '#FAFCD9', '#FC4416' ],
	],
	pairs: [
		[ '#FAFCD9', '#FC4416' ],
		[ '#C02942', '#ECD078' ],
		[ '#1f1e2a', '#FFFFFF' ],
		[ '#152B3C', '#E32D40' ],
		[ '#11644D', '#F2C94E' ]
	],
	convertToColor: true,
});

function createDistribution(sections, maxSize) {
	var distribution = [];
	var mean = maxSize / sections;
	var start = 0;

	for (var currentSection = 0; currentSection < sections; currentSection++) {
		var pick = round(min(round(abs(randomGaussian(mean, 100))), maxSize / (sections - 1)));

		distribution.push({
			start: start,
			end: pick,
		});

		start += pick;
	}

	return distribution;
}

sketch.setup(function sketchSetup() {
	createCanvas(windowWidth, windowHeight);

	paletteStudio.setup();

	presets.register('simple', {
		circlesDistribution: []
	});

	presets.setup('simple', function(defaults) {
		background(paletteStudio.backgroundColor.toString());

		let palette = defaults.palette = paletteStudio.getPalette(0);

		palette = palette.filter((color) => {
			return paletteStudio.backgroundColor.toString() !== color.toString();
		});

		defaults.centerFill = palette[MathUtils.randomInt(0, palette.length - 1)];

		defaults.circlesDistribution = createDistribution(MathUtils.randomInt(3, 7), 500);

		for (let circleIndex = 0; circleIndex < defaults.circlesDistribution.length; circleIndex++) {
			let circle = defaults.circlesDistribution[circleIndex];
			let slicesNumber = MathUtils.randomInt(8, 15);

			let slicesDistribution = circle.slicesDistribution = createDistribution(slicesNumber, 360);

			circle.rotationSpeed = MathUtils.roundToPlaces(random() / 2, 2);
			circle.rotationPhase = 0;

			for (let sliceIndex = 0; sliceIndex < slicesDistribution.length; sliceIndex++) {
				let slice = slicesDistribution[sliceIndex];

				if (sliceIndex % 2 === 0) {
					slice.brightness = 'LIGHTER';
					slice.strokeWeight = MathUtils.randomInt(5, 12);
				} else {
					slice.brightness = 'DARKER';
					slice.strokeWeight = MathUtils.randomInt(3, 7);
				}

				if (round(randomGaussian(-100, 1000)) > 0) {
					slice.type = 'ARC';
				} else {
					let lotto = MathUtils.randomInt(0, 10);

					if (lotto === 0) {
						slice.type = 'RECT';
					} else if (lotto === 1) {
						slice.type = 'ELLIPSE';
					}
				}

				if (slice.type) {
					let randomColorIndex = MathUtils.randomInt(0, palette.length - 1);

					slice.fillColor = palette[randomColorIndex];
				}
			}
		}
	}, this);

	presets.select('simple');

	// SHORTCUTS
	this.registerShortcuts([
		{
			key: 'w',
			action: function() {
				redraw();

				presets.selectPrevious();
			}
		},
		{
			key: 's',
			action: function() {
				redraw();

				presets.selectNext();
			}
		},
		{
			key: 'r',
			action: function() {
				redraw();

				presets.selectRandom();
			}
		},
		{
			key: 'h',
			action: function() {
				Helpers.hideClutter();
			}
		},
		{
			key: 'Space',
			action: function() {
				paletteStudio.cycleColorScheme();

				redraw();
			}
		},
		{
			key: 'Enter',
			action: function() {
				const preset = presets.getActivePreset();

				this.takeScreenshot(preset.name);
			}
		}
	]);
});

sketch.draw(function sketchDraw()  {
	const halfWidth = windowWidth / 2,
				halfHeight = windowHeight / 2,
				backgroundColor = paletteStudio.backgroundColor;

	// VISUALS
	background(backgroundColor.toString());

	/**
	 * Algorithm:
	 * * Create a random amount of nested circles
	 * * Fill them with a random amount (some with high % others low %)
	 * * Assign each a random color
	 * * rotate them
	 */
	presets.draw('simple', function(defaults) {
		const cx = halfWidth,
					cy = halfHeight,
					circlesDistribution = defaults.circlesDistribution,
					centerCircleSize = circlesDistribution[0].end / 2;

		noStroke();
		strokeCap(SQUARE);

		fill(defaults.centerFill);

		ellipse(cx, cy, centerCircleSize, centerCircleSize);

		noFill();

		for (let circleIndex = 0; circleIndex < circlesDistribution.length; circleIndex++) {
			let circle = circlesDistribution[circleIndex];
			let size = (halfWidth / 4) + circle.start + round(circle.end / 2);
			let slicesDistribution = circle.slicesDistribution;
			let rotationPhase = MathUtils.degreesToRads(circle.rotationPhase);

			for (let sliceIndex = 0; sliceIndex < slicesDistribution.length; sliceIndex++) {
				let slice = slicesDistribution[sliceIndex];
				let fillColor = slice.fillColor;

				if (!slice.type) {
					continue;
				}

				let start = MathUtils.degreesToRads(slice.start);
				let stop = MathUtils.degreesToRads(slice.start + slice.end);

				let angle = stop;

				noFill();

				if (slice.brightness === 'LIGHTER') {
					fillColor = color(fillColor.toString());
					strokeWeight(slice.strokeWeight);

					fillColor.setAlpha(150);
				} else {
					strokeWeight(slice.strokeWeight);

					fillColor = color(fillColor.toString());

					fillColor.setAlpha(225);
				}

				stroke(fillColor);

				if (slice.type === 'ARC') {
					push();
					translate(cx, cy);
					rotate(rotationPhase);
					// x,y,w,h,start,stop,[mode]
					arc(0, 0, size, size, start, stop, OPEN);
					pop();
				} else {
					angle = start + MathUtils.degreesToRads(5) + rotationPhase;
					let shapeCx = round(cos(angle) * (size / 2)) + cx;
					let shapeCy = round(sin(angle) * (size / 2)) + cy;

					fillColor.setAlpha(255);
					fill(fillColor);

					push();
					translate(shapeCx, shapeCy);
					
					if (slice.type === 'RECT') {
						rectMode(CENTER);
						rotate(angle);
						rect(0, 0, stop / 3, stop / 3);
					} else if (slice.type === 'ELLIPSE') {
						ellipse(0, 0, stop / 2, stop / 2);
					}

					pop();
				}

				circle.rotationPhase += circle.rotationSpeed;
			}
		}
	}, this);
});

function setup() {
	sketch.setup();
}

function draw() {
	sketch.draw();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
