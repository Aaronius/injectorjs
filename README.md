Injector.js
==========

Injector.js is a fast, light-weight IoC container for JavaScript.  It's library-independent, AMD-compatible, and is built to be extended and customized to your needs.

## Inversion of control and dependency injection

Don't know what inversion of control is or why you would use it? Want to learn more? Start by reading Martin Fowler's [Inversion of Control Containers and the Dependency Injection pattern](http://martinfowler.com/articles/injection.html).

## API ##

You can get a good feel for what injector.js is capable of by reading the [specs used for testing](https://github.com/Aaronius/injectorjs/blob/master/spec/spec.js). Even so, we'll go through some use cases below.

### Map and get

Let's create an injector.

```js
var injector = new Injector();
```

An injector without mappings doesn't do anything for us, so let's set up a mapping.

```js
injector.map('rank').toValue(1337);
```

As it says, we've mapped the key "rank" to the value "1337".  The value could have been a string, a number, an object, a function, etc.  Now let's pull the value back out.

```js
var rank = injector.get('rank');
```

Our rank variable is now 1337.  Whenever we map to a value, whatever goes in comes right back out unmodified.  We can retrieve it as many times as we want. We can also create as many mappings as we want. Now let's remove the mapping.

```js
injector.unmap('rank');
```

Simple enough.  Now let's create a mapping to a constructor.

```js
injector.map('service').toConstructor(TwitterService);
```

Now when we request the value for the key "service" the injector will create an instance of TwitterService by using the "new" keyword (e.g., new TwitterService()).

```js
var service1 = injector.get('service');
var service2 = injector.get('service');
```

In this case, service1 and service2 are both separate instances of TwitterService.  What if we only want a single instance of TwitterService to ever be returned?

```js
injector.map('service').toConstructor(TwitterService).asSingleton();
var service1 = injector.get('service');
var service2 = injector.get('service');
```

Here, service1 and service2 are the same instance.  By calling asSingleton(), the injector only created a single instance of TwitterService and always returned that same instance.  By default, the instance is created at the moment it is first requested.  However, we could have created the instance immediately when the mapping was made by passing in true.

```js
injector.map('service').toConstructor(TwitterService).asSingleton(true);
```

If the constructor is in the global scope, you can just pass its name as a string and the injector will go grab it.

```js
injector.map('service').toConstructor('TwitterService');
```

Namespaced constructors work too.

```js
injector.map('service').toConstructor('app.services.TwitterService');
```

What if the process of creating an instance of TwitterService requires a little setup work?  We can map to a factory function.

```js
injector.map('service').toFactory(function() {
	return new TwitterService({
		username: 'aaronius',
		pollInterval: 5000
	});
});
```

Now when we retrieve the service from the injector it will call the factory function to get an instance.  Of course, we can make that a singleton too so the factory function is only called at most a single time.

```js
injector.map('service').toFactory(function() {
	return new TwitterService({
		username: 'aaronius',
		pollInterval: 5000
	});
}).asSingleton();
```

We already talked about how to retrieve a single mapping's value.  What if we want to retrieve values for more than one mapping at a time?

```js
injector.map('rank').toValue(1337);
injector.map('service').toConstructor(TwitterService);
injector.get(['rank', 'service'], function(key, value) {
	alert('The value of key ' + key + ' is value ' + value);
});
```

The callback function will be called once for each mapping.

### Inject into

Inversion of control containers are used to fulfill dependencies for a given object.  By default, injector.js assumes the target object has listed the keys that should be injected in an array attribute named "$inject".

```js
injector.map('rank').toValue(1337);
injector.map('service').toConstructor(TwitterService);

var socialView = {
	$inject: ['rank', 'service']
};

injector.injectInto(socialView);
```

The injector retrieves values for "rank" and "service" and sets the values onto respective "rank" and "service" attributes in the socialView object.  socialView now has a "rank" attribute whose value is 1337 and a "service" attribute whose value is an instance of TwitterService.  If TwitterService has its own "$inject" array, its dependencies will be fulfilled when the TwitterService instance is created...and those dependencies' dependencies, and so on.

The $inject attribute can alternatively be a function that returns an array.

```js
var socialView = {
	$inject: function() { return ['rank', 'service']; }
};
```

Developers are picky. Some may want the resulting attributes prepended with an underscore. The injector will always look for an attribute called $applyInjections on the target object and, if one is found, it will be used to apply the injections.

```js
var socialView = {
	$inject: ['rank', 'service'],
	$applyInjections: function(key, value) {
		this['_' + key] = value;
	}
};
```

Enough with the assumptions. Let's modify the behavior of Injector itself so that all injector instances look for an attribute called "$injectables" instead of "$inject".

```js
Injector.prototype.getInjectionPoints = function(target) {
	return target.$injectables;
};
```

Or we can modify the behavior of Injector so that all injectors apply injections by prepending an underscore to the attribute names.

```js
Injector.prototype.applyInjections = function(key, value) {
	this['_' + key] = value;
}
```

Or we could just modify the behavior of a single injector instead of all injectors

```js
var injector = new Injector();
injector.getInjectionPoints = function(target) {
	return target.$injectables;
};
injector.applyInjections = function(key, value) {
	this['_' + key] = value;
};
```

### Parent injectors

What if we want to inherit mappings from another injector?

```js
var parentInjector = new Injector();
var childInjector = new Injector(parentInjector);
```

Now if childInjector doesn't have a mapping for a given key, it will additionally look to parentInjector for the mapping.  A parent injector can be set or removed at any time.

```js
var parentInjector = new Injector();
var childInjector = new Injector();
childInjector.parentInjector = parentInjector;
```

### Thanks

The above code was written off-the-cuff so please report any issues you find. Thanks!
