const express = require('express');
const { fetch, authenticate, authenticateAdminOnly } = require('../middleware/TokenVerification');
const Order = require('../models/Order');
const router = express.Router();

//Route-1: Create a new order
router.post('/createOrder', fetch, async (req, res) => {
    try {
        req.body.userId = req.user.id;
        const newOrder = await Order.create(req.body);
        res.status(200).json(newOrder);
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ error: errors });
    }
});

//Route-2: Updating an existing order
router.put('/:id', authenticateAdminOnly, async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        order = await Order.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        return res.status(200).json(order);
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ error: errors });
    }
});

//Route-3: Deleting an existing order
router.delete('/:id', authenticateAdminOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        return res.status(200).json({ message: { alert: "Order has been deleted successfully!" } });
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-4: Getting details of an user order
router.get('/details/:id', authenticate, async (req, res) => {
    try {
        let orders = await Order.find({ userId: req.user.id });
        if (!orders)
            return res.status(404).json({ error: { alert: "Not Found" } });

        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-5: Getting details of all existing orders
router.get('/', authenticateAdminOnly, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-6: Getting the monthly income
router.get("/income", authenticateAdminOnly, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount"
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" }
                }
            }
        ]);
        res.status(200).json(income);
    } catch (err) {
        return res.status(500).json({ error: { alert: err.message } });
    }
});

//Utility Functions
function handleErrors(err) {
    const errors = { userId: '', amount: '', address: '', alert: '' };
    if (err.message.includes("Validation failed") || err.message.includes("validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports = router;