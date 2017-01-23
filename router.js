const AuthenticationController = require('./controllers/authentication');
const express = require('express');
const passportService = require('./config/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireLogin = passport.authenticate('local', {session: false});

module.exports = function (app) {
    // Initializing route groups
    const authRoutes = express.Router();

    //======================================
    // Auth routes
    //======================================

    // Registration route
    authRoutes.post('/register', AuthenticationController.register);

    // Login route
    authRoutes.post('/login', requireLogin, AuthenticationController.login);

    // Set url for API group routes
    app.use('/auth', authRoutes);
}
