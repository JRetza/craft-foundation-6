'use strict';
import plugins       from 'gulp-load-plugins';
import yargs         from 'yargs';
import browser       from 'browser-sync';
import gulp          from 'gulp';
// import panini        from 'panini';
import rimraf        from 'rimraf';
import sherpa        from 'style-sherpa';
import yaml          from 'js-yaml';
import fs            from 'fs';
import webpackStream from 'webpack-stream';
import webpack2      from 'webpack';
import named         from 'vinyl-named';

// load all gulp plugins into one variable
// ----------------------------------------
const $ = plugins();

// check for --production flag
// ----------------------------------------
const PRODUCTION = !!(yargs.argv.production);

// load settings from config.yml
// ----------------------------------------
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// build the "lib" dir running all of the below tasks
// ----------------------------------------------------
gulp.task('build',
 gulp.series(clean, gulp.parallel(sass, javascript, images, copy), styleGuide));

// build, run the server, and watch for changes
// ---------------------------------------------
gulp.task('default',
  gulp.series('build', server, watch));

// start clean - delete the "lib" folder
// this happens every time a build starts
// ----------------------------------------
function clean(done) {
    rimraf(PATHS.dist, done);
}

// copy files out of the src folder
// this task skips over the "img", "js",
// and "scss" dirs (parsed separately)
// ----------------------------------------
function copy() {
    return gulp.src(PATHS.src)
    .pipe(gulp.dest(PATHS.dist));
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
// -----------------------------------------------------
function styleGuide(done) {
  sherpa('src/styleguide/index.md', {
    output: PATHS.dist + '/styleguide.html',
    template: 'src/styleguide/template.html'
  }, done);
}

// compile sass into css
// ----------------------------------------
function sass() {
  return gulp.src('src/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe($.concat('app.css'))
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/css'))
    .pipe(browser.reload({ stream: true }));
}


let webpackConfig = {
  rules: [
    {
      test: /.js$/,
      use: [
        {
          loader: 'babel-loader'
        }
      ]
    }
  ]
}

// combine javascript into one file
// ----------------------------------------
function javascript() {
  return gulp.src(PATHS.entries)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream({module: webpackConfig}, webpack2))
    .pipe($.concat('app.js'))
    // in production, the file is minified
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/js'));
}

// copy images to the lib dir
// ----------------------------------------
function images() {
  return gulp.src('src/gr/**/*')
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    .pipe(gulp.dest(PATHS.dist + '/gr'));
}

// startup the hc development server
// ----------------------------------------
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

// Reload the browser with BrowserSync
// ----------------------------------------------------------------
function reload(done) {
  browser.reload();
  done();
}

// watch for changes to static src, templates, sass, and javascript
// ----------------------------------------------------------------
function watch() {
  gulp.watch(PATHS.src, copy);
  gulp.watch('./craft/templates/**/*.html').on('change',gulp.series(sass, browser.reload));
  gulp.watch('./src/scss/**/*.scss').on('all',gulp.series(sass, browser.reload));
  gulp.watch('./src/js/**/*.js').on('change',gulp.series(javascript, browser.reload));
  gulp.watch('./src/img/**/*').on('change',gulp.series(images, browser.reload));
  gulp.watch('./gulpfile.babel.js').on('change',gulp.series(javascript, browser.reload));
}
