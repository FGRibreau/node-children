Node Childrens [![Build Status](https://drone.io/github.com/FGRibreau/node-childrens/status.png)](https://drone.io/github.com/FGRibreau/node-childrens/latest)
==============

Concurrent tasks computation among nodejs child processes

### Features
* Evented API (with [EventEmitter2](https://github.com/hij1nx/EventEmitter2))
* Auto-respawn of dead processes
* Underscore methods available on child process collections

## NPM
Install the module with: `npm install childrens`

## [Documentation](http://fgribreau.github.com/node-childrens/docs/index.html)

## Usage
```javascript
var childrens = require('childrens')(path.resolve(__dirname, './worker2.js'), {
  // @see Manager.defaults
});

childrens.start(function(){
  // Or listen to the `ready` event

  childrens.send("hello world");
});
```

`childrens` is a collection of child process that implements [~28 underscore methods](http://backbonejs.org/#Collection-Underscore-Methods)

```javascript
> childrens.pluck('pid')
[ 47494, 47495, 47496, 47497 ]
```


## Available events
`ready(childrens)`
`respawning:child(child, childrens)`
`spawning:child(child, childrens)`
`spawned:child(child, childrens)`
`killing:child(child, childrens)`
`killed:child(child, childrens, exitCode, signalCode)`

## Todo
* Update documentation
* Better examples

## Release History
v0.1.0 - Initial commit (17 fev. 2012)

## License
Copyright (c) 2013 Francois-Guillaume Ribreau
Licensed under the MIT license.
