[![Build Status](https://travis-ci.org/unkelpehr/node-exit-hook.svg?branch=master)](https://travis-ci.org/unkelpehr/node-exit-hook)

# node-exit-hook

> Node.js cancellable exit-hooks



## Installation

```
npm install exit-hook2 --save
```

## Usage

```javascript
var exitHook = require('exit-hook')

exitHook(function (canCancel, signal, code) {
    var allowShutdown = canCancel && false;
    
    return allowShutdown;
});
```

- **callback** A function to execute when the application is exiting.
  - **canCancel** When `true` the exit can be cancelled by returning `false`.
  - **signal** Originating signal (if any).
  - **code** Exit code.

A full list of exit codes can be found <a href="https://nodejs.org/api/process.html#process_exit_codes" target="_blank">here</a> (new window).

Returning `false` terminates the shutdown sequence and stops the callback loop. If the shutdown cannot be cancelled _('canCancel' = `false`)_ the callback loop will not stop running.

### exitHook.list
Returns an array with all the events currently listened to.
```javascript
var list = exitHook.list(); // ['SIGINT', 'SIGTERM', 'SIGHUP', ...]
```

### exitHook.bind
Binds a new event to treat as a shutdown signal.
```javascript
exitHook.bind('CUSTOM1', true).list(); // ['SIGINT', 'SIGTERM', 'SIGHUP', 'CUSTOM1', ...]
```
- **signal** Shutdown signal to listen for.
- **canCancel** Boolean passed to the handlers signaling whether the shutdown can be cancelled.

### exitHook.unbind
Unbinds a previously bound shutdown signal.
```javascript
exitHook.unbind('CUSTOM1').list(); // ['SIGINT', 'SIGTERM', 'SIGHUP', ...]
exitHook.unbind('SIGTERM').list(); // ['SIGINT', 'SIGHUP', ...]
```
- **signal** Shutdown signal to stop listening for. **Pass `"everything"` to clear the module of _all_ shutdown signals.**

### Custom events
```javascript
// Let 'CUSTOM1' act as a cancellable shutdown signal
exitHook.bind('CUSTOM1', true);

exitHook(function (canCancel, signal, code) {
    canCancel; // true
    signal; // CUSTOM1
    code; // 128
    
    // Don't let the process terminate
    return false;
});

process.emit('CUSTOM1', 128);
```

## License

MIT
