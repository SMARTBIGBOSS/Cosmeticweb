var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cosmetics = require("./routes/cosmetics");
const customers = require("./routes/customers");
const sellers = require("./routes/sellers");
const transactions = require("./routes/transactions");
const user_images = require("./routes/user_images");
const auth = require("./middleware/auth");

var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./userLogo'));


app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if (req.method === 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
});

app.get('/cosmetics', cosmetics.findAll);
app.get('/cosmetic/:id', cosmetics.findOne);
app.get('/cosmetics/sortByLowPrice', cosmetics.sortByLowPrice);
app.get('/cosmetics/sortByHighPrice', cosmetics.sortByHighPrice);
app.get('/cosmetics/:name', cosmetics.findByName);
app.get('/cosmetics/:name/:brand', cosmetics.filterByBrand);
app.get('/customer/:id', auth.authCustomer, customers.findOne);
app.get('/sellers', sellers.findAll);
app.get('/seller/:id',sellers.findOne);
app.get('/transaction/:buyerId', auth.authCustomer, transactions.findByBuyerId);
app.get('/transactions', transactions.findAll);
app.get('/transactions/countSales', transactions.countSales);

app.put('/cosmetics/:id/edit', cosmetics.editByID);
app.put('/customer/:id/edit', auth.authCustomer, customers.editByID);
app.put('/seller/:id/edit', auth.authSeller, sellers.editByID);
app.put('/transaction/:buyerId/:id/edit', auth.authCustomer, transactions.edit);
app.put('/transaction/:id/order', auth.authCustomer, transactions.order);
app.put('/transaction/:id/delivery', auth.authSeller, transactions.delivery);
app.put('/transaction/:id/confirmReceipt', auth.authCustomer, transactions.ConfirmReceipt);

app.post('/cosmetics/:publisher/add', auth.authSeller, cosmetics.addCosmetic);
app.post('/customer/signUp', customers.signUp);
app.post('/customer/login', customers.login);
app.post('/seller/signUp', sellers.register);
app.post('/seller/login', sellers.login);
app.post('/transaction/:buyerId/add/:cosmeId',auth.authCustomer, transactions.add);
app.post('/customer/:id/uploadLogo', auth.authCustomer, user_images.uploadImage);
app.post('/seller/:id/uploadLogo', auth.authSeller, user_images.uploadImage);

app.delete('/cosmetics/:publisher/:id/delete', auth.authSeller, cosmetics.removeCosmetic);
app.delete('/transaction/:buyerId/:id/remove', auth.authCustomer, transactions.remove);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}

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
