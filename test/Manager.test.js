var CPU_LENGTH = require('os').cpus().length;
var Childrens = require('../lib/Manager');

exports['Manager'] = {
  setUp: function(done) {
    done();
  },

  '.constructor': function(t) {
    t.expect(1);
    var childrens = Childrens('fixtures/worker1.js');
    t.deepEqual(childrens.childs, []);
    t.done();
  },

  '.start': function(t) {
    t.expect(4);

    var childrens = Childrens('fixtures/worker1.js');

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

  '.constructor should call the ready listener': function(t) {
    t.expect(1);
    var childrens = Childrens('fixtures/worker1.js');

    childrens.once('ready', function(){
      t.ok(true);
      childrens.once('shutdown', function(){
        t.done();
      });
      childrens.shutdown();
    });
    childrens.start();
  },

  '.constructor (with options)': function(t) {
    var childrens = Childrens('fixtures/worker1.js', {childs:2});

    childrens.once('ready', function(){
      t.equal(childrens.childs.length, 2);
      childrens.shutdown(function(){
        t.done();
      });
    });
    childrens.start();
  },

  '.run should emit events spawn:child event for each child': function(t){
    // childrens.on('spawn:child', function(){

    // });
    //
    t.done();
  }
};
