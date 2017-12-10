
let themeName = 'boilerplate';
themeName = process.env.NODE_ENV ? themeName + '-dev' : themeName;


if(process.env.npm_config_logs){
	console.log('\x1b[41m\x1b[37m');
	console.log('|-----------------------------------|');
	console.log('| Warning : control log disable !!! |');
	console.log('|-----------------------------------|', '\x1b[0m');
}

const gulp = require('gulp');
const fs = require('fs');
const path = require('path');  
const livereload = require('gulp-livereload');
const rename = require("gulp-rename");
const plumber = require('gulp-plumber');
const file = require('gulp-file');
const uniqid = require('uniqid').time();
const clean = require('gulp-clean');
const replace = require('gulp-string-replace');
const symlink = require('gulp-symlink');
const webserver = require('gulp-webserver');

const less = require('gulp-less');
const mcss = require('gulp-mcss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const spritesmith = require('gulp.spritesmith');

const webpack = require('gulp-webpack');
const uglify = require('gulp-uglify');

// srpites
gulp.task('sprite', () => {

	fs.readdir(path.resolve(__dirname, './src/styles/datas/img'), (err, files) => {

		let spriteFolder = [];

		for (let i = 0; i < files.length; i++) {

			if( /^sprite/.test(files[i]) && !/.*\..*/.test(files[i]) ){

				spriteFolder.push('@import \''+files[i]+'\';');

				let spriteData = gulp.src(`./src/styles/datas/img/${files[i]}/*.png`).pipe(spritesmith({
						padding: 2,
						// algorithm: 'left-right',
						// algorithmOpts: {sort: false},
						cssSpritesheetName: files[i],
						cssTemplate: (data) => {
							let template  = `.stitches-${data.spritesheet.name}(@x, @y, @width, @height, @scale:1) {\n`;
								template += `	background-position: @x*@scale @y*@scale;\n`;
								template += `	width: @width*@scale;\n`;
								template += `	height: @height*@scale;\n`;
								template += `	background-size : ${data.spritesheet.width}px*@scale ${data.spritesheet.height}px*@scale;\n`;
								template += `	background-image: url(datas/img/${data.spritesheet.name}.png);\n`;
								template += `	background-repeat: no-repeat;\n`;
								template += `}\n\n`;
								for (let i = 0; i < data.sprites.length; i++) {
									let sprite = data.sprites[i];
									template += `.sprite-${sprite.name}(@scale:1) { .stitches-${data.spritesheet.name}(${sprite.offset_x}px, ${sprite.offset_y}px, ${sprite.width}px, ${sprite.height}px, @scale); }\n`;
								}
								template += `\n\n`;
							return template;
						},
						imgName: `${files[i]}.png`,
						cssName: `${files[i]}.less`
					}
				));

				// create sprite image file
		        spriteData.img.pipe(gulp.dest('./src/styles/datas/img/'));

				// create sprite less file
		        spriteData.css.pipe(gulp.dest('./src/styles/'));

			}

		}

		// update style.less
		gulp.src('./src/styles/app.less')
	 		.pipe(replace(/\/\*\ssprites\s\*\/.*/g, '/* sprites */ ' + spriteFolder.join(' ')))
			.pipe(gulp.dest('./src/styles/'));

	});

});

// less : concat + autoprefix + minify
gulp.task('less', () => {

	if(process.env.NODE_ENV){

	 	return gulp.src('./src/styles/app.less')
	 		.pipe(plumber({
	        	errorHandler: (err) => {
	        		console.log(err.toString());
		            // this.emit('end');
		        }
		    }))
		    .pipe(less())
		    .pipe(postcss([
	        	autoprefixer({browsers: ['> 1%', 'IE 11', 'last 2 versions']})
		    ]))
		    .pipe(rename("./bundle.css"))
		    .pipe(gulp.dest('./'+themeName+'/styles'))
		    .pipe(livereload());

	}else{

		gulp.src('./'+themeName+'/styles/*.css', {read: false})
	        .pipe(clean());

	 	return gulp.src('./src/styles/app.less')
		    .pipe(less())
		    .pipe(rename("./min-"+uniqid+".css"))
		    .pipe(postcss([
	        	autoprefixer({browsers: ['> 1%', 'last 2 versions']})
		    ]))
		    .pipe(mcss())
		    .pipe(gulp.dest('./'+themeName+'/styles'));

	}
});

// webpack
gulp.task('webpack', () => {

	if(process.env.NODE_ENV){

	 	return gulp.src(['./src/js/app.js'])
	 		.pipe(webpack(require('./webpack.config.js')))
		    .pipe(rename("./bundle.js"))
		    .pipe(gulp.dest('./'+themeName+'/js'))
		    .pipe(livereload());

	}else{

		gulp.src('./'+themeName+'/js/*.js', {read: false})
	        .pipe(clean());

	 	return gulp.src(['./src/js/app.js'])
	 		.pipe(webpack(require('./webpack.config.js')))
	 		.pipe(replace(/log\.(loop|green|Green|info|red|orange|yellow|green|Green|blue|violet|white|grey|black|time|size|key|button|range|show)\(/g, function(a,b,c){
	 			// console.log(a,b,c)


	 			if(process.env.npm_config_logs) {
		 			console.log('\x1b[43m\x1b[37m','Warning : log.'+b+'() found !!!', '\x1b[0m');
	 			}else{
	 				console.log('\x1b[41m\x1b[37m','Error : log.'+b+'() found !!!', '\x1b[0m');
	 				process.exit();
	 			}
	 			return a;

	 		}))
		    // .pipe(uglify())
		    .pipe(rename("./min-"+uniqid+".js"))
		    .pipe(gulp.dest('./'+themeName+'/js'))
		    .pipe(livereload());


	}

});

// html
gulp.task('html', () => {

	let devtools  = '';

	if(process.env.NODE_ENV){
		
		devtools += '<style type="text/css">a:empty:not([title]){border: dashed 2px blue;}</style>';
		devtools += '<style type="text/css">img:not([width]),img[width=""]{border: dashed 2px orange;}</style>';
		devtools += '<style type="text/css">img:not([height]),img[height=""]{border: dashed 2px orange;}</style>';
		devtools += '<style type="text/css">img:not([alt]){border: dashed 2px red;}</style>';
		devtools += '<script type="text/javascript" id="dev-mode-82382">(function(){var s=document.createElement("style");s.type="text/css";s.id="dev-mode-93582";s.innerHTML="@keyframes dev-mode-alert{0%{opacity:0}50%{opacity:1}100%{opacity:0}}";document.body.appendChild(s);var d=document.createElement("div");d.id="dev-mode-29384";d.style="position:fixed;top:0;left:0;width:100%;height:2px;background:red;z-index:999999;opacity:0;animation: dev-mode-alert 1s linear;";document.body.appendChild(d);setTimeout(function(){d.remove();s.remove();document.getElementById("dev-mode-82382").remove()},2000)})();</script>';
		devtools += '<script src="http://log.matdev.fr/mylog.dev-6.0.0.js"></script>';

	 	return gulp.src(['./src/**/*.html'])
	 		.pipe(replace(/\{\@filename\@\}/g, 'bundle'))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, '<!-- devtools -->'+devtools+'<!-- !devtools -->'))
		    .pipe(gulp.dest('./'+themeName+'/'))
		    .pipe(livereload());
	}else{

		devtools += '<script type="text/javascript">(function(){var methods=[\'html\',\'show\',\'hide\',\'info\',\'loop\',\'red\',\'Red\',\'orange\',\'yellow\',\'green\',\'Green\',\'blue\',\'violet\',\'white\',\'grey\',\'black\',\'time\',\'size\',\'key\',\'button\',\'range\'];var length=methods.length;var console=(window.log=window.log||{});while(length--){if(!log[methods[length]])log[methods[length]]=function(){};}})();</script>'

		gulp.src('./'+themeName+'/**/*.html', {read: false})
	        .pipe(clean());

	 	return gulp.src(['./src/**/*.html'])
	 		.pipe(replace(/\{\@filename\@\}/g, 'min-'+uniqid))
	 		.pipe(replace(/\<\!\-\- devtools \-\-\>/g, process.env.npm_config_logs ? '<!-- devtools -->'+devtools+'<!-- !devtools -->' : ''))
		    .pipe(gulp.dest('./'+themeName+'/'));

	}


});

