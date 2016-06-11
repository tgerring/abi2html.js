var gulp = require('gulp'),
    gutil = require('gulp-util'),
    es = require('event-stream');

var plugins = require('gulp-load-plugins')({
    camelize: true
});

var config = require('./gulpfile.config');

var isProduction = (gutil.env.prod === true ? true : false);
var date = new Date();
var nicedate = date.toISOString().replace(/(\-|:|\.)/g, '');

gulp.task('clean', function() {
    return gulp.src(config.basePaths.dest)
        .pipe(plugins.clean());
});

gulp.task('scripts', function() {
    return es.merge(
            es.merge(

                gulp.src(config.typeMap.coffee, { cwd: config.typePaths.scripts.src })
                .pipe(plugins.coffee()),

                gulp.src(config.typeMap.js, { cwd: config.typePaths.scripts.src }))

            // .pipe(plugins.jshint())
            // .pipe(plugins.jshint.reporter('default'))

            .pipe(isProduction ? plugins.uglify() : gutil.noop()),

            gulp.src(config.typeMap.jslibs, { cwd: config.typePaths.scripts.src }))
        .pipe(plugins.order(config.scriptOrder))
        .pipe(plugins.concat(config.appName + '.js'))

    .pipe(plugins.size({ title: 'scripts', showFiles: false, gzip: true }))
        .pipe(isProduction ? gutil.noop() : plugins.connect.reload())
        .pipe(gulp.dest(config.typePaths.scripts.dest));
});



gulp.task('extras', function() {
    return gulp.src(config.appFiles.extras, { cwd: config.typePaths.extras.src })
        .pipe(plugins.size({ title: 'extras', showFiles: false }))
        .pipe(isProduction ? gutil.noop() : plugins.connect.reload())
        .pipe(gulp.dest(config.typePaths.extras.dest));
});

gulp.task('bundle', function() {
    var archiveName = config.appName + '.' + nicedate + '.zip';
    console.log(archiveName);
    return gulp.src(config.basePaths.dest + config.GLOBSTAR)
        .pipe(plugins.zip(archiveName))
        .pipe(plugins.size({ title: 'Bundle', showFiles: true }))
        .pipe(gulp.dest('..'));
});

gulp.task('rename', function() {
    return gulp.src(config.typePaths.templates.dest + 'index.html')
        .pipe(isProduction ? plugins.rename('index.' + nicedate + '.html') : gutil.noop())
        .pipe(isProduction ? plugins.rename(config.appName + '.' + nicedate + '.html') : gutil.noop())
        .pipe(gulp.dest(config.typePaths.templates.dest));
});




// Define the default task as a sequence of the above tasks
// Additionally, enable production build on any task by adding "--prod"
gulp.task('build', ['clean'], function() {
    gulp.start('extras', 'scripts', 'rename');
});


gulp.task('default', function() {
    gulp.start('build');
});
