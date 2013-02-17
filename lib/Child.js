var fork   = require('child_process').fork;
var assert = require('assert');
var _      = require('lodash');
var noop   = function(){};

function Child(em, options){
  this.options  = options || {};
  this.em       = em;
  this.pid      = 0;
  this._process = null;
}

/**
 * Send a message to the child_process
 * @param {Mixed} message message to send
 */
Child.prototype.send = function(message){
  if(this.isDead()){return;}
  this._process.send(message);
};

/**
 * Spawn a child
 */
Child.prototype.spawn = function(fn){
  // Kill the child if it was already launched
  this.kill();

  this.em.emit('spawning:child', this, this.em);
  this._process = fork(this.options.workerPath, this.options.args, this.options.spawn_options);
  this._process.on('message', this.em.emit.bind(this.em, "message"));
  this.em.emit('spawned:child', this, this.em);
  this.pid      = this._process.pid;
  if(fn){_.defer(fn);}
  this._process.on('exit', function(exitCode, signalCode){
    this.em.emit('killed:child', this, this.em, exitCode, signalCode);
  }.bind(this));

  return this;
};

Child.prototype.isDead = function(){
  return !this._process || (this._process && (this._process.killed || !this._process.connected));
};

/**
 * Kill the child (it will never be re-used again)
 * @param  {Function|Undefined} fnDone
 */
Child.prototype.kill = function(fn){
  if(this.isDead()){
    if(fn){_.defer(fn);}
    return this;
  }

  this.em.emit('killing:child', this, this.em);
  this._process.removeAllListeners();
  if(fn){
    // fn(err, val, exitCode, signalCode)
    this._process.on('exit', function(){
      _.defer(fn);
    });
  }
  this._process.kill();
  return this;
};

module.exports = Child;