// medias
gulp.task('medias', () => {

	if(process.env.NODE_ENV){

	  	gulp.src('./src/styles/datas')
			.pipe(symlink('./'+themeName+'/styles/datas', {force: true}));

	  	return gulp.src('./src/img')
			.pipe(symlink('./'+themeName+'/img', {force: true}))

	}else{

	  	return gulp.src(['./src/**/*.jpg', './src/**/*.jpeg', './src/**/*.gif', './src/**/*.png', './src/**/*.woff', './src/**/*.woff2', './src/**/*.ttf', './src/**/*.svg', './src/**/*.eot', '!./src/styles/datas/img/sprites/*', '!./src/**/favicon.*'])
		    .pipe(gulp.dest('./'+themeName+'/'));

	}

});


// server
gulp.task('webserver', function() {

	if(process.env.NODE_ENV){
		return gulp.src('./'+themeName)
		    .pipe(webserver({
				livereload: true,
				directoryListing: false,
				open: true,
				port: 8080
		    }));
	}
});


// watch
gulp.task('watch', () => {

	if(!process.env.NODE_ENV) return;

	livereload.listen();

	gulp.watch('./src/styles/**/*.less', ['less']);
	gulp.watch(['./src/**/*.html'], ['html']);
	gulp.watch('./src/js/**/*.js', ['webpack']);

});




gulp.task('default', ['webserver','watch', 'medias', 'html', 'webpack', 'less']);

