# web2os

![](https://img.shields.io/badge/web2os-v1.0.2-green.svg) ![](https://img.shields.io/badge/tests-passing-green.svg) ![](https://img.shields.io/badge/coverage-88.89%25-green.svg)

Scrap the web asynchronously in live, reusing Node.js, all in one file, with a few lines! From the web to your operative system (web2os), easily!

*Note: this was possible thanks to Electron and Chromium, among others!*

## 1. Installation

##### To use the command-line anywhere:

~$ `npm install -g web2os`

##### To use it locally:

~$ `npm install -s web2os`

## 2. Usage

As this tool uses 

### 2.1. Run scripts:

If you installed the tool globally, you can:

~$ `web2os myScript.js`

If you installed it localy only, you have to:

~$ `node_modules/.bin/web2os myScript.js`

*Note: If you need to provide arguments to [Electron](https://github.com/electron/electron) (which, in the end, is the binary that is going to execute our scripts), just add your arguments normally to the command. You can also use the [Electron](https://github.com/electron/electron) CLI tool to run your scripts, there is no difference right now.*

### 2.2. Some examples:

As all the API of `web2os` module is chainable (all the methods can be called one after the other), these are some examples:

##### Example 1: scrap Google's main page title and put it into a file:

```js
require("web2os")
  .create()
  .open("https://www.google.com")
  .onWeb((done, error) => {done(document.title);})
  .onOs((done, error, data) => {
    require("fs").writeFileSync("Google title.txt", data, "utf8");
    done();
  })
  .run(() => {
    console.log("DONE!");
  });
```

##### Example 2: scrap Github's main page title (this time headlessly, so without seeing the browser) and put it into a file:

```js
require("web2os")
  .create({
    browser: {
      show: false
    }
  })
  .open("https://www.github.com")
  .onWeb((done, error) => {done(document.title);})
  .onOs((done, error, data) => {
    require("fs").writeFileSync("Google title.txt", data, "utf8");
    done();
  })
  .run(() => {
    console.log("DONE!");
  });
```

If you want, you can run the tests typing:

~$ `npm run test`


## 3. API


**Method:** `{web2os}.create(Object:config)`

**Type:** `{Function}`

**Parameter:** `{Object} config`. The settings passed to the `{web2os}` instance. This object, if passed, will override any present values from the default settings, which are:

```js
{
  abortOnRejectedPromise: true,
  openDevTools: false,
  browser: { // (1)
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    }
  }
}
```

*(1): parameters for the [{BrowserWindow}](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#class-browserwindow) instance of the [Electron](https://github.com/electron/electron) framework.*

**Returns:** `{web2os}`. Optional. Object that holds the chainable methods for the current `{web2os}` instance.

**Description:** Creates a new `{web2os}` instance.

**Example:** 

```js
require("web2os").create();
```

----

**Method:** `{web2os}.open(String:url)`

**Type:** `{Function}`

**Parameter:** `{String} url`. *Required*. URL to be visited.

**Returns:** `{web2os}`. Object that holds the chainable methods for the current `{web2os}` instance.

**Description:** Adds a task that will open the passed URL when executed.

**Example:** 

```js
require("web2os")
  .create()
  .open("http://www.github.com")
  .run();
```

----

**Method:** `{web2os}.onWeb(String|Function:callback)`

**Type:** `{Function}`

**Parameter:** `{String|Function} callback`. *Required*. Code (as string or function) to be executed in the browser environment. The code passed here will only have access to the browser environment, and Node.js will not be available. The callback must be a function that will be passed to a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Be sure that you call either `resolve` or `reject` (or the names that you choose) in some moment of the execution. Moreover, when you pass some data to the `resolve` function, this data will be passed to the next `onOs` callback, when executed. This is the key to pass data from the browser to the Node.js environment comfortably, but also in a secure and safe way.

**Returns:** `{web2os}`. Object that holds the chainable methods for the current `{web2os}` instance.

**Description:** Adds a task that will execute the passed function (inside a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)) in the browser environment when executed. Also, it can pass some browser environment's data to the next callback, through the `resolve` callback of the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

**Example:** 

```js
require("web2os")
  .create()
  .open("http://www.github.com")
  .onWeb(function(done, error) {
    setTimeout(function() {
      done(document.title);
    }, 3000);
  })
  .run();
```

----

**Method:** `{web2os}.onOs(Function:callback)`

**Type:** `{Function}`

**Parameter:** `{Function} callback`. *Required*. Code (as a function) to be executed in the Node.js environment. The code passed here will only have access to the Node.js environment of the current script, and the browser environment will not be available. The callback must be a function that will be passed to a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Be sure that you call either `resolve` or `reject` (or the names that you choose) in some moment of the execution. Also, if there was a previous `onWeb` callback that passed some data from its [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), that data will be passed to the `onOs` callback as a third parameter: `(resolve, reject, data) => {/*OS code*/}`. This way, you can retrieve data from the web to your operative system, and handle it with Node.js APIs and NPM modules.

**Scope:** `{web2os}`. You can access to the `{web2os}` object from inside this callback, using the keyword `this`.

**Returns:** `{web2os}`. Object that holds the chainable methods for the current `{web2os}` instance.

**Description:** Adds a task that will execute the passed function (inside a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)) in the operative system environment when executed. Also, it can receive data from the previous `onWeb` callback, if any, as a third parameter of this `onOs` callback.

**Example:** 

```js
require("web2os")
  .create()
  .open("http://www.github.com")
  .onWeb(function(done, error) {
    setTimeout(function() {
      done(document.title);
    }, 3000);
  })
  .onOs(function(done, error, title) {
    require("fs").writeFileSync("Github title.txt", title, "utf8");
    done();
  })
  .run();
```

----

**Method:** `{web2os}.run(Function:callback)`

**Type:** `{Function}`

**Parameter:** `{Function} callback`. Optional. Code that can be executed once the accumulated tasks have been executed.

**Returns:** `{web2os}`. Object that holds the chainable methods for the current `{web2os}` instance.


**Description:** Runs the accumulated tasks, one after the other, asynchronously. Once finished, it executed

**Example:** 

```js
require("web2os")
  .create()
  .open("http://www.github.com")
  .onWeb(function(done, error) {
    setTimeout(function() {
      done(document.title);
    }, 3000);
  })
  .onOs(function(done, error, title) {
    require("fs").writeFileSync("Github title.txt", title, "utf8");
    done();
  })
  .run(function() {
    console.log("I am done with provided tasks!");
  });
```

----

**Property:** `{web2os}.internals`

**Type:** `{Object}`

**Description:** This object holds important information for the execution. Basically: 

  - `options {Object}`: current configurations, overriden by the object passed to the `create` method.

  - `tasks {Array}`: array of objects that represents the tasks that the `{web2os}` instance has pending. When a task is started, it is removed from this array. Each task is a simple `{Object}` with 2 properties: 

  1.- `*.op {String}`: operation of the task. It is the name of the method of our chainable methods (`"open"`, `"onWen"`, `"onOs"`).

  2.- `*.fn {Function} | *.url {String}`: the parameter passed to the operation.

----

You can also generate the documentation typing:

~$ `npm run docs`

It will create a `docs/docs.json` file with the documentation extracted from the JavaDoc comments of the source code.


## 4. Conclusion

This has turned into a promising clean API to do web-scraping comfortably. 

Consider the fact that you can...:

1. Use database NPM modules to insert the data that you collect from the web directly to your database, you can even use ORMs to do it effortlessly

2. See the current progression of the scraps.

3. Do multiple simultaneous scraps in the same script even.

4. Automate tests or demonstration of products.

5. Take profit of all the Node.js modules to do your scraps, tests or whatever.

6. Scrap the web asynchronously, with a browser environment executing all the JavaScript needed to reach the data you want.

But also, you can see how a Chromium browser does all of this in live, interact with it by hand in the moment, and it is very simple to use because you only have to use the technologies you already know, the JavaScript of the browser and Node.js! 

Happy scraps!

And remember that Open Source must win, always!
