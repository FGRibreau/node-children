Node Children [![Build Status](https://drone.io/github.com/FGRibreau/node-children/status.png)](https://drone.io/github.com/FGRibreau/node-children/latest) [![Gittip](http://badgr.co/gittip/fgribreau.png)](https://www.gittip.com/fgribreau/)
==============


Concurrent tasks computation among nodejs child processes

### Features
* Evented API (with [EventEmitter2](https://github.com/hij1nx/EventEmitter2))
* Auto-respawn of dead processes
* Underscore methods available on child process collections

## NPM
Install the module with: `npm install children`

## [Documentation](http://fgribreau.github.com/node-children/docs/index.html)

## Usage
```javascript
var children = require('children')(path.resolve(__dirname, './worker2.js'), {
  // @see Manager.defaults
});

children.start(function(){
  // Or listen to the `ready` event

  children.send("hello world");
});
```

`children` is a collection of child process that implements [~28 underscore methods](http://backbonejs.org/#Collection-Underscore-Methods)

```javascript
> children.pluck('pid')
[ 47494, 47495, 47496, 47497 ]
```


## Available events
`ready(children)`
`respawning:child(child, children)`
`spawning:child(child, children)`
`spawned:child(child, children)`
`killing:child(child, children)`
`killed:child(child, children, exitCode, signalCode)`

## Todo
* Update documentation
* Better examples

## Release History
v0.1.0 - Initial commit (17 fev. 2012)

## Donate
[Donate Bitcoins](https://coinbase.com/checkouts/fc3041b9d8116e0b98e7d243c4727a30)

## License
Copyright (c) 2013 Francois-Guillaume Ribreau
Licensed under the MIT license.
