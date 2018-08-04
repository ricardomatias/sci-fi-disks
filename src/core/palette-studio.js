'use strict';

function PaletteStudio(options) {
	options = options || {};

	this._pairs = options.pairs || [];
	this._palettes = options.palettes || [];
	this._convertToColor = options.convertToColor || false;
	this._paletteIndex = 0;

	this.fillColor = null;
	this.backgroundColor = null;
}

PaletteStudio.prototype.setup = function setup() {
	if (!color) {
		throw new Error('Invoke this method inside of "setup"');
	}

	if (this._convertToColor) {
		this._pairs = this.convertToColor(this._pairs);
		this._palettes = this.convertToColor(this._palettes);
	}

	this.cycleColorScheme();
};

PaletteStudio.prototype.cycleColorScheme = function cycleColorScheme() {
	this.fillColor = this._pairs[this._paletteIndex][1];
	this.backgroundColor = this._pairs[this._paletteIndex][0];

	this._paletteIndex++;

	if (this._paletteIndex > this._pairs.length - 1) {
		this._paletteIndex = 0;
	}

	console.log('%cPALETTE STUDIO: cycleColorScheme ', 'background-color: yellow; color: black;');
};

PaletteStudio.prototype.pick = function pick(paletteIndex, colorIndex) {
	const palette = this._palettes[paletteIndex];

	if (!palette) {
		throw new Error('No palette with index: ' + paletteIndex);
	}

	const color = palette[colorIndex];

	if (!color) {
		throw new Error('No clor with index: ' + colorIndex);
	}

	return color;
};

PaletteStudio.prototype.getPalette = function(paletteIndex) {
	const palette = this._palettes[paletteIndex];

	if (!palette) {
		throw new Error('No palette with index: ' + paletteIndex);
	}

	return [].concat(palette);
};

PaletteStudio.prototype.randomizePaletteStudios = function randomizePaletteStudios() {
	this._palettes.sort(() => Math.floor(Math.random() * 2));
};

PaletteStudio.prototype.randomizeColors = function randomizeColors() {
	this.palettes.forEach((palette) => {
		if (palette.length > 1) {
			palette.colors.sort(() => Math.floor(Math.random() * 2));
		}
	});
};

PaletteStudio.prototype.convertToColor = function convertToColor(arr) {
	return arr.map((colorStrip) => {
		return colorStrip.map((hex) => (color(hex)));
	});
};

PaletteStudio.prototype.toRGB = function toRGB(hex, alpha) {
	var clr = [ hex[1] + hex[2], hex[3] + hex[4], hex[5] + hex[6] ];

	return color.apply(p5, unhex(clr).concat(alpha));
};
