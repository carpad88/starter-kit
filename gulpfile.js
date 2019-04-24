/***************************************************
********************* Packages *********************
****************************************************/

const { src, dest, watch, series } = require('gulp');

// General
const fs 			= require("fs");
const notify 		= require("gulp-notify");
const del 			= require("del");

// Browser sync
const browserSync 	= require("browser-sync").create();

// Content
const pug 			= require("gulp-pug");
const data 			= require("gulp-data");

// Styles
const sass 			= require("gulp-sass");
const autoprefixer 	= require('gulp-autoprefixer');
const uglifycss 	= require("gulp-uglifycss");

// Scripts
const concat 		= require("gulp-concat");
const uglify 		= require("gulp-uglify");

// Images
const imageMin 		= require("gulp-imagemin");


/***************************************************
************ Development process ******************
****************************************************/

// Compile Pug
function compilePug(cb) {
	return src("src/pug/*.pug")
		.pipe( data(function (file) {
			return JSON.parse(fs.readFileSync("src/data/data.json")); }))
		.pipe( pug({ 
			doctype: "html", 
			pretty: true 
		}))
		.on( "error", notify.onError(function (error) {
			console.log(error.toString());
			return error.message; }))
		.pipe(dest("./src"))
	cb();
}

// Compile Sass & Inject Into Browser
function compileSass(cb) {
	return src("src/sass/*.scss")
		.pipe(sass())
		.on( "error", notify.onError(function (error) {
			console.log(error.toString());
			return error.message; }))
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
		}))
		.pipe(dest("src/assets/css"))
		.pipe(browserSync.stream());
	cb();
} 

/// Make server and watch files
function serve(cb) {
	browserSync.init({ 
		server: "./src",
		port: 5555,
		notify: false });
	watch("src/pug/**/*.pug", compilePug).on("change", browserSync.reload);
	watch("src/sass/**/*.scss", compileSass).on("change", browserSync.reload);
	watch("src/assets/js/*.js", compileSass).on("change", browserSync.reload);
	cb();
}

exports.default = series(help, compilePug, compileSass, serve);


/***************************************************
******************* BUILD process ******************
****************************************************/

// Copy HTML to dist folder
function copyHtml(cb) {
	return src("src/*.html")
		.pipe(dest("dist"));
	cb();
}

// Uglify and copy CSS to dist folder
function copyCSS(cb) {
	src("src/assets/css/*.css")
		.pipe( uglifycss({
			maxLineLen: 0,
			uglyComments: true 
		}))
		.pipe(dest("dist/assets/css"));
	cb();
}

// Optimize images
function imgMin(cb) {
	return src(["src/assets/img/*"])
		.pipe(imageMin())
		.pipe(dest("dist/assets/img"));
	cb();
}

// Minify, concat js files and copy them to dist folder
function scripts(cb) {
	return src(["src/js/*.js"])
		.pipe(concat("main.js"))
		.pipe(uglify())
		.pipe(dest("dist/assets/js"));
	cb();
}

// Builds to dist folder, ready to deploy
exports.build = series(imgMin, scripts, copyHtml, copyCSS);


/***************************************************
******************* Utility taks ******************
****************************************************/

// Clean the build folder
function clean(cb) {
	console.log("-> Cleaning dist folder");
	del(["dist", "src/*.html"]);
	cb();
}

exports.clean = clean;

// Help interface to show in the terminal
function help(cb) {
	console.log("");
	console.log("\t===== Help for Starter Kit =====");
	console.log("\tUsage:\tgulp [command]\n");
	console.log("\tThe commands are the following\n");
	console.log("\t-------------------------------------------------------");
	console.log("\tdeafult:\t\tCompile pug and sass files and start a server");
	console.log("\tbuild:\t\tCreates the dist folder and copy all production files");
	console.log("\tclean:\t\tDelete the dist folder and the html");
	console.log("\thelp:\t\tPrint this message");
	console.log("\t-------------------------------------------------------\n");
	console.log("");
	cb();
}

exports.help = help;

