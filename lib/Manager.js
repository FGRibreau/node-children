var _             = require('lodash');
var async         = require('async');
var util          = require("util");
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var Q             = require('q');
var noop          = function(){};

var Child         = require('./Child');

/**
 * Manage child processes
 * @param {String} workerPath
 * @param {Object|Undefined} options
 */
function Manager(workerPath, options){
  if(!(this instanceof Manager)){
    return new Manager(workerPath, options);
  }

  EventEmitter2.call(this, {wildcard: false});

  this.options = _.defaults(options || {}, Manager.defaults);
  this.options.workerPath = workerPath;

  if(!this.options.resetEnv){
    this.options.spawn_options.env = process.env;
  }

  /**
   * Childrens array
   * @type {Array} Array of Child
   */
  this.childs  = [];
}

util.inherits(Manager, EventEmitter2);

/**
 * Init childrens, emit "ready" when done
 * @param  {Function(manager)|Null} fn Callback when done
 */
Manager.prototype.start = function(fn){
  function initChild(id, fn){
    fn(null, new Child(this, this.options).spawn());
  }

  function done(err, childs){
    this.childs = childs;
    this.emit('ready', this);
    if(fn){fn(this);}
  }

  async.times(this.options.childs,
    initChild.bind(this),
    done.bind(this)
  );
  return this;
};

/**
 * Shutdown all workers
 * @param  {Function(manager)|Null} fn Callback when done
 * @return {Manager}
 */
Manager.prototype.shutdown = function(fn){
  function iter(child, fn){
    child.kill(fn);
  }
  function onDone(){
    this.childs = [];
    this.emit("shutdown", this);
    if(fn){fn(this);}
  }
  async.each(this.childs, iter, onDone.bind(this));
  return this;
};

Manager.defaults = {
  /**
   * Number of childs to fork
   * @type {Number}
   */
  childs: require('os').cpus().length,

  /**
   * Reset the environment
   * @type {Boolean}
   */
  resetEnv: false,

  /**
   * Spawn option
   * @type {Object}
   */
  spawn_options:{
    args:[],
    env:{}
  }
};

module.exports = Manager;
