 

# web2os

![](https://img.shields.io/badge/web2os-v1.1.0-green.svg) ![](https://img.shields.io/badge/tests-passing-green.svg) ![](https://img.shields.io/badge/coverage-85%25-green.svg)

Scrap the web asynchronously in live, reusing Node.js, all in one file, with a few lines! From the web to your operative system (web2os), easily!

*Based on [Electron](https://github.com/electron/electron).*

## 1. Installation

~$ `npm install -s web2os`

## 2. Usage

#### 2.1. How to run `web2os` scripts

If you installed [Electron](https://github.com/electron/electron) globally, you can:

~$ `electron myScript.js`

*Note: if you have problems installing **Electron** globally, use the flag `--unsafe-perm=true`.*

If you did not install [Electron](https://github.com/electron/electron) globally, you can, instead:

~$ `./node_modules/.bin/electron myScript.js`

## 3. Examples

As all the API of `web2os` module is chainable (all the methods can be called one after the other), these are some examples:

#### Example 1: scrap Google's main page title and put it into a file:

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
   browser: {show: false}
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
##### Example 3: scrap multiple URLs the same way:

```js
const web2osInstance = require("web2os").create({});
const links = [
 "https://www.google.com", 
 "https://www.github.com", 
 "https://stackoverflow.com/"
];
const file = __dirname + "/titles.txt";
const fs = require("fs");
const data = {titles: []};
links.forEach((link) => {
 web2osInstance
   .open(link)
   .onWeb((done, error) => {
     done(document.title);
   }).onOs((done, error, title) => {
     fs.appendFileSync(file, title+"\n", "utf8");
     done();
   });
});
web2osInstance.run(() => {
 fs.readFileSync(file).toString()
});
```

## 4. API Reference




 


----

### `require("web2os").create(optionsParam)`

**Type:** `{Function}`

**Param:** `{Object} optionsParam`. Object with the options we want to provide for the current web2os instance.

Accepted parameters are:

 - **abortOnRejectedPromise**: `{Boolean}`. Defaults to `true`. This means that `{web2os}` will stop the execution when a promise (from `onWeb` or `onOs` callbacks) is rejected.

 - **browser**: `{Object}`. Parameters for the {BrowserWindow} Electron object. For more info, go to: https://github.com/electron/electron/blob/master/docs/api/browser-window.md#class-browserwindow

 - **openDevTools**: `{Boolean}`. Specifies if the openDevTools should be opened or not. Default: false.


**Returns:** `{Object} chainable`. Object that has all the methods available for `{web2os}` scraps.

**Description:** Creates an instance of `{web2os}`, and returns its chainable methods as an `{Object}` that we will call the `chainable`.



 


----

### `web2os`

**Type:** `{Object}` Object returned by `require("web2os").create(...);`. It represents a `{web2os}` instance.

**Description:** Object that is going to be returned by the methods it has, in order
to make them chainable. It also holds the `internals` property, which has some 
useful data for the `{web2os}` instance.



 


----

### `web2os#internals`

**Type:** `{Object}`

**Description:** Contains some useful data for the `{web2os}` instance.



 


----

### `web2os#internals.tasks`

**Type:** `{Array}`

**Description:** Holds all the tasks (asynchronous functions) that have been requested 
to this `{web2os}` instance. The tasks that are dispatched (or being dispatched) will
not appear in this array.



 


----

### `web2os#internals.options`

**Type:** `{Object}`

**Description:** Contains all the parameters of the current `{web2os}` instance.
This object is deeply extended by the parameter passed to the 
`{web2os}.create(~)` method.

By default, its value is:

```js
{
 openDevTools: false,
 browser: {
   // show: false,
   width: 800,
   height: 600,
   webPreferences: {
     nodeIntegration: false
   }
 },
 abortOnRejectedPromise: true
}
```
Also, you can pass a `onError` function, to handle the errors by default.





 


----

### `web2os#open`

**Type:** `{Function}`

**Parameter:** `{String}` `url`. URL to be opened by the current `{web2os}` instance.

**Returns:** `{Object}` chainables.

**Description:** Adds a task that opens the provided URL (it can be a `"file://"` URI too)



 


----

### `web2os#onWeb`

**Type:** `{Function}`

**Param:** {Function:async || String} fnParam. Asynchronous function (this means that it will
receive as parameters: {1:Function:resolve}, {2:Function:reject}) that will be applied
to the Web Environment of the current `{web2os}` instance. Must be resolved or rejected.
The parameter can also be a string, which should contain the code of an asynchronous 
function.

**Param:** {Boolean} isSync. Default: false. Set to true to pass simple code, and it will not
be wrapped in a {Promise}. By default, the fnParam is wrapped in a Promise.

**Returns:** `{Object}` chainables

**Description:** Adds a task that executes an asynchronous function in the Web Environment.
In this environment, you are working with the JavaScript of the browser, and so, you can
manipulate the DOM, do AJAX calls, or whatever. This function can return, through the 
`resolve` ({1:Function:resolve}) parameter some data, and if the next chained call is an
`onOs(func)`, the callback it handles will receive this data, appended as a new parameter.
This way, you can pass data from the Web Environemnt to the OS Environment, and manage it
locally.



 


----

### `web2os#onOs(fn:Function:async)`

**Type:** `{Function}`

**Param:** {Function:async} fn. Asynchronous function (this means that it will
receive as parameters: 
- **param 1:** `{Function:resolve}`
- **param 2:** `{2:Function:reject}`
both of which work as a typical JavaScript `Promise`) that will be applied 
to the OS Environment.
Moreover, if the previous chained call was an `onWeb` call, and
it was resolved with some data as parameter, a 3rd parameter will be passed to this
asynchronous function that is going to be executed in our OS Environment. 
That parameter
will contain the data returned by the previous `onWeb` asynchronous call. Otherwise, 
only the `resolve` and `reject` functions will be passed as parameters.

**Returns:** `{Object}` `chainables`.

**Description:** Adds a task that executes an asynchronous function in the OS Environment.
In this environment, you are working with the JavaScript of Node.js, and so, you can
access to any npm or node modules available in your current context (to read and write files, 
start processes, manage databases, etc.).



 


----

### `web2os#run(doneRun:Function)`

**Type:** `{Function}`

**Param:** `{Function}` `doneRun` (Optional). Function that will be executed once the `run`
function ended.

**Returns:** `{Object}` `chainables`

**Description:** This function starts running all the tasks acumulated until it is called.



 




## 5. Tests, coverage and documentation generation

#### 5.1. Tests and coverage

You can make the tests pass and generate automatically the coverage by typing:

~$ `npm run test`

You can clean the generated coverage reports by typing:

~$ `npm run clean`

#### 5.2. Documentation

You can regenerate the documentation typing:

~$ `npm run docs`

The generated docs will be dumped directly from `src/web2os.js` to `README.md` file, in Markdown format, and from javadoc comments.

## 6. Conclusion

This has turned into a promising clean API to do web-scraping comfortably, and in a fast, reliable way, because you can attack to applications that are loaded by client-side frameworks like Angular or React, which require a DOM processing by the browser previously to proceed to the scrap.

Consider the fact that you can:

1. Use database NPM modules to insert the data that you collect from the web directly to your database, you can even use ORMs to do it effortlessly.

2. See the current progression of the scraps.

3. Do multiple simultaneous scraps in the same script even.

4. Automate tests or demonstration of products.

5. Take profit of all the Node.js modules to do your scraps, tests or whatever.

6. Scrap the web asynchronously, with a browser environment executing all the JavaScript needed to reach the data you want.

But also, you can see how a Chromium browser does all of this in live, interact with it by hand in the moment, and it is very simple to use because you only have to use the technologies you already know, the JavaScript of the browser and Node.js! 

Happy scraping!

*Take into account that I am the developer of the NaturalScript programming language, and I have been working on Open Source projects since I know that Microsoft is not available to give 5.000 dollars to programming languages that come nearer to natural language, and they do not even want to give explanations about their reasons... Well, Microsoft, Google, Intel and Oracle, neither of them are capable to answer a request by a simple novice developer who is giving big part of its time to the Open Source community.*







