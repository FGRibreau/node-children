process.on('message', function(m){
  process.send("pong");
});

var i = 0;
setInterval(function(){
  console.log('ok');
  i++;
}, 1000);

