var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var server = require("browser-sync").create();
var reload = server.reload;
var run = require("run-sequence");
var svgstore = require("gulp-svgstore");
var del = require("del");
var pug = require("gulp-pug");
/*var uglify = require("gulp-uglify");
var svgmin = require("gulp-svgmin");
var path = require("path");
var htmlmin = require("gulp-htmlmin");*/

gulp.task("style", function(){
	gulp.src("app/sass/**/*.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })
		]))
		.pipe(gulp.dest('dist/css'))
    .pipe(reload({stream : true}))
		.pipe(minify({
			restructure: false,
      sourceMap: true,
      debug: true
		}))
		.pipe(rename("style.min.css"))
		.pipe(gulp.dest("dist/css"));
});

gulp.task("pug", function(){
  gulp.src("app/source/pages/**/*.pug")
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
    }))
    .pipe(server.stream())
    .pipe(gulp.dest("dist"));
});

gulp.task("html", function () {
  return gulp.src("app/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(server.stream())
    .pipe(gulp.dest("dist"));
});

gulp.task("images", function() {
  return gulp.src("app/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img"));
});

gulp.task("webp", function() {
  return gulp.src("app/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("img"));
});

gulp.task("sprite", function () {
  return gulp.src("app/img/{icon-*,logo-*}.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("dist/img"))
});


gulp.task("serve", function() {
  server.init({
    server: "dist/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("app/sass/**/*.scss", ["style"]);
  gulp.watch("app/source/**/*.pug", ["pug"]);
  gulp.watch("app/js/**/*.js", ["js"]);
});

gulp.task("copy", function() {
  return gulp.src([
    "app/font/**/*.{woff,woff2,ttf}",
    "app/img/**/*.{jpg,png,svg,webp,mp4,webm}",
    "app/js/**/*.js"
  ], {
    base: "app"
  })
  .pipe(gulp.dest("dist"));
});

gulp.task("clean", function() {
  return del("dist");
});

gulp.task("build", function (done) {
  run(
      "clean",
      "copy",
      "style",
      "sprite",
      "pug",
      done
  );
});