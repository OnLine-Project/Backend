const express = require('express');
const app = express();
const logger = require('morgan');
const config = require('./config/main');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./router')

// Database connection
mongoose.connect(config.database);

// Start server listen at port 3000
app.listen(config.port);

// Enable console logs
app.use(logger('dev'));

// Enable cross-origin requests from client side
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-AllowCredentials", "true");
    next();
});

// Enable body parser to transform urlencoded bodies to JSON and expose the object to req.body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router(app);

