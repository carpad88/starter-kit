const { src, dest, watch, series } = require('gulp');

const browserSync 	= require("browser-sync").create();
const notify 		= require("gulp-notify");
const pug 			= require("gulp-pug");
const data 			= require("gulp-data");
const fs 			= require("fs");
const sass 			= require("gulp-sass");
const autoprefixer 	= require('gulp-autoprefixer');
const uglifycss 	= require("gulp-uglifycss");
const concat 		= require("gulp-concat");
const uglify 		= require("gulp-uglify");
const imageMin 		= require("gulp-imagemin");
const del 			= require("del");


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
// Development process
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

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


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
// This is the BUILD part it creates the dist folder and 
// readys all the files for deployment
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

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

// ImageMin
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


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
// Clean dist folder to make a new one updated
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

// Clean the build folder
function clean(cb) {
	console.log("-> Cleaning dist folder");
	del(["dist", "src/*.html"]);
	cb();
}

exports.clean = clean;


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
// Help interface to show in the terminal
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function help(cb) {
	console.log("");
	console.log("\t===== Help for Starter Kit =====");
	console.log("\tUsage:\tgulp [command]\n");
	console.log("\tThe commands are the following\n");
	console.log("\t-------------------------------------------------------");
	console.log("\tclean:\t\tRemoves all the compiled files on ./dist");
	console.log("\tcopyCss:\tCopy the complied css files");
	console.log("\tcopyHtml:\tCopy the Html files");
	console.log("\timgMin:\t\tCopy the newer images to the build folder");
	console.log("\tbuild:\t\tCreates the dist folder if not already create and copy all files in it");
	console.log("\thelp:\t\tPrint this message");
	console.log("\t-------------------------------------------------------\n");
	console.log("");
	cb();
}

exports.help = help;

