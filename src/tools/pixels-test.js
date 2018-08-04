function PixelsTest(number, pixelSize) {
	this.nrOfPixels = number;
	this.pixelSize = pixelSize;
	this.pixels = [];
}

PixelsTest.prototype.draw = function(pixels, width, offset) {
	const size = this.pixelSize;
	var r, g, b, a;
	var index = 0;

	offset = offset || 0;

	for (let x = 0; x < this.nrOfPixels; x++) {
		for (let y = 0; y < this.nrOfPixels; y++) {

			let posX = offset + x + size * x;
			let posY = y + size * y;

			if (pixels) {
				var d = 1; // set these to the coordinates
				var off = (y * width + x) * d * 4;

				r = pixels[off],
				g = pixels[off + 1],
				b = pixels[off + 2],
				a = pixels[off + 3];

				this.pixels.push(r, g, b, a);
			} else {
				r = this.pixels[index],
				g = this.pixels[index + 1],
				b = this.pixels[index + 2],
				a = this.pixels[index + 3];

				index += 4;
			}

			fill(color(r, g, b, a));
			rect(posX, posY, size, size);
		}
	}
};
