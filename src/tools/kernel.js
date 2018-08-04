'use strict';

// for each image row in input image:
//    for each pixel in image row:
//
//       set accumulator to zero
//
//       for each kernel row in kernel:
//          for each element in kernel row:
//
//             if element position  corresponding* to pixel position then
//                multiply element value  corresponding* to pixel value
//                add result to accumulator
//             endif
//
//       set output image pixel to accumulator
// *corresponding input image pixels are found relative to the kernel's origin.

const OPERATIONS = {
  blur: [
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ],
  gaussian: [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ],
  sharpen: [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ],
  edge1: [
    1, 0, -1,
    0, 0, 0,
   -1, 0, 1
  ],
  edge2: [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ],
  edge3: [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ]
};

const NAVIGATION = {
  '3x3': [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0], [0,  0], [1,  0],
    [-1,  1], [0,  1], [1,  1],
  ],
  '5x5': [
    [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2],
    [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1],
    [-2,  0], [-1,  0], [0,  0], [1,  0], [2,  0],
    [-2,  1], [-1,  1], [0,  1], [1,  1], [2,  1],
    [-2,  2], [-1,  2], [0,  2], [1,  2], [2,  2],
  ]
};

function Kernel(k, imageWidth, imageHeight) {
  const kernel = 2*k + 1;

  this._kernel = kernel;
  this._pixels = kernel * kernel;
  this._imageWidth = imageWidth;
  this._imageHeight = imageHeight;
}

Kernel.prototype.applyOperation = function applyOperation(type, pixels, density) {
  density = density || 1;

  const kernel = this._kernel;
  const grid = kernel + 'x' + kernel;
  const gps = NAVIGATION[grid];
  const operation = OPERATIONS[type];
  const imageWidth = this._imageWidth;
  const imageHeight = this._imageHeight;

  var r, g, b, a;

  if (!grid || !operation) {
    throw new Error('There\'s no defined grid or operation');
  }

  for (let x = 0; x < imageWidth; x++) {
    for (let y = 0; y < imageHeight; y++) {
      for (var i = 0; i < density; i++) {
        for (var j = 0; j < density; j++) {

          let accumulator = [ 0, 0, 0, 0 ];

          let index;

          for (let loc = 0; loc < gps.length; loc++) {
            let coord = gps[loc];
            let weight = operation[loc];
            let lat = coord[0];
            let lon = coord[1];

            if (((x + lat) * density + i) < 0 || ((y + lon) * density + j) < 0) {
              continue;
            }

            index = (((x + lat) * density + i) + ((y + lon) * density + j) * imageWidth) * density * 4;

            if (typeof pixels[index] === 'undefined') {
              continue;
            }

            accumulator[0] += pixels[index] * weight;
            accumulator[1] += pixels[index + 1] * weight;
            accumulator[2] += pixels[index + 2] * weight;
            accumulator[3] += pixels[index + 3] * weight;
          }

          index = (x + y * imageWidth) * density * 4;

          if (type === 'blur') {
            accumulator[0] /= 9;
            accumulator[1] /= 9;
            accumulator[2] /= 9;
            accumulator[3] /= 9;
          }

          if (type === 'gaussian') {
            accumulator[0] /= 16;
            accumulator[1] /= 16;
            accumulator[2] /= 16;
            accumulator[3] /= 16;
          }

          pixels[index] = accumulator[0];
          pixels[index + 1] = accumulator[1];
          pixels[index + 2] = accumulator[2];
          pixels[index + 3] = accumulator[3];
        }
      }
    }
  }
};
