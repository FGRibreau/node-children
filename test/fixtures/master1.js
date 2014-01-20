var Children = require('../../');
var path     = require('path');

var children = Children(path.resolve(__dirname, './workerPingPong.js'), {
  childs:2,
  killOnExit: true
});

children.start(function(){
  console.log(children.pluck('pid'));
  throw new Error();
});
