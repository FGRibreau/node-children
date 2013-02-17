var manager = require('../');
var path    = require('path');

var childrens = manager(path.resolve(__dirname, './child'),{
  autoRestart: true
});

childrens.on("message", function(m){
  console.log("Master got...", m);
});

childrens.start(function(){
  childrens.send("ping");
});

setTimeout(function(){
  console.log("CLOSING...");
  childrens.shutdown(function(){
    console.log("DONE");
  });
}, 2000);

