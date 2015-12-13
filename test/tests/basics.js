'use strict';

var expect = require('chai').expect,
	exitHook = require('../../exit-hook.js');

function requireExitHook () {
	var keys, key, i;

	if (exitHook) {
		exitHook.unbind('everything');

		i = 0;
		keys = Object.keys(require.cache);

		while ((key = keys[i++])) {
			if (key.substr(-12) === 'exit-hook.js') {
				delete require.cache[key];
				break;
			}
		}
	}
	
	return require('../../exit-hook.js');
}

describe('API', function () {
	var exitHook = requireExitHook();

	it('exit-hook is a function that take two arguments and returns exit-hook', function () {
		expect(exitHook).to.be.a('function');
		expect(exitHook.length).to.equal(2);
		expect(exitHook()).to.equal(exitHook);
	});

	it("exit-hook has only three properties: 'bind', 'unbind', 'removeListener' and 'list", function () {
		expect(Object.keys(exitHook).sort()).to.be.deep.equal(['bind', 'list', 'removeListener', 'unbind']);
	});

	it('exit-hook.bind is a function that take two arguments and returns exit-hook', function () {
		expect(exitHook.bind).to.be.a('function');
		expect(exitHook.bind.length).to.equal(2);
		expect(exitHook.bind()).to.equal(exitHook);
	});

	it('exit-hook.unbind is a function that take one argument and returns exit-hook', function () {
		expect(exitHook.unbind).to.be.a('function');
		expect(exitHook.unbind.length).to.equal(1);
		expect(exitHook.unbind()).to.equal(exitHook);
	});

	it('exit-hook.list is a function that take zero arguments', function () {
		expect(exitHook.list).to.be.a('function');
		expect(exitHook.list.length).to.equal(0);
	});
});

describe('Basic functionality', function () {
	var exitHook;

	beforeEach('Resetting exit-hook', function () {
		exitHook = requireExitHook();
	});

	it('exit-hook.list returns an array of bound events', function () {
		var list1 = exitHook.list(),
			list2;

		expect(exitHook.list()).to.be.an('array');

		exitHook.bind('CUSTOM1');

		list2 = exitHook.list();

		expect(list2.length).to.equal(list1.length + 1);
		expect(list2[list2.length - 1]).to.equal('CUSTOM1');
	});

	it('exit-hook.unbind(\'everything\' removes all listeners', function () {
		exitHook.unbind('everything');
		expect(exitHook.list().length).to.equal(0);
	});

	it('exit-hook.unbind(\'CUSTOM1\' removes the CUSTOM1-listener', function () {
		var list1 = exitHook.list(),
			list2;

		exitHook.bind('CUSTOM1').unbind('CUSTOM1');

		list2 = exitHook.list();

		expect(list1).to.deep.equal(list1);
	});

	it('exit-hook.bind adds a new event to listen for', function (done) {
		var signal = 'CUSTOM1',
			code = 446;

		exitHook.bind(signal, true);

		expect(exitHook.list().slice(-1)[0]).to.equal(signal);

		exitHook(function (canCancel, _signal, _code) {
			expect(canCancel).to.equal(true);
			expect(_signal).to.equal(signal);
			expect(_code).to.equal(code);

			done();

			exitHook.unbind('everything');
			
			return false;
		});

		process.emit(signal, code);
	});
});

describe('Extended functionality', function () {
	var exitHook;
	
	beforeEach('Resetting exit-hook', function () {
		exitHook = requireExitHook();
	});

	it('Don\'t allow multiple binds on the same event', function () {
		var list1,
			list2;

		exitHook.bind('CUSTOM1');

		list1 = exitHook.list();

		exitHook.bind('CUSTOM1').bind('CUSTOM1').bind('CUSTOM1');

		list2 = exitHook.list();

		expect(list1.length).to.deep.equal(list2.length);
	});

	it("'removeListener' works as expected", function (done) {
		var calls = 2,
			list2;

		function next () {
			if (!--calls) {
				done();
			}

			return false;
		}

		function a () { return next(); }
		function b () { return next(); }
		function c () { return next(); }

		exitHook(a);
		exitHook(b);
		exitHook(c);

		exitHook.removeListener(b);

		exitHook.bind('CUSTOM1');

		process.emit('CUSTOM1', true);
	});

	it('Returning false doesn\'t let the process terminate', function (done) {
		exitHook(function () {
			setTimeout(done);

			return false;
		}).bind('CUSTOM1');

		process.emit('CUSTOM1');
	});
	
	it('Multiple exithooks can be set', function (done) {
		var calls = 3;

		function next () {
			if (!--calls) {
				done();

				exitHook.unbind('everything');
			}

			return false;
		}

		exitHook.bind('CUSTOM2');

		exitHook(next);
		exitHook(next);
		exitHook(next);

		process.emit('CUSTOM2');
	});

	it('Default context is the callback function', function (done) {
		exitHook(function foo () {
			expect(this).to.equal(foo);
			exitHook.unbind('everything');
			done();
		}).bind('CUSTOM2');
		
		process.emit('CUSTOM2');
	});

	it('Custom context as first param', function (done) {
		var context = {foo:'bar'};

		exitHook(context, function () {
			expect(this).to.equal(context);
			exitHook.unbind('everything');
			done();
		}).bind('CUSTOM2');
		
		process.emit('CUSTOM2');
	});

	it('Last test. A non-cancellable signal (I guess mocha doesn\'t let the event-loop run out)', function () {
		exitHook(function (canCancel, signal, code) {			
			expect(canCancel).to.equal(false);
		});
	});
});