var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let hbs = require('express-handlebars')
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

let fileUpload = require('express-fileupload');
let db = require('./config/connection')
let session = require('express-session');
var app = express();
var nocache = require('nocache');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "eppudraa",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(nocache());
db.connect((err)=>{
  err?console.log("Connection failed"):console.log("successfully connected to the database");

})
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
