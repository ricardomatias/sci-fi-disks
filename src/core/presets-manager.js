'use strict';

function PresetsManager(options) {
  options = options || {};

  this._active = null;
  this._defaults = {};
  this._guiControls = {};
  this._presets = [];
  this._setups = {};

  this._datGui = options.datGui ? new dat.GUI() : null;
}

PresetsManager.prototype._runSetup = function(ignoreDatGuiSetup) {
  var preset = this._active,
      defaults = this._defaults[preset],
      guiControls = this._guiControls[preset];

  if (preset && !this._setups[preset]) {
    throw new Error('Presets setup has to be done before selection.');
  }

  if (this._setups[preset]) {
    this._setups[preset](defaults);

    if (!ignoreDatGuiSetup && guiControls) {
      this._setupDatGui(preset, defaults, guiControls);
    }
  }
};

PresetsManager.prototype._setupDatGui = function(preset, defaults, guiControls) {
  const runSetupOnGuiChange = this._runSetupOnGuiChange;

  const datGui = new dat.GUI({
    preset: preset
  });

  for (let prop in guiControls) {
    if (guiControls.hasOwnProperty(prop)) {
      let controller;

      if (guiControls[prop].color) {
        controller = datGui.addColor(guiControls[prop], prop);
      } else {
        controller = datGui.add.apply(datGui, [defaults, prop].concat(guiControls[prop]));
      }

      if (runSetupOnGuiChange && runSetupOnGuiChange.indexOf(prop) !== -1) {
        controller.onChange(() => {
          this._runSetup(true);
        });
      }
    }
  }
};

PresetsManager.prototype.getDatGui = function() {
  return this._datGui;
};

PresetsManager.prototype.getActiveName = function() {
  return this._active;
};

PresetsManager.prototype.getActivePreset = function() {
  return {
    name: this._active,
    defaults: this._defaults[this._active],
  };
};

PresetsManager.prototype.register = function(name, defaults, guiControls, runSetupOnGuiChange) {
  this._presets.push(name);

  this._defaults[name] = defaults;
  this._guiControls[name] = guiControls;
  this._runSetupOnGuiChange = runSetupOnGuiChange || false;
};

PresetsManager.prototype.registerMultiple = function(presets, defaults, guiControls) {
  presets.forEach(function(preset) {
    this._presets.push(preset);

    this._defaults[preset] = defaults;
    this._guiControls[preset] = guiControls;
  }, this);
};

PresetsManager.prototype.selectNext = function() {
  var presets = this._presets;

  var curr = presets.indexOf(this._active),
      index = curr + 1;

  if (index > presets.length - 1) {
    index = 0;
  }

  this.select(presets[index]);

  this._runSetup();
};

PresetsManager.prototype.selectPrevious = function() {
  var presets = this._presets;

  var curr = presets.indexOf(this._active),
      index = curr - 1;

  if (index < 0) {
    index = presets.length - 1;
  }

  this.select(presets[index]);

  this._runSetup();
};

PresetsManager.prototype.selectRandom = function() {
  var presets = this._presets;

  var randInt = Math.floor(Math.random() * this._presets.length);

  this.select(presets[randInt]);

  this._runSetup();
};

PresetsManager.prototype.select = function(name) {
  this._active = name;

  this._runSetup();

  /* eslint "no-console": 0 */
  console.log('%cPRESET: ' + name, 'background-color: black; color: white;');
};

PresetsManager.prototype.setup = function(presets, fn, that) {
  if (!Array.isArray(presets)) {
    presets = [ presets ];
  }

  presets.forEach(function(preset) {
    if (that) {
      fn = fn.bind(that);
    }

    this._setups[preset] = fn;
  }, this);
};

/**
 * Two ways of running:
 * - specific presets -> different implementation
 * - preset-agnostic -> same implementation, different values
 */
PresetsManager.prototype.draw = function(name, fn, that) {
  var presets;

  if (!this._active) {
    throw new Error('No preset selected. Won\'t be drawing anything today.');
  }

  if (Array.isArray(name)) {
    presets = name;
    name = this._active;

    if (presets.indexOf(name) !== -1) {

      if (that) {
        fn = fn.bind(that);
      }

      return fn(this._defaults[name]);
    }
  } else if (name === this._active) {

    if (that) {
      fn = fn.bind(that);
    }

    return fn(this._defaults[name]);
  }

  if (typeof name === 'function' && this._active) {
    fn = name;

    if (that) {
      fn = fn.bind(that);
    }

    return fn(this._defaults[this._active]);
  }
};
