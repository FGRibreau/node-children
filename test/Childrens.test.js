var CPU_LENGTH = require('os').cpus().length;
var Childrens  = require('../lib/Childrens');
var path       = require('path');
var _          = require('lodash');

exports['Childrens'] = {
  setUp: function(done) {
    done();
  },

  '.constructor': function(t) {
    t.expect(1);
    var childrens = Childrens('fixtures/worker1.js');
    t.deepEqual(childrens.childs, []);
    t.done();
  },

  '.start (should emit ready)': function(t) {
    t.expect(4);

    var childrens = Childrens('fixtures/worker1.js',{autoRestart:false});

    childrens.once('ready', function(_childrens){
      t.deepEqual(_childrens, childrens);
      t.equal(childrens.childs.length, CPU_LENGTH);

      childrens.once('shutdown', function(_childrens){
        t.deepEqual(_childrens, childrens);
        t.done();
      });

      childrens.shutdown();
    });

    t.deepEqual(childrens.start(), childrens);
  },

  '.shutdown should not emit "respawn:child"': function(t) {
    t.expect(0);

    var childrens = Childrens('fixtures/worker1.js',{autoRestart:true});
    childrens.once('ready', function(_childrens){
      childrens.on('respawn:child', function(){
        t.ok(false, "respawn:child should not be called in save of shutdown");
      });

      childrens.once('shutdown', function(_childrens){
        t.done();
      });

      childrens.shutdown();
    });

    childrens.start();
  },

  '.start should emit events spawn:child event for each child': function(t){
    t.expect(8);
    var childrens = Childrens('fixtures/worker1.js', {childs:4});
    childrens.on('spawning:child', function(child){
      t.ok(!child.__passed__, "spawning:child");
      child.__passed__ = true;
    });

    childrens.on('spawned:child', function(child){
      t.ok(!child.__passed2__, "spawned:child");
      child.__passed2__ = true;
    });

    childrens.start(function(){
      childrens.shutdown(t.done.bind(t, null));
    });
  },

  '.constructor should call the ready listener': function(t) {
    t.expect(1);
    var childrens = Childrens('fixtures/worker1.js');

    childrens.once('ready', function(){
      t.ok(true);
      childrens.shutdown(t.done.bind(t, null));
    });
    childrens.start();
  },

  '.constructor (with options)': function(t) {
    var childrens = Childrens('fixtures/worker1.js', {childs:2});

    childrens.once('ready', function(){
      t.equal(childrens.childs.length, 2);
      childrens.shutdown(t.done.bind(t, null));
    });
    childrens.start();
  },

  '(autoRestart: true) should respawn dead childrens': function(t) {
    t.expect(3);
    var childrens = Childrens(path.resolve(__dirname, './fixtures/worker2.js'), {childs:1});
    var respawned = false;
    var wasKilled = null;
    childrens.start(function(){
      var pids = childrens.pluck('pid');

      childrens.once('killed:child', function(child){
        wasKilled = child.pid;
        t.ok(pids.indexOf(child.pid) !== -1, "the child should be killed");
      });

      childrens.once('respawning:child', function(child){
        t.ok(pids.indexOf(child.pid) !== -1, "respawn the first child");
      });

      childrens.once('respawned:child', function(child){
        t.deepEqual(_.reject(pids, function(pid){return pid === wasKilled;}).length, 0);
        childrens.shutdown(function(){
          t.done();
        });
      });

      // Waiting for the child to die
    });
  },

  '(autoRestart: false) should not respawn dead childrens': function(t) {
    t.expect(1);
    var childrens = Childrens(path.resolve(__dirname, './fixtures/worker2.js'), {childs:1, autoRestart:false});

    childrens.start(function(){
      childrens.once('killed:child', function(child){
        t.ok(true, "the child should die");

        childrens.shutdown(function(){
          t.done();
        });
      });

      childrens.once('respawning:child', function(child){
        t.ok(false, "should not be called");
      });

      childrens.once('respawned:child', function(child){
        t.ok(false, "should not be called");
      });
      // Waiting for the child to die
    });
  },

  '.send':function(t){
    t.expect(2);

    var childrens = Childrens(path.resolve(__dirname, './fixtures/workerPingPong.js'), {childs:2});

    var i = 0;
    childrens.on('message', function(m){
      t.ok(m, "pong");
      if(++i == 2){

        childrens.shutdown(function(){
          t.done();
        });
      }
    });

    childrens.start(function(){
      childrens.send("ping");
    });

  }
};
