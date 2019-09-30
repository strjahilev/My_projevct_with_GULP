let gulp = require('gulp');
let sass = require('gulp-sass');
let browserSync = require('browser-sync');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let cssnano = require('gulp-cssnano');
let rename = require('gulp-rename');
let del = require('del');
let imagemin = require('gulp-imagemin');
let pngquant = require('imagemin-pngquant');
let cashe = require('gulp-cache');
let autoprefixer = require('gulp-autoprefixer');

// работа с scss файлами
gulp.task('scss-css', async function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass()) //преобразование sass файлов в css
        .pipe(autoprefixer(['last 15 versions','ie 8', 'ie 7'], {cascade:true})) // добавдение автопрефиксов
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream:true}))
});
//минимизация css файлов
gulp.task('css-libs', async function () {
    return gulp.src('app/css/libs.css')
        .pipe(cssnano())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/css'))
});
//объединение задач касающихся стилей
gulp.task('all-css', gulp.parallel('scss-css','css-libs'));


//объединение объединение и минификация js библиотек (jquery,magnific-popup)
gulp.task('scripts', async function (){
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
   ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
});
//запуск сервера прослушивания проекта стадия разработки
gulp.task('browser-sync', function () {
   browserSync({
       server: {
           baseDir: 'app'
       },
       notify: false
   })
});
// задача автоперезапуска браузера стадия разработки
gulp.task('reload', function(){
    browserSync.reload()
});
// очистка перед сборкой проэкта
gulp.task('clean', async function () {
   return del.sync('dist')
});
//очиска кэша при оптимизации картинок
gulp.task('clear', function () {
    return cashe.clearAll()
});
//cжатие картинок
gulp.task('img', async function () {
    return gulp.src('app/img/**/*')
        .pipe(cashe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.svgo({
                plugins:{removeViewBox: false}
            }),
            pngquant()
       ])))
        .pipe(gulp.dest('dist/img'))
});
// просматривание проэкта в режиме онлайн на стадии разработки
gulp.task('watch', function () {
    gulp.watch('app/scss/**/*.scss', gulp.parallel('scss-css'));
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch('app/js/**/*.js').on('change', browserSync.reload)
});
//построение продакшн проекта
gulp.task('build', async function () {
    let buildCss = gulp.src([
        'app/css/main.css',
        'app/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));
    let buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
    let buildJs= gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'));
    let buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

//полная сборка проэкта
gulp.task('building', gulp.parallel('clean', 'img','all-css', 'scripts', 'build'));
//запуск сервера для просмотра всех изменений на стадии разработки
gulp.task ( 'default', gulp.parallel('browser-sync', 'all-css', 'scripts','watch'));
