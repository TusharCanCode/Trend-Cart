const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First Name cannot be empty"],
        validate: [ValidateName, "Enter a valid name"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name cannot be empty"],
        validate: [ValidateName, "Enter a valid name"]
    },
    userName: {
        type: String,
        required: [true, "Username cannot be empty"],
        unique: true,
        minlength: [5, "Username length must be between 5 to 25 characters"],
        maxlength: [25, "Username length must be between 5 to 25 characters"]
    },
    email: {
        type: String,
        required: [true, "Email cannot be empty"],
        unique: true,
        validate: [ValidateEmail, "Enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password cannot be empty"],
        minlength: [8, "Password length must be between 8 to 25 characters"],
        maxlength: [25, "Password length must be between 8 to 25 characters"],
        validate: [ValidatePassword, "Invalid Password - Your password must be between 8 to 25 characters, should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character!"]
    },
    profilePicture: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},

    { timestamps: true }

);

//Re-entered password
userSchema.virtual('rePassword').get(function () {
    return this._rePassword;
})
    .set(function (value) {
        this._rePassword = value;
    });

userSchema.path('password').validate(function () {
    if (this.password !== this._rePassword)
        this.invalidate('rePassword', "Passwords doesn't match");
})

// Creating hash of the password before saving it to the database
userSchema.pre("save", async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    const SALT_WORK_FACTOR = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
});

//Static Method for Login
userSchema.statics.login = async function (email, password) {
    try {
        const user = await this.findOne({ email });
        if (user) {
            const compare = await bcrypt.compare(password, user.password);
            if (!compare)
                throw Error("Invalid Credentials");

            return user;
        }
        throw Error("Invalid Credentials");

    } catch (error) {
        throw Error("Invalid Credentials");
    }
}

//Utility Functions
function ValidateEmail(mail) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!(mail.match(mailformat)))
        return false;

    return true;
}

function ValidateName(name) {
    let nameFormat = /^[a-zA-Z]+$/;
    if (!(name.match(nameFormat)))
        return false;

    return true;
}

function ValidatePassword(password) {
    let paswd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,25}$/;
    if (!(password.match(paswd)))
        return false;

    return true;
}

let User = new mongoose.model('User', userSchema);
module.exports = User;