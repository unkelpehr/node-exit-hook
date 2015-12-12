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

});
```

- **callback** A function to execute when the application is exiting.
  - **canCancel** When `true` the exit can be cancelled by returning `false`.
  - **signal** Originating signal (if any).
  - **code** Exit code.

A full list of exit codes can be found <a href="https://nodejs.org/api/process.html#process_exit_codes" target="_blank">here</a> (new window)


## License

MIT
