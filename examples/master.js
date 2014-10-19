'use strict';

var manager = require('../');
var path = require('path');

var children = manager(path.resolve(__dirname, './child'), {
  autoRestart: true
});

children.on("message", function (m) {
  console.log("Master got...", m);
});

children.start(function () {
  children.send("ping");
});

setTimeout(function () {
  console.log("CLOSING...");
  children.shutdown(function () {
    console.log("DONE");
  });
}, 2000);
