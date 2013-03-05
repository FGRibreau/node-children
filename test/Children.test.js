var CPU_LENGTH = require('os').cpus().length;
var Children  = require('../lib/Children');
var path       = require('path');
var _          = require('lodash');

exports['Children'] = {
  setUp: function(done) {
    done();
  },

  '.constructor': function(t) {
    t.expect(1);
    var children = Children('fixtures/worker1.js');
    t.deepEqual(children.childs, []);
    t.done();
  },

  '.start (should emit ready)': function(t) {
    t.expect(4);

    var children = Children('fixtures/worker1.js',{autoRestart:false});

    children.once('ready', function(_children){
      t.deepEqual(_children, children);
      t.equal(children.childs.length, CPU_LENGTH);

      children.once('shutdown', function(_children){
        t.deepEqual(_children, children);
        t.done();
      });

      children.shutdown();
    });

    t.deepEqual(children.start(), children);
  },

  '.shutdown should not emit "respawn:child"': function(t) {
    t.expect(0);

    var children = Children('fixtures/worker1.js',{autoRestart:true});
    children.once('ready', function(_children){
      children.on('respawn:child', function(){
        t.ok(false, "respawn:child should not be called in save of shutdown");
      });

      children.once('shutdown', function(_children){
        t.done();
      });

      children.shutdown();
    });

    children.start();
  },

  '.start should emit events spawn:child event for each child': function(t){
    t.expect(8);
    var children = Children('fixtures/worker1.js', {childs:4});
    children.on('spawning:child', function(child){
      t.ok(!child.__passed__, "spawning:child");
      child.__passed__ = true;
    });

    children.on('spawned:child', function(child){
      t.ok(!child.__passed2__, "spawned:child");
      child.__passed2__ = true;
    });

    children.start(function(){
      children.shutdown(t.done.bind(t, null));
    });
  },

  '.constructor should call the ready listener': function(t) {
    t.expect(1);
    var children = Children('fixtures/worker1.js');

    children.once('ready', function(){
      t.ok(true);
      children.shutdown(t.done.bind(t, null));
    });
    children.start();
  },

  '.constructor (with options)': function(t) {
    var children = Children('fixtures/worker1.js', {childs:2});

    children.once('ready', function(){
      t.equal(children.childs.length, 2);
      children.shutdown(t.done.bind(t, null));
    });
    children.start();
  },

  '(autoRestart: true) should respawn dead children': function(t) {
    t.expect(3);
    var children = Children(path.resolve(__dirname, './fixtures/worker2.js'), {childs:1});
    var respawned = false;
    var wasKilled = null;
    children.start(function(){
      var pids = children.pluck('pid');

      children.once('killed:child', function(child){
        wasKilled = child.pid;
        t.ok(pids.indexOf(child.pid) !== -1, "the child should be killed");
      });

      children.once('respawning:child', function(child){
        t.ok(pids.indexOf(child.pid) !== -1, "respawn the first child");
      });

      children.once('respawned:child', function(child){
        t.deepEqual(_.reject(pids, function(pid){return pid === wasKilled;}).length, 0);
        children.shutdown(function(){
          t.done();
        });
      });

      // Waiting for the child to die
    });
  },

  '(autoRestart: false) should not respawn dead children': function(t) {
    t.expect(1);
    var children = Children(path.resolve(__dirname, './fixtures/worker2.js'), {childs:1, autoRestart:false});

    children.start(function(){
      children.once('killed:child', function(child){
        t.ok(true, "the child should die");

        children.shutdown(function(){
          t.done();
        });
      });

      children.once('respawning:child', function(child){
        t.ok(false, "should not be called");
      });

      children.once('respawned:child', function(child){
        t.ok(false, "should not be called");
      });
      // Waiting for the child to die
    });
  },

  '.send':function(t){
    t.expect(2);

    var children = Children(path.resolve(__dirname, './fixtures/workerPingPong.js'), {childs:2});

    var i = 0;
    children.on('message', function(m){
      t.ok(m, "pong");
      if(++i == 2){

        children.shutdown(function(){
          t.done();
        });
      }
    });

    children.start(function(){
      children.send("ping");
    });

  }
};
