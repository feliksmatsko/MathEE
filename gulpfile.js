'use strict';

/**
* Gulp Packages
*/

// General
var gulp = require('gulp'),
	tsc = require('gulp-typescript'),
	tslint = require('gulp-tslint'),
	del = require('del'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	header = require('gulp-header'),
	streamify = require('gulp-streamify'),
	awspublish = require('gulp-awspublish'),
	Config = require('./gulpfile.config'),
	pkg = require('./package.json');

// Scripts and tests
var uglify = require('gulp-uglify'),
	jasmine = require('gulp-jasmine'),
	istanbul = require('gulp-istanbul'),
	browserify 	= require('browserify'),
	source = require('vinyl-source-stream'),
	reporter = require('jasmine-spec-reporter');

// Init config
var config = new Config();


/**
* Gulp Tasks
*/

// Add headers and minify script
gulp.task('minify', ['browserify'], function() {
	return gulp.src([config.output + 'mathee.js'])
		.pipe(plumber())
		.pipe(header(config.banner.full, {'pkg' : pkg}))
		.pipe(gulp.dest(config.output))
		.pipe(rename({ suffix: '.min' }))
		.pipe(streamify(uglify()))
		.pipe(header(config.banner.min, {'pkg' : pkg}))
		.pipe(gulp.dest(config.output))
});


// Concatenate and browserify scripts
gulp.task('browserify', ['compile'], function() {
	return browserify(config.source + 'index.js').bundle()
		.pipe(source('mathee.js'))
		.pipe(gulp.dest(config.output))
});

// Compile TypeScript
gulp.task('compile', ['clean'], function () {
	var tscConfig = {
		target: "es3",
		module: "commonjs",
		noImplicitAny: false,
		removeComments: true,
		noLib: false
	};
	var tsResult = gulp.src(config.allTypeScript).pipe(tsc(tscConfig));
	tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
	return tsResult.js.pipe(gulp.dest(config.tsOutputPath));
});

// Remove preexisting content from output and test folders
gulp.task('clean', function() {
	return del([
		config.tsOutputPath + '**/*.js',
		config.tsOutputPath + 'index.js',
		config.testCoverage
	]);
});

// Lint all custom TypeScript files
gulp.task('ts-lint', function () {
	return gulp.src(config.allTypeScript)
		.pipe(tslint())
		.pipe(tslint.report('prose'));
});

// Run unit tests
gulp.task('test', ['compile'], function() {
	return gulp.src([config.tsOutputPath + '**/*.js'])
  	.pipe(plumber())
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src([config.specPath])
        .pipe(jasmine({reporter: new reporter()}))
        .pipe(istanbul.writeReports({dir: config.testCoverage}))
        .on('error', function(err) { throw err; });
    });
});

// Listen for file changes
gulp.task('listen', function () {
	var watcher = gulp.watch([config.allTypeScript, config.specPath])
	watcher.on('change', function(file) {
		gulp.start('default');
	});
});


/**
* Task Runners
*/

// Compile files
gulp.task('build', [
	'ts-lint',
	'clean',
	'compile',
	'browserify',
	'minify'
]);

// Compile files and run unit tests (default)
gulp.task('default', [
	'build',
	'test'
]);

// Compile files and run unit tests when something changes
gulp.task('watch', [
	'listen',
	'default'
]);
