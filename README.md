node-childrens
==============

Concurrent tasks computation among nodejs child processes

### Features


* evented API
* auto-respawn dead processes

### NPM


```
npm install childrens
```

Events
======

`ready(childrens)`
`spawning:child(child, childrens)`
`spawned:child(child, childrens)`
`killing:child(child, childrens)`
`killed:child(child, childrens, exitCode, signalCode)`
