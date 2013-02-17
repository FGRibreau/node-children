var fork = require('child_process').fork;
var noop  = function(){};

function Child(em, options){
  this.options       = options || {};
  this.em       = em;
  this._process = null;
}

/**
 * Spawn a child
 */
Child.prototype.spawn = function(fnDone){
  // Kill the child if it was already launched
  this.kill();

  this.em.emit('spawning:child', this, this.em);
  this._process = fork(this.options.workerPath, this.options.args, this.options.spawn_options);
  this.em.emit('spawned:child', this, this.em);

  this._process.on('exit', function(exitCode, signalCode){
    this.em.emit('killed:child', this, this.em, exitCode, signalCode);
  }.bind(this));

  return this;
};

/**
 * Kill the child (it will never be re-used again)
 * @param  {Function|Undefined} fnDone
 */
Child.prototype.kill = function(fn){
  if(!this._process || (this._process && this._process.killed)){return this;}
  this.em.emit('killing:child', this, this.em);
  this._process.removeAllListeners();
  if(fn){
    // fn(err, val, exitCode, signalCode)
    this._process.on('exit', fn.bind(null, null, null));
  }
  this._process.kill();
  return this;
};

module.exports = Child;
