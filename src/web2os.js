/**
 * @name {web2os}.create
 * @type {Function}
 * @param {Object} optionsParam. Object with the options we want to provide for the current web2os instance.
 * Accepted parameters are:
 *   - abortOnRejectedPromise: {Boolean} Defaults to `true`. This means that {web2os} will stop the execution when a promise (from `onWeb` or `onOs` callbacks) is rejected.
 *   - browser: {Object} Parameters for the {BrowserWindow} Electron object. For more info, go to: https://github.com/electron/electron/blob/master/docs/api/browser-window.md#class-browserwindow
 *   - openDevTools: {Boolean} Specifies if the openDevTools should be opened or not. Default: false.
 * @returns {Object} chainable. Object that has all the methods available for {web2os} scraps.
 * @description Creates an instance of {web2os}, and returns its chainable methods as an {Object} that we will call the `chainable`.
 */
function create(optionsParam = {}) {

  var deepExtend = require("deep-extend");

  /**
   * @name chainables
   * @type {Object}
   * @description Object that is going to be returned by the methods it has, in order
   * to make them chainable. It also holds the `internals` property, which has some 
   * useful data for the {web2os} instance.
   */
  var chainables = {};

  /** 
   * @name chainables.internals
   * @type {Object}
   * @description Contains some useful data for the {web2os} instance.
   */
  chainables.internals = {};

  /**
   * @name chainables.internals.tasks
   * @private 
   * @type {Array}
   * @description Holds all the tasks (asynchronous functions) that have been requested 
   * to this {web2os} instance. The tasks that are dispatched (or being dispatched) will
   * not appear in this array.
   */
  chainables.internals.tasks = [];

  /**
   * @name chainables.internals.options
   * @type {Object}
   * @description Contains all the parameters of the current {web2os} instance.
   * This object is deeply extended by the parameter passed to the 
   * {web2os}.create(~) method.
   */
  chainables.internals.options = deepExtend({
    abortOnRejectedPromise: true,
    openDevTools: false,
    browser: {
      // show: false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false
      }
    }
  }, optionsParam.browserOptions || {});

  /**
   * @name chainables.open
   * @type {Function}
   * @parameter {String} url. URL to be opened by the current {web2os} instance.
   * @returns {Object} chainables.
   * @description Adds a task that opens the provided URL (it can be a "file://" URI too)
   */
  chainables.open = function(url) {
    chainables.internals.tasks.push({
      op: "open",
      url
    });
    return chainables;
  };

  /**
   * @name chainables.onWeb
   * @type {Function}
   * @param {Function:async || String} fnParam. Asynchronous function (this means that it will
   * receive as parameters: {1:Function:resolve}, {2:Function:reject}) that will be applied
   * to the Web Environment of the current {web2os} instance. Must be resolved or rejected.
   * The parameter can also be a string, which should contain the code of an asynchronous 
   * function.
   * @param {Boolean} isSync. Default: false. Set to true to pass simple code, and it will not
   * be wrapped in a {Promise}. By default, the fnParam is wrapped in a Promise.
   * @returns {Object} chainables
   * @description Adds a task that executes an asynchronous function in the Web Environment.
   * In this environment, you are working with the JavaScript of the browser, and so, you can
   * manipulate the DOM, do AJAX calls, or whatever. This function can return, through the 
   * `resolve` ({1:Function:resolve}) parameter some data, and if the next chained call is an
   * `onOs(func)`, the callback it handles will receive this data, appended as a new parameter.
   * This way, you can pass data from the Web Environemnt to the OS Environment, and manage it
   * locally.
   */
  chainables.onWeb = function(fnParam, isSync=false) {
    var fn = undefined;
    if (typeof fnParam === "string") {
      fn = fnParam;
    } else if (typeof fnParam === "function") {
      fn = fnParam.toString();
    }
    chainables.internals.tasks.push({
      op: "onWeb",
      isSync,
      fn
    });
    return chainables;
  };

  /**
   * @name chainables.onOs
   * @type {Function}
   * @param {Function:async} fn. Asynchronous function (this means that it will
   * receive as parameters: {1:Function:resolve}, {2:Function:reject}) that will be applied 
   * to the OS Environment. Moreover, if the previous chained call was an `onWeb` call, and
   * it was resolved with some data as parameter, a 3rd parameter will be passed to this
   * asynchronous function that is going to be executed in our OS Environment. That parameter
   * will contain the data returned by the previous `onWeb` asynchronous call. Otherwise, 
   * only the `resolve` and `reject` functions will be passed as parameters.
   * @returns {Object} chainables.
   * @description Adds a task that executes an asynchronous function in the OS Environment.
   * In this environment, you are working with the JavaScript of Node.js, and so, you can
   * access to any npm or node modules available in your current context (to read and write files, 
   * start processes, manage databases, etc.).
   */
  chainables.onOs = function(fn) {
    chainables.internals.tasks.push({
      op: "onOs",
      fn
    });
    return chainables;
  };

  /**
   * @name chainable.run
   * @type {Function}
   * @param {Function} doneRun (Optional). Function that will be executed once the `run`
   * function ended.
   * @returns {Object} chainables
   * @description This function starts running all the tasks acumulated until it is called.
   */
  chainables.run = function(doneRun) {
    // Retrieve the necessary objects for Electron to run:
    const {
      app,
      BrowserWindow
    } = require("electron");
    // Add a 'ready' event listener:
    app.on("ready", function() {
      // Instantiate the browser: 
      var win = new BrowserWindow(chainables.internals.options.browser);
      chainables.internals.app = app;
      chainables.internals.BrowserWindow = BrowserWindow;
      chainables.internals.win = win;
      // Define abort-task:
      function abortTask() {
        if (chainables.internals.options.abortOnRejectedPromise) {
          chainables.internals.tasks = [];
        } else {
          nextTask.apply(null, Array.prototype.slice.call(arguments));
        }
      };
      // Define next-task function:
      function nextTask(data) {
        // If there are no more tasks...
        if (chainables.internals.tasks.length === 0) {
          // Close the window
          win.close();
          // Finish the task calling the callback passed to `run` method, if any.
          return doneRun ? doneRun(data) : undefined;
        }
        // Retrieve the current task (the first one in the `tasks` FIFO stack)
        var curTask = chainables.internals.tasks.shift();
        // Do the proper thing for the current task:
        switch (curTask.op) {
          // When we are opening it:
          case "open":
            win.loadURL(curTask.url);
            if (chainables.internals.options.openDevTools) {
              win.openDevTools();
            }
            return nextTask();
            // When we are on the web environment
          case "onWeb":
          	if(!curTask.isSync) {
            	return win.webContents.executeJavaScript("new Promise(" + curTask.fn + ")").then(nextTask).catch(abortTask);
            } else {
              return win.webContents.executeJavaScript(curTask.fn).then(nextTask).catch(abortTask);
          	}
            // When we are on the os environment:
          case "onOs":
            return new Promise(function(done, error) {
              curTask.fn.call(chainables, done, error, data ? data : undefined);
            }).then(nextTask).catch(abortTask);
        }
      };
      // Start dispatching the tasks
      nextTask();
    });
    return chainables;
  };
  return chainables;
};

module.exports = {
  create
};