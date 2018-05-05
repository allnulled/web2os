///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///// THIS IS FOR CODE COVERAGE PURPOSES //////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
var exec = require("execute-command-sync");
var srcMainCov = require("path").resolve(__dirname + "/../src-cov/web2os.js");
exec("npm run clean");
exec("node_modules/.bin/rimraf coverage .nyc_output");
exec("node_modules/.bin/nyc instrument src src-cov");
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

var srcPathOriginal = require("path").resolve(__dirname + "/../src/web2os.js");
var srcPath = (typeof srcMainCov !== "undefined") ? srcMainCov : srcPathOriginal;
console.log(srcPath);
var web2os = require(srcPath);
var report = require("assertivity").generate().report;
var fs = require("fs");

var googleFile = __dirname + "/data.google.txt";
var githubFile = __dirname + "/data.github.txt";
var stackOFile = __dirname + "/data.stackoverflow.txt";

var idTimeout = setTimeout(function() {
	report.as("Timeout reached (30 seconds). Something seems not to work okay.").that.it(true).is.false();
}, 30000);

web2os
.create()

.open("https://www.google.com")
.onWeb((done, error) => {setTimeout(() => {done(document.title);}, 2000);})
.onOs((done, error, data) => {fs.writeFileSync(googleFile, data, "utf8");done();})

.open("https://www.github.com")
.onWeb((done, error) => {setTimeout(() => {done(document.title)}, 2000);})
.onOs((done, error, data) => {fs.writeFileSync(githubFile, data, "utf8");done();})

.open("https://www.stackoverflow.com")
.onWeb((done, error) => {setTimeout(() => {done(document.title)}, 2000);})
.onOs((done, error, data) => {fs.writeFileSync(stackOFile, data, "utf8");done();})

.run(function() {
	clearTimeout(idTimeout);
	report.as("Google was scraped").that.it(fs.existsSync(googleFile)).is.true();
	report.as("Google's title is 'Google'").that.it(fs.readFileSync(googleFile).toString()).is("Google");
	report.as("GitHub was scraped").that.it(fs.existsSync(githubFile)).is.true();
	report.as("GitHub's title is 'GitHub'").that.it(fs.readFileSync(githubFile).toString()).is("The world’s leading software development platform · GitHub");
	report.as("StackOverflow was scraped").that.it(fs.existsSync(stackOFile)).is.true();
	report.as("StackOverflow's title is 'Stack Overflow - Where Developers Learn, Share, & Build Careers'").that.it(fs.readFileSync(stackOFile).toString()).is("Stack Overflow - Where Developers Learn, Share, & Build Careers");
	
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///// THIS IS FOR CODE COVERAGE PURPOSES //////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	var cov = global.__coverage__;
	cov["web2os.js"].path = srcPathOriginal;
	require("fs").mkdirSync(".nyc_output");
	require("fs").writeFileSync(".nyc_output/out.json", JSON.stringify(cov), "utf8");
	exec("nyc report --reporter=html");
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////////////////////////////////////////

});
