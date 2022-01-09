const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const maxAge = 24 * 60 * 60 * 3;
require('dotenv').config();

//Route-1: Registering a new User
router.post('/createUser', async (req, res) => {
    const { firstName, lastName, userName, email, password, rePassword } = req.body;

    try {
        const user = await User.create({
            firstName,
            lastName,
            userName,
            email,
            password,
            rePassword
        });

        const authToken = generateAccessToken(user);
        res.cookie('AuthToken', authToken, { httpOnly: true, maxAge: maxAge * 1000, sameSite: "lax" });
        res.status(201).json({ user: user._id });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ error: errors });
    }
});

//Route-2: Authenticating an existing user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const authToken = generateAccessToken(user);
        res.cookie('AuthToken', authToken, { httpOnly: true, maxAge: maxAge * 1000, sameSite: "lax" });
        res.status(200).json({ user: user._id });

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ error: errors });
    }
});

//Utility Functions
function handleErrors(err) {
    const errors = { firstName: '', lastName: '', userName: '', email: '', password: '', rePassword: '', alert: '' };
    if (err.message === "Invalid Credentials")
        errors.alert = "Invalid credentials";

    if (err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    if (err.code === 11000)
        errors.alert = "User already exists";

    return errors;
}

function generateAccessToken(user) {
    return jwt.sign({ user: { id: user._id, isAdmin: user.isAdmin } }, process.env.ACCESS_TOKEN, { expiresIn: maxAge });
}

module.exports = router;