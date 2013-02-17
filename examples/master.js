var manager = require('../');
var path    = require('path');

var childrens = manager(path.resolve(__dirname, './child'));

childrens.start();
setTimeout(function(){
  console.log("CLOSING...");
  childrens.shutdown(function(){
    console.log("DONE");
  });
}, 2000);
