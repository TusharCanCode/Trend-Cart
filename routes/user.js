const express = require('express');
const { fetch, authenticate, authenticateAdminOnly } = require('../middleware/TokenVerification');
const User = require('../models/User');
const router = express.Router();

//Route-1: Updating an existing user
router.put('/:id', authenticate, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true, runValidators: true });
        return res.status(200).json(user);
    } catch (error) {
        const errors = handleErrors(error);
        return res.status(500).json({ error: errors });
    }
});

//Route-2: Deleting an existing user
router.delete('/:id', authenticate, async (req, res) => {
    try {
        let user = await User.findByIdAndDelete(req.user.id);
        if (!user)
            return res.status(404).json({ error: { alert: "Not Found" } });

        if (req.user.id === req.params.id)
            res.cookie('AuthToken', '', { httpOnly: true, maxAge: 1, sameSite: "lax" });
        return res.status(200).json({ message: { alert: "Account has been deleted successfully!" } });
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-3: Getting details of an existing user
router.get('/details/:id', fetch, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: { alert: "Not Found" } });

        const { password, updatedAt, ...other } = user._doc;
        return res.status(200).json(other);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-4: Getting details of recent existing users
router.get('/', authenticateAdminOnly, async (req, res) => {
    const query = req.query.new;
    try {
        const users = query
            ? await User.find().sort({ _id: -1 }).limit(5)
            : await User.find();
        res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-5: Getting stats of recent existing users
router.get('/stats', authenticateAdminOnly, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" }
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Utility Functions
function handleErrors(err) {
    const errors = { firstName: '', lastName: '', userName: '', email: '', password: '', rePassword: '', alert: '' };
    if (err.message.includes("Validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    if (err.code === 11000)
        errors.alert = "User already exists";

    return errors;
}

module.exports = router;