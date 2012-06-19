Injector.js
==========

Injector.js is a fast, light-weight IoC container for JavaScript.  It's library-independent, AMD-compatible, and is built to be extended and customized to your needs.

## Inversion of control and dependency injection

Don't know what inversion of control is or why you would use it? Want to learn more? Start by reading Martin Fowler's [Inversion of Control Containers and the Dependency Injection pattern](http://martinfowler.com/articles/injection.html)

## API ##

You can get a good feel for what injector.js is capable of by reading the [specs used for testing](https://github.com/Aaronius/injectorjs/blob/master/spec/spec.js). Even so, we'll go through some use cases below. This code is off-the-cuff so please report any errors you find.

Let's start out by creating an injector:

```js
var injector = new Injector();
```

An injector without mappings doesn't do anything for us, so let's set up a mapping.

```js
injector.map('credential').toValue(1337);
```

As it says, we've mapped the key "credential" to the value "1337".  The value could have been a string, a number, an object, a function, etc.  Now let's pull the value back out.

```js
var credential = injector.get('credential');
```

Our credential variable is now 1337.  We can retrieve it as many times as we want. We can also create as many mappings as we want. Now let's remove the mapping:

```js
injector.unmap('credential');
```

Simple enough.  Now let's create a mapping to a constructor.

```js
injector.map('service').toConstructor(TwitterService);
```

Now when we request the value for the key "service" the injector will create an instance of TwitterService by calling "new" on it.

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

Here, service1 and service2 are the same instance.  By calling asSingleton(), the injector only created a single instance of TwitterService and always returned that same instance.  By default, the instance is created at the moment it is first asked for.  However, we could have created the instance immediately by passing in true.

```js
injector.map('service').toConstructor(TwitterService).asSingleton(true);
```

If the constructor is in the global scope, you can just pass its name as a string and the injector will go find it.

```js
injector.map('service').toConstructor('TwitterService');
```

Namespaced constructors work too.

```js
injector.map('service').toConstructor('app.services.TwitterService');
```

What if the process of creating an instance of TwitterService requires a little work?  We can map to a factory function.

```js
injector.map('service').toFactory(function() {
	return new TwitterService({
		username: 'aaronius',
		pollInterval: 5000
	});
});
```

Now when we retrieve the service from the injector it will call the factory function to get an instance.  Of course, we can make that a singleton too.

```js
injector.map('service').toFactory(function() {
	return new TwitterService({
		username: 'aaronius',
		pollInterval: 5000
	});
}).asSingleton();
```



