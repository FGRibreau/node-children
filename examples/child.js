'use strict';

setInterval(function () {
  console.log("Working...", process.pid);

  // Simulate crash
  if (Math.random() * 500 < 10) {
    console.error("Crashing...", process.pid);
    process.exit();
  }
}, 100);

process.on('message', function (m) {
  console.log("Child got....", m);
  process.send("pong");
});
