const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const config = require('../config/main');

function generateToken(user) {
    return jwt.sign(user, config.secret);
}

function setUserInfo(request) {
    return {
        _id: request._id,
        email: request.email
    };
}

//===============================================
// Login Route
//===============================================
exports.login = function (req, res, next) {
    const email = req.body.email;
    const userInfo = setUserInfo(req.user);
    const token = 'JWT ' + generateToken(userInfo);

    User.findOneAndUpdate({email: email}, {token: token}, function (err, user) {
        if (err) {
            res.status(401).json({
                msg: "There is no user with this credentials",
                success: false
            });

            return next(err);
        }

        if (user) {
            res.status(200).json({
                token: token,
                user: userInfo
            });
        }
    });
};

//===============================================
// Registration Route
//===============================================
exports.register = function (req, res, next) {
    // Check for registration errors
    const email = req.body.email;
    const password = req.body.password;

    // Return error if no email provided
    if (!email) {
        return res.status(422).send({ error: 'You must enter an email address.'});
    }

    // Return error if no password provided
    if (!password) {
        return res.status(422).send({ error: 'You must enter a password.' });
    }
    
    User.findOne({email: email}, function (err, existingUser) {
        if (err)
            return next(err);

        // If user is not unique, return error
        if (existingUser) {
            return res.status(422).send({ error: 'That email address is already in use.' });
        }

        // If email is unique and password was provided
        const user = new User({
            email: email,
            password: password,
        });

        user.save(function (err, user) {
            if (err)
                return next(err);

            const userInfo = setUserInfo(user);

            res.status(201).json({
                token: 'JWT ' + generateToken(userInfo),
                user: userInfo
            });
        });
    });
};

//===============================================
// Forgot Password Route
//===============================================
exports.forgotPassword = function (req, res, next) {
    const email = req.body.email;

    User.findOne({email: email}, function(err, existingUser) {
        if (err || existingUser == null) {
            res.status(422).json({
                error: 'Your request could not be performed!'
            });
            return next(err);
        }

        crypto.randomBytes(48, function (err, buffer) {
            const resetToken = buffer.toString('hex');
            if (err)
                return next(err);

            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000;

            existingUser.save(function (err) {
                if (err)
                    return next(err);

                const message = {
                    subject: 'Reset Password',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://' + req.headers.host + '/reset-password/' + resetToken + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                return res.status(200).json({ message: 'Please check your email for the link to reset your password.' });
            });
        });
    });


}