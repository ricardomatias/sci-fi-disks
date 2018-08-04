'use strict';

function Particle(x, y, options) {
  x = x || 0;
  y = y || 0;
  options = options || {};

  const speed = options.speed || 0,
        direction = options.direction || 0,
        maxSpeed = options.maxSpeed || 0;

  this.pos = createVector(x, y);
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxSpeed = maxSpeed;

  if (speed) {
    this.vel.setMag(speed);
  }

  if (direction) {
    this.vel.rotate(direction);
  }
}

Particle.prototype.applyForce = function applyForce(force) {
  this.acc.add(force);
};

Particle.prototype.handleEdges = function handleEdges() {
  if (this.pos.x > width) {
    this.pos.x = 0;
    // this.updatePrev();
  }
  if (this.pos.x < 0) {
    this.pos.x = width;
    // this.updatePrev();
  }
  if (this.pos.y > height) {
    this.pos.y = 0;
    // this.updatePrev();
  }
  if (this.pos.y < 0) {
    this.pos.y = height;
    // this.updatePrev();
  }
};

Particle.prototype.update = function update() {
  this.vel.add(this.acc);

  if (this.maxSpeed) {
    this.vel.limit(this.maxSpeed);
  }

  this.pos.add(this.vel);

  this.acc.mult(0);
};
