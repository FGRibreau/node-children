'use strict';

var _ = require('lodash');
var async = require('async');
var util = require("util");
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var exec = require('child_process').exec;
var noop = function () {};

var Child = require('./Child');

/**
 * Manage child processes
 * @param {String} workerPath File path to the module to fork
 * @param {Object|Undefined} options Option object
 */
function Children(workerPath, options) {
  if (!(this instanceof Children)) {
    return new Children(workerPath, options);
  }

  EventEmitter2.call(this, {
    wildcard: false
  });

  this.options = _.defaults(options || {}, Children.defaults);
  this.options.workerPath = workerPath;

  if (!this.options.resetEnv) {
    this.options.spawn_options.env = process.env;
  }

  // Children array
  this.childs = [];
  this._shuttingDown = false;

  if (this.options.autoRestart) {
    this.on('killed:child', this._autorespawn.bind(this));
  }

  if (this.options.killOnExit) {
    this._autokill();
  }
}

util.inherits(Children, EventEmitter2);

Children.prototype._autokill = function () {
  // in case of uncaughtException
  process.on('uncaughtException', function () {
    this.shutdown(function () {
      // done.
    });
  }.bind(this));

  // in case of usual exit
  process.on('exit', this._onExit.bind(this));
};

Children.prototype._onExit = function () {
  if (this._shuttingDown) {
    return;
  }

  // forEach( child => child.kill() did not worked);
  var cmd = 'kill -9 ' + this.pluck('pid').join(' ');
  exec(cmd, function (err, ok, ok2) {
    console.log(err, ok, ok2);
  });
};

Children.prototype._autorespawn = function (child) {
  if (this._shuttingDown) {
    return;
  }
  _.defer(function () {
    this.emit('respawning:child', child, this);
    child.spawn(function () {
      this.emit('respawned:child', child, this);
    }.bind(this));
  }.bind(this));
};

/**
 * Init children, emit "ready" when done
 * @param  {Function(Children)|Null} fn Callback when done
 */
Children.prototype.start = function (fn) {
  function initChild(id, fn) {
    var child = new Child(this, this.options);
    child.spawn(fn.bind(null, null, child));
  }

  function done(err, childs) {
    this.childs = childs;
    this.emit('ready', this);
    if (fn) {
      _.defer(fn.bind(null, this));
    }
  }

  async.times(this.options.childs,
    initChild.bind(this),
    done.bind(this)
  );
  return this;
};

/**
 * Shutdown all workers
 * @param  {Function(Children)|Undefined} fn Callback when done
 * @return {Children}
 */
Children.prototype.shutdown = function (fn) {
  this._shuttingDown = true;

  var iter = function (child, done) {
    child.kill(done);
  };
  var onDone = function () {
    this.childs = [];
    this.emit("shutdown", this);
    // if(fn){_.defer(fn.bind(null, this));}
    if (fn) {
      fn(this);
    }
  };

  async.each(this.childs, iter, onDone.bind(this));
  return this;
};


Children.prototype.send = function (obj) {
  this.invoke("send", obj);
};

/**
 * Useful helper for debug
 * @param  {Function} fn
 */
Children.prototype.debug = function (fn) {
  function debugFn(ev, child) {
    console.log(ev, child.pid);
  }

  ['read', 'shutdown', 'killing:child', 'killed:child', 'spawning:child', 'spawned:child'].forEach(function (ev) {
    this.on(ev, (fn || debugFn).bind(null, ev));
  }.bind(this));

  return this;
};

/**
 * Underscore/Lodash methods that we want to implement on the Childs Collection.
 * @ignore
 */
var array = [],
  slice = array.slice;
var methods = ['at', 'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
  'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
  'isEmpty', 'chain',
  // added
  'pluck'
];

// Mix in each Underscore method as a proxy to `Children#childs`.
_.each(methods, function (method) {
  Children.prototype[method] = function () {
    var args = slice.call(arguments);
    args.unshift(this.childs);
    return _[method].apply(_, args);
  };
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function (method) {
  Children.prototype[method] = function (value, context) {
    var iterator = _.isFunction(value) ? value : function (model) {
        return model.get(value);
      };
    return _[method](this.childs, iterator, context);
  };
});


/**
 * Children default options
 * @type {Object}
 */
Children.defaults = {
  /**
   * Number of childs to fork
   * @type {Number}
   */
  childs: require('os').cpus().length,

  /**
   * Reset the environment when forking child_processes
   * @type {Boolean}
   */
  resetEnv: false,

  /**
   * Auto-kill childrens on exit
   * @type {Boolean}
   */
  killOnExit: false,

  /**
   * Auto-restart dead process
   * @type {Boolean}
   */
  autoRestart: true,

  /**
   * Spawn option
   * @see http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
   * @type {Object}
   */
  spawn_options: {
    args: [],
    env: {}
  }
};

/**
 * Export
 * @ignore
 */
module.exports = Children;
