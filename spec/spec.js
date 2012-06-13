var root = this;
describe("Injector maps and retrieves", function() {
	var injector;

	beforeEach(function() {
		injector = new Injector();
	});

	it('a number value', function() {
		injector.map('testKey').toValue(100);
		expect(injector.get('testKey')).toBe(100);
	});

	it('a string value', function() {
		injector.map('testKey').toValue('testValue');
		expect(injector.get('testKey')).toBe('testValue');
	});

	it('a boolean value', function() {
		injector.map('testKey').toValue(true);
		expect(injector.get('testKey')).toBe(true);
	});

	it('an array value', function() {
		var names = ['Roger', 'Dan'];
		injector.map('testKey').toValue(names);
		expect(injector.get('testKey')).toBe(names);
	});

	it('an object value', function() {
		var user = {};
		injector.map('testKey').toValue(user);
		expect(injector.get('testKey')).toBe(user);
	});

	it('a function value', function() {
		var jump = function() {};
		injector.map('testKey').toValue(jump);
		expect(injector.get('testKey')).toBe(jump);
	});

	it('a constructor reference', function() {
		var User = function() {};
		injector.map('testKey').toConstructor(User);
		expect(injector.get('testKey') instanceof User).toBe(true);
	});

	it('a constructor name', function() {
		root.User = function() {};
		injector.map('testKey').toConstructor('User');
		expect(injector.get('testKey') instanceof root.User).toBe(true);
		delete root.User;
	});

	it('a constructor name with namespace', function() {
		var User = function() {};
		root.my = {};
		root.my.namespace = {
			User: User
		};
		injector.map('testKey').toConstructor('my.namespace.User');
		expect(injector.get('testKey') instanceof User).toBe(true);
		delete root.my;
	});
});

describe('Injector, when reporting values', function() {
	var injector;

	beforeEach(function() {
		injector = new Injector();
	});

	it('returns a single value', function() {
		injector.map('testKey').toValue(100);
		expect(injector.get('testKey')).toBe(100);
	});

	it('delegates a single value', function() {
		var spyee = {delegate: function(key, value) {}};
		spyOn(spyee, 'delegate');
		injector.map('testKey').toValue(100);
		injector.get('testKey', spyee.delegate);
		expect(spyee.delegate.callCount).toBe(1);
		expect(spyee.delegate).toHaveBeenCalledWith('testKey', 100);
	});

	it('delegates multiple values', function() {
		var spyee = {delegate: function(key, value) {}};
		spyOn(spyee, 'delegate');
		injector.map('testKey').toValue(100);
		injector.map('testKey2').toValue(200);
		injector.get(['testKey', 'testKey2'], spyee.delegate);
		expect(spyee.delegate.callCount).toBe(2);
		expect(spyee.delegate).toHaveBeenCalledWith('testKey', 100);
		expect(spyee.delegate).toHaveBeenCalledWith('testKey2', 200);
	});
});

describe('Injector, when injecting into an object', function() {
	var injector;

	beforeEach(function() {
		injector = new Injector();
		injector.map('testKey').toValue(100);
		injector.map('testKey2').toValue(200);
	});

	it('injects using default delegate', function() {
		var target = {
			inject: ['testKey', 'testKey2']
		};

		injector.injectInto(target);
		expect(target.testKey).toBe(100);
		expect(target.testKey2).toBe(200);
	});
	it('injects using custom delegate', function() {
		var target = {
			injected: {},
			inject: ['testKey', 'testKey2'],
			injectDelegate: function(key, value) {
				this.injected[key] = value;
			}
		};

		injector.injectInto(target);
		expect(target.injected.testKey).toBe(100);
		expect(target.injected.testKey2).toBe(200);
	});
});

describe('Injector, when injecting into objects', function() {
	var injector;

	beforeEach(function() {
		injector = new Injector();
	});

	it('recursively injects into created objects', function() {
		var ClassA = function() {};

		var ClassB = function() {
			this.inject = ['a'];
		};

		var ClassC = function() {
			this.inject = ['b'];
		};

		injector.map('a').toConstructor(ClassA);
		injector.map('b').toConstructor(ClassB);
		injector.map('c').toConstructor(ClassC);

		var c = new ClassC();
		injector.injectInto(c);

		expect(c.b instanceof ClassB).toBe(true);
		expect(c.b.a instanceof ClassA).toBe(true);
	});


	it('injects two singletons into each other without infinite recursion', function() {
		var aCount = 0,
			bCount = 0;

		var ClassA = function() {
			this.inject = ['b'];
			aCount++;
		};

		var ClassB = function() {
			this.inject = ['a'];
			bCount++;
		};

		injector.map('a').toConstructor(ClassA).asSingleton();
		injector.map('b').toConstructor(ClassB).asSingleton();

		var a = injector.get('a');

		expect(aCount).toBe(1);
		expect(bCount).toBe(1);
		expect(a.b instanceof ClassB).toBe(true);
		expect(a.b.a).toEqual(a);
	});
});

describe('Injector', function() {
	it('runs in noConflict mode', function() {
		var inj1 = root.Injector;
		expect(root.Injector).toBeDefined();
		var inj2 = root.Injector.noConflict();
		expect(root.Injector).toBeUndefined();
		expect(inj2).toBeDefined();
		expect(inj1).toBe(inj2);
		root.Injector = inj1;
	})
});