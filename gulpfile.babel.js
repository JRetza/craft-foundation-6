'use strict';
import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import gulp     from 'gulp';
import rimraf   from 'rimraf';
import yaml     from 'js-yaml';
import fs       from 'fs';

// load all gulp plugins into one variable
const $ = plugins();

// check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// load settings from config.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// build the "lib" folder by running all of the below tasks
gulp.task('build',
 gulp.series(clean, gulp.parallel(sass, javascript, images, copy)));

// build, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch));

// start clean - delete the "lib" folder
// this happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// copy files out of the src folder
// this task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.src)
    .pipe(gulp.dest(PATHS.dist));
}

// compile sass into css
function sass() {
  // load up your CSS/SASS customizations
  return gulp.src('src/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass // (see config.yml)
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // put everything nicely into one file
    .pipe($.concat('display.css'))
    // with the --production flag, the css is cleaned 
    .pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    // then compressed && stripped of all comments
    .pipe($.if(PRODUCTION, $.cssnano({discardComments: {removeAll: true}})))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    // output destination - directly into /site/lib/display.css
    .pipe(gulp.dest(PATHS.dist + '/css'))
    // lastly reload the browser
    .pipe(browser.reload({ stream: true }));
}

// combine javascript into one file
function javascript() {
  // get all the foundation javascript libraries && anything custom (see config.yml)
  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat('app.js'))
    // with the --production flag, the file is minified
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    // output destination - i.e. /site/lib/js/
    .pipe(gulp.dest(PATHS.dist + '/js'));
}

// copy images to the lib dir
function images() {
  return gulp.src('src/gr/**/*')
    // with the --production flag, the images are compressed
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    // output destination - i.e. /lib/gr/
    .pipe(gulp.dest(PATHS.dist + '/gr'));
}

// startup browser-sync - edit YOURDOMAIN below
function server(done) {
    browser.init({
        notify: false,
        port: 3000,
        proxy: {
            target: "http://YOURDOMAIN.dev",
            middleware: function (req, res, next) {
                console.log(req.url);
                next();
            }
        },
        ui: {
            port: 3001
        }
    });
    done();
}

// watch for changes to static files, templates, sass, and javascript
function watch() {
  gulp.watch(PATHS.src, copy);
  // watch your craft templates directory i.e /templates/
  gulp.watch('./craft/templates/**/*.html').on('change',gulp.series(sass, browser.reload));
  gulp.watch('src/scss/**/*.scss').on('change',gulp.series(sass, browser.reload));
  gulp.watch('src/js/**/*.js').on('change',gulp.series(javascript, browser.reload));
  gulp.watch('src/img/**/*').on('change',gulp.series(images, browser.reload));
  gulp.watch('./gulpfile.babel.js').on('change',gulp.series(javascript, browser.reload));
}
