const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//===========================================
// User Schema
//===========================================
const UserSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: String
});

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) {
    const user = this;
    const SALT_FACTOR = 10;

    if (!user.isModified('password'))
        return next();

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err)
            return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err)
                return next(err);

            user.password = hash;
            next();
        })
    })
});

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err)
            return callback(err);

        callback(null, isMatch);
    });
}

module.exports = mongoose.model('User', UserSchema);

