// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

// File path variables
const files = {
  scssPath: 'app/scss/**/*.scss',
  jsPath: 'app/js/**/*.js',
  htmlPath: './*.html'
};

// Sass task
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// JS task
function jsTask() {
  return src(files.jsPath)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest('dist'));
}

// Cachebusting task
const cbString = new Date().getTime();
function cacheBustTask() {
  return src(['index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('.'));
}

// Watch task
function watchTask() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    notify: false
  });

  watch([files.scssPath, files.jsPath], parallel(scssTask, jsTask));

  watch(files.htmlPath).on('change', browserSync.reload);
  watch(files.jsPath).on('change', browserSync.reload);
}

// Default task
exports.default = series(parallel(scssTask, jsTask), cacheBustTask, watchTask);
