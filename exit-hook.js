// Licenced under MIT - exit-hook - ©2015 Pehr Boman <github.com/unkelpehr>
'use strict';

var funcs = [],
	win32 = process.platform === 'win32',
	bound = {};

// Handler for all exit events
function handleExit (canCancel, signal, code) {
	var i = 0,
		func;

	while ((func = funcs[i++])) {
		if (func.call(exitHook, canCancel, signal, code) === false && canCancel) {
			return;
		}
	}

	if (canCancel) {
		process.exit(code);
	}
};

//  Adds a new function to execute when the application is exiting.
function exitHook (func) {
	if (typeof func === 'function') {
		funcs.push(func)
	}

	return exitHook;
};

// Binds a new event to treat as a shutdown signal.
exitHook.bind = function (signal, canCancel) {
	if (signal && typeof signal === 'string' && !bound[signal]) {
		bound[signal] = function (code) {
			handleExit(canCancel, signal, code);
		};

		process.on(signal, bound[signal]);
	}

	return exitHook;
};

// Unbinds a previously bound shutdown signal.
exitHook.unbind = function (signal) {
	if (bound[signal]) {
		process.removeListener(signal, bound[signal]);
		delete bound[signal];
	} else if (signal === 'everything') {
		Object.keys(bound).forEach(function (signal) {
			process.removeListener(signal, bound[signal]);
			delete bound[signal];
		});
	}

	return exitHook;
};

// Returns an array with all the events currently listened to.
exitHook.list = function () {
	return Object.keys(bound);
};

// SIGINT from the terminal is supported on all platforms, and can usually be generated with
// CTRL+C (though this may be configurable). It is not generated when terminal raw mode is enabled.
exitHook.bind('SIGINT', true);

// SIGTERM is not supported on Windows but it can be listened for.
exitHook.bind('SIGTERM', true);

// SIGBREAK is delivered on Windows when CTRL+BREAK is pressed.
// There is no way to send or generate it.
exitHook.bind('SIGBREAK', true);

// SIGHUP is generated on Windows when the console window is closed and will unconditionally terminate the application about 5 seconds later.
// SIGHUP is generated on non-Windows platforms under various similar conditions but once listened to its default behaviour is removed.
// 
// On non-Windows platforms we will effectively bring back its default behaviour to terminate Node.js (albeit cancellable).
exitHook.bind('SIGHUP', !win32);

// Emitted when Node.js empties its event loop and has nothing else to schedule.
exitHook.bind('beforeExit', false);

// Emitted right before the process is about to exit and once all 'exit' listeners have finished the process will exit.
exitHook.bind('exit', false);

module.exports = exitHook;