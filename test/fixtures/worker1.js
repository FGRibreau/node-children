process.title = "NodeWorker";
process.on('message', function(m) {
  console.log('CHILD got message:', m);
  process.send(m);
});

var i = 0;
setInterval(function(){
  i++;
console.log('ok');
}, 1000);
