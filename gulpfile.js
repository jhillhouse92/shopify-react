var gulp = require('gulp');
var gulpShopify = require('gulp-shopify-upload');
var gulpif = require('gulp-if');
var crisper = require('gulp-crisper');
var webpack = require('webpack-stream');
var named = require('vinyl-named');
var inline = require('gulp-inline');
var rename = require('gulp-rename');
var webpackConfig = require('./webpack-gulp.config.js');
var gutil = require('gulp-util');
var path = require('path');
var flatten = require('gulp-flatten');
var del = require('del');

/*
 *  Introduction
 * 
 *  This gulp is configured to support the following objectives:
 *
 *      1.) Automate the build process for Shopify themes (i.e. allowing custom folder structure, LESS instead SCSS that shopify builds, and JS frameworks such as React)
 *      2.) Enable support with React and ES6 using Webpack for use in a Shopify theme
 *      3.) Enable support with React templates using liquid code (i.e. Allows inline react templates to utilize Shopify's liquid theme language)
 * 
 *   Caveats
 *
 *   Because {{ double curly braces }} are apart of JSX syntax, usage of React templates inside Liquid snippets or templates REQUIRES you to use React.createComponent, JSX WILL NOT WORK WITH LIQUID! 
 */

gulp.task('shopifywatch', ['build'], function () {
    var options = {
        'basePath': 'build/'
    };

    return gulp.src('./build/+(assets|layout|config|snippets|templates|locales)/**')
        .pipe(gulpShopify('c5d913665ac8423fcbcf1fa43cbb38c5', 'eac7e40d2784b9fe539c94b542f19d8b', 'vavavoo-2.myshopify.com', '95356166', options));
});

gulp.task('crisper-theme', function() {
    var stream = gulp.src('src/layout/theme.liquid')
        .pipe(crisper({
            scriptInHead: false
        }))
        .pipe(gulp.dest('src/crisper-tmp/layout'));
    
    return stream;
});

/*
 * This task is to pull out any inline JS (ES6) code and write as its own JS file
 * They must be written to the hard disk because webpack only takes the vinyl file path not the contents
 */
gulp.task('crisper', ['crisper-theme'], function () {
    var stream = gulp.src(['src/**/*.liquid', '!src/layout/theme.liquid'])
        .pipe(crisper({
            scriptInHead: false,
            parseAsFragment: true
        }))
        .pipe(flatten({ includeParents: 1} ))
        .pipe(gulp.dest('src/crisper-tmp'));

    return stream;
});

gulp.task('update-webpack-config', ['crisper'], function () {
    var stream = gulp.src(['src/crisper-tmp/**/*.js', '!src/crisper-tmp/assets/*.js'])
        .pipe(gulpif('*.js', named(function (file) {
            //we want relative to crisper-tmp
            var name = path.relative(__dirname + '/src/crisper-tmp/', file.path);
            name = name.slice(0, -path.extname(name).length);
            
            var relative = path.relative(__dirname, file.path);
            relative = './' + relative; 
            
            /*gutil.log('The full path is:', file.path);
            gutil.log('The directory path is:', __dirname);
            gutil.log('The relative path is:', relative);*/
            
            webpackConfig.entry[name] = relative;
            //gutil.log(webpackConfig);
        })));
    
    return stream;
});

/*
 * This task is to compile the JS files created from crisper
 * To do: support production flag to minify based on gulp flag
 */
gulp.task('webpack', ['update-webpack-config'], function () {
    var stream = gulp.src(['src/crisper-tmp/**/*.js', '!src/crisper-tmp/assets/*.js'])
        .pipe(gulpif('*.js', webpack(webpackConfig)))
        .pipe(gulp.dest('src/crisper-tmp'));

    return stream;
});

/*
 * This task takes the generated JS from webpack and adds it inline
 * so that Shopify can execute the {{ liquid }} statements
 */
gulp.task('compile-inline', ['webpack'], function () {
    var stream = gulp.src('src/crisper-tmp/**/*.html')
        .pipe(inline({
            base: 'src/crisper-tmp/',
            disabledTypes: ['svg', 'img', 'css'] // Only inline js files
        }))
        .pipe(gulp.dest('src/crisper-tmp'));

    return stream;
});


/*
 * This task copies the files from [compile-inline] into the build folder
 */
gulp.task('build', ['compile-inline'], function () {
    var stream = gulp.src('src/crisper-tmp/**/*.html')
        .pipe(rename(function (file) {
            file.extname = '.liquid';
            return file;
        }))
        .pipe(gulp.dest('./build'));
    
    return stream;
});

gulp.task('default', ['shopifywatch'], function () {
    del(['src/crisper-tmp/**', '!src/crisper-tmp']);
});
