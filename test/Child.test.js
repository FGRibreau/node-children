var Child        = require('../lib/Child');
var EventEmitter = require('events').EventEmitter;
var path         = require('path');

exports['Child'] = {
  setUp: function(done) {
    done();
  },

  '.constructor': function(t) {
    var em = new EventEmitter();
    var child = new Child(em, new path.resolve(__dirname, './fixtures/worker1.js'));
    t.deepEqual(child._process, null);
    t.done();
  },

  '.spawn & kill': function(t){
    t.expect(12);

    var em = new EventEmitter();
    var child = new Child(em, {workerPath:path.resolve(__dirname, './fixtures/worker1.js')});

    em.once('spawning:child', function(_child, childrens){
      // console.log('spawning:child');
      t.deepEqual(childrens, em, 'spawning:child');
      t.deepEqual(child, _child, 'spawning:child');
    });

    em.once('spawned:child', function(_child, childrens){
      // console.log('spawned:child');
      t.deepEqual(childrens, em, 'spawned:child');
      t.deepEqual(child, _child, 'spawned:child');
      t.deepEqual(child.kill(), child, "@chainable");
    });

    em.once('killing:child', function(_child, childrens){
      // console.log('killing:child');
      t.deepEqual(childrens, em, 'killing:child');
      t.deepEqual(child, _child, 'killing:child');
    });

    em.once('killed:child', function(_child, childrens, exitCode, signalCode){
      // console.log('killed:child');
      t.deepEqual(childrens, em, 'killed:child');
      t.deepEqual(child, _child, 'killed:child');
      console.log(exitCode, signalCode);
      t.equal(exitCode, null, 'killed:child');
      t.equal(signalCode, 'SIGTERM', 'killed:child');
      t.done();
    });

    t.deepEqual(child.spawn(), child, "@chainable");
  },

  '.kill should work even if the process is already dead': function(t){
    t.expect(2);
    var em    = new EventEmitter();
    var child = new Child(em, {workerPath:path.resolve(__dirname, './fixtures/worker1.js')});

    child.spawn();
    t.equal(child._process.killed, false);
    child.kill(function(){
      t.equal(child._process.killed, true);
      t.done();
    });

    child.kill();
  },

  '.spawn should setup the listener & .send should forward the message to inne process': function(t){
    t.expect(1);
    var em    = new EventEmitter();
    var child = new Child(em, {workerPath:path.resolve(__dirname, './fixtures/workerPingPong.js')});

    em.on('message', function(m){
      t.equal(m, "pong");
      child.kill(function(){
        t.done();
      });
    });

    child.spawn(function(){
      child.send("ping");
    });
  }

};

