/*! injectjs - v0.1.0 - 2012-06-12
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

	var previousInjector = root.Injector;

	var isUndefined = function(obj) {
		return obj === void 0;
	};

	var objToStr = Object.prototype.toString;

	var isString = function(obj) {
		return objToStr.call(obj) === '[object String]';
	};

	var arrayToStr = Array.prototype.toString;

	var isArray = Array.isArray || function(obj) {
		return arrayToStr.call(obj) === '[object Array]';
	};

	var isObject = function(obj) {
		var o = Object; // Change to lowercase to work around https://github.com/jshint/jshint/issues/438
		return obj === o(obj);
	};

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

	var Mapping = function(injector, key) {
		this._injector = injector;
		this.key = key;
	};

	var proto = Mapping.prototype;

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

	proto.asSingleton = function(createNow) {
		this._asSingleton = true;

		if (createNow) {
			this.get();
		}

		return this;
	};

	proto.toConstructor = function(constructor) {
		this._create = function() {
			var C = constructor; // Change to upper to work around https://github.com/jshint/jshint/issues/438
			if (isString(constructor)) {
				C = getConstructorByName(constructor);
			}

			return new C();
		};
		return this;
	};

	proto.toFactory = function(fn) {
		this._create = fn;
		return this;
	};

	proto.toValue = function(value) {
		this._cache = value;
		return this;
	};

	var Injector = function(parentInjector) {
		this._mappings = {};
		this.parentInjector = parentInjector;
	};

	Injector.noConflict = function() {
		root.Injector = previousInjector;
		return this;
	};

	proto = Injector.prototype;

	proto.map = function(key) {
		var mapping = new Mapping(this, key);
		this._mappings[key] = mapping;
		return mapping;
	};

	proto.unmap = function(key) {
		delete this._mappings[key];
		return this;
	};

	proto._getMapping = function(key) {
		var mapping = this._mappings[key];
		if (!mapping && this.parentInjector) {
			mapping = this.parentInjector._getMapping(key);
		}
		return mapping;
	};

	proto.get = function(keys, delegate, context) {
		if (!keys) {
			return;
		}

		if (isString(keys)) {
			keys = [keys];
		}

		for (var i = 0, ii = keys.length; i < ii; i++) {
			var key = keys[i],
				mapping = this._getMapping(key);

			if (!mapping) {
				throw 'Mapping not found for key "' + key + '".';
			}

			if (delegate) {
				delegate.call(context || this, key, mapping.get());
			} else {
				return mapping.get();
			}
		}
	};

	var defaultDelegate = function(key, value) {
		this[key] = value;
	};

	proto.injectInto = function(target) {
		if (!target) {
			return this;
		}

		var keys = target.inject;

		if (!keys) {
			return this;
		}

		this.get(keys, target.injectDelegate || defaultDelegate, target);

		return this;
	};

	return Injector;
}));
