/*! injectjs - v0.1.0 - 2012-06-18
* http://github.com/aaronius/injectjs/
* Copyright (c) 2012 Aaron Hardy; Licensed MIT */

/*global module, define */
(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory(root);
	} else if (typeof define === 'function' && define.amd) {
		define(function() {	return factory(root); });
	} else {
		root.Injector = factory(root);
	}
}(this, function (root) {
	"use strict";

	// Hold onto previous Injector variable so it can be restored when calling noConflict().
	var previousInjector = root.Injector;

	// Returns true if variable is undefined.
	var isUndefined = function(obj) {
		return obj === void 0;
	};

	var objToStr = Object.prototype.toString;

	// Returns true if variable is a string.
	var isString = function(obj) {
		return objToStr.call(obj) === '[object String]';
	};

	// Returns true if variable is an object.
	var isObject = function(obj) {
		var o = Object; // Change to lowercase to work around https://github.com/jshint/jshint/issues/438
		return obj === o(obj);
	};

	// Returns true if variable is a function.
	var isFunction = function(obj) {
		return objToStr.call(obj) === '[object Function]';
	};

	// Given a constructor name representing a constructor variable in a global or namespaced scope, returns the
	// constructor. For example, given "app.utilities.drawing.MyCanvas" and assuming a browser environment, this will
	// return the variable at window.app.utilities.drawing.MyCanvas.
	var getConstructorByName = function(name) {
		var rootChild = root[name];

		if (rootChild) {
			return rootChild;
		}

		var segments = name.split('.');
		var scope = root;

		for (var i = 0, ii = segments.length; i < ii; i++) {
			scope = scope[segments[i]];
		}

		return scope;
	};

	// Represents a single injection mapping. Retains rules and logic for the creation and caching of values.
	var Mapping = function(injector, key) {
		this._injector = injector;
		this.key = key;
	};

	var proto = Mapping.prototype;

	// Returns a value for the mapping.
	proto.get = function() {
		if (!isUndefined(this._cache)) {
			return this._cache;
		}

		var value = this._create();

		if (this._asSingleton) {
			this._cache = value;
		}

		if (isObject(value)) {
			this._injector.injectInto(value);
		}

		return value;
	};

	// Instructs the mapping to return the same created instance for each request. By default, the instance is
	// lazily created, that is, is not created until the first request.  If createNow is true, the instance will
	// be immediately created.  When mapping using toValue(), the value is always cached regardless of whether
	// asSingleton() has been called.
	proto.asSingleton = function(createNow) {
		this._asSingleton = true;

		if (createNow) {
			this.get();
		}

		return this;
	};

	// Instructs the mapping to return an object instance by calling "new" on the given constructor.
	proto.toConstructor = function(constructor) {
		this._create = function() {
			var C = constructor; // Change to upper to work around https://github.com/jshint/jshint/issues/438
			if (isString(constructor)) {
				C = getConstructorByName(constructor);
				if (!C) {
					throw new Error('No constructor found for ' + constructor);
				}
			}

			return new C();
		};
		return this;
	};

	// Instructs the mapping to return an object instance by calling the passed in function.
	proto.toFactory = function(fn) {
		this._create = fn;
		return this;
	};

	// Instructs the mapping to return the passed in value.
	proto.toValue = function(value) {
		this._cache = value;
		return this;
	};

	// Injector constructor.
	var Injector = function(parentInjector) {
		this._mappings = {};
		this.parentInjector = parentInjector;
	};

	// Sets the global Injector variable to what it previous to this file being loaded. This Injector constructor will
	// be returned. This is used when there's a conflict in the global space with the variable name Injector.
	Injector.noConflict = function() {
		root.Injector = previousInjector;
		return this;
	};

	proto = Injector.prototype;

	// Creates a mapping for a given key. At this point the mapping is incomplete until a fulfillment rule is defined
	// (e.g., toConstructor(), toValue())
	proto.map = function(key) {
		var mapping = new Mapping(this, key);
		this._mappings[key] = mapping;
		return mapping;
	};

	// Removes a mapping for a given key if a mapping for the key exists.
	proto.unmap = function(key) {
		delete this._mappings[key];
		return this;
	};

	// Retrieves a mapping based on a key.
	proto._getMapping = function(key) {
		var mapping = this._mappings[key];
		if (!mapping && this.parentInjector) {
			mapping = this.parentInjector._getMapping(key);
		}
		return mapping;
	};

	// Whether a mapping has been defined for a given key.
	proto.hasMapping = function(key) {
		return !isUndefined(this._mappings[key]);
	};

	// Retrieves the mapping value(s) for a key or array of keys.
	// If a delegate function is provided, the delegate will called for each mapping. The mapping key and value will
	// be passed as arguments to the delegate function.  The value will be created/retrieved based on the mapping's
	// defined rules.
	// If a context is provided, it will become the "this" variable within the delegate function.
	proto.get = function(keys, delegate, context) {
		if (!keys) {
			return;
		}

		// Allow for a single key to be passed in.
		if (isString(keys)) {
			keys = [keys];
		}

		// Handle one key at a time.
		for (var i = 0, ii = keys.length; i < ii; i++) {
			var key = keys[i],
				mapping = this._getMapping(key);

			if (!mapping) {
				throw new Error('Mapping not found for key "' + key + '".');
			}

			// If a delegate function was passed, call it. Otherwise, just return the mapping value.  Notice if this
			// is the case only the value for the first mapping will be returned.
			if (delegate) {
				delegate.call(context || this, key, mapping.get());
			} else {
				return mapping.get();
			}
		}
	};

	// Given a target object, retrieves the keys for injections that should be fulfilled when injecting into the
	// target object.  By default, this uses target.inject which can be a single key string, an array of key strings,
	// or a function that returns a key string or array of key strings.
	// This can be swapped out for a custom function as necessary.
	proto.getInjectionPoints = function(target) {
		if (isFunction(target.inject)) {
			return target.inject();
		} else {
			return target.inject;
		}
	};

	// Applies injection values to a target object.  The "this" variable is the target object.
	// This can be swapped out for a custom function as necessary.
	proto.applyInjections = function(key, value) {
		this[key] = value;
	};

	// Fulfills injections for a target object.  By default, this uses the getInjectionPoints() function
	// to retrieve a list of keys for which injections should be implied and uses the applyInjections() function
	// to apply the injections to the target object.  If an applyInjections() function is provided on the object
	// itself, that function will be used instead of the injector's global applyInjections() function.
	proto.injectInto = function(target) {
		if (!target) {
			return this;
		}

		var keys = this.getInjectionPoints(target);

		if (!keys) {
			return this;
		}

		this.get(keys, target.applyInjections || this.applyInjections, target);

		return this;
	};

	return Injector;
}));
