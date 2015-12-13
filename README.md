[![Build Status](https://travis-ci.org/unkelpehr/node-exit-hook.svg?branch=master)](https://travis-ci.org/unkelpehr/node-exit-hook)
[![npm version](https://badge.fury.io/js/exit-hook2.svg)](https://badge.fury.io/js/exit-hook2)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

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

- **context** An optional context for the 'callback' function. If `undefined`, the callback will have it's own context.
- **callback** A function to execute when the application is exiting.
  - **canCancel** When `true` the exit can be cancelled by returning `false`.
  - **signal** Originating signal (if any).
  - **code** Exit code.

A full list of exit codes can be found <a href="https://nodejs.org/api/process.html#process_exit_codes" target="_blank">here</a> (new window).

Returning `false` terminates the shutdown sequence and stops the callback loop. If the shutdown cannot be cancelled _('canCancel' = `false`)_ the callback loop will not stop running.

**If 'canCancel' is set to `false` only synchronous code can execute.** All asynchronous operations will be ignored.

**Graceful shutdown with asynchronous operations**
```javascript
exitHook(function (canCancel, signal, code) {
    if (canCancel) {
        exitHook.removeListener(this);
        
        server.close(function () {
            process.exit(code);
        });
        
        return false;
    }
});
```

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
- **signal** Shutdown signal to stop listening for. Pass `"everything"` to clear the module of _all_ shutdown signals.

### exitHook.removeListener
Removes a previously added shutdown listener.
```javascript
exitHook(function () {
    performCleanup();
    
    // Make sure the cleanup script isn't executed multiple times
    exitHook.removeListener(this);
});
```

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
