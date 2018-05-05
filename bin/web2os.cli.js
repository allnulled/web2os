#! /usr/bin/env node

var exec = require("execute-command-sync");
var path = require("path");
var args = process.argv;
args.shift();
var firstArgument = path.resolve(args[0]);
var currentFile = path.resolve(__dirname + "/web2os.cli.js");
if(firstArgument === currentFile) {
	args.shift();
}
exec("electron " + args.join(" "));