const express = require('express');
const { fetch, authenticate, authenticateAdminOnly } = require('../middleware/TokenVerification');
const Cart = require('../models/Cart');
const router = express.Router();

//Route-1: Create a new cart
router.post('/createCart', fetch, async (req, res) => {
    try {
        req.body.userId = req.user.id;
        const newCart = await Cart.create(req.body);
        res.status(200).json(newCart);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-2: Updating an existing cart
router.put('/:id', fetch, async (req, res) => {
    try {
        let cart = await Cart.findById(req.params.id);
        if (!cart)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        if (!req.user.isAdmin && cart.userId.toString() !== req.user.id)
            return res.status(403).json({ error: { alert: "Cannot perfrom operations on this cart!" } });

        cart = await Cart.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-3: Deleting an existing cart
router.delete('/:id', fetch, async (req, res) => {
    try {
        let cart = await Cart.findById(req.params.id);
        if (!cart)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        if (!req.user.isAdmin && cart.userId.toString() !== req.user.id)
            return res.status(403).json({ error: { alert: "Cannot perfrom operations on this cart!" } });

        cart = await Cart.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: { alert: "Cart has been deleted successfully!" } });
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-4: Getting details of an user cart
router.get('/details/:id', authenticate, async (req, res) => {
    try {
        let carts = await Cart.findOne({ userId: req.user.id });
        if (!carts)
            return res.status(404).json({ error: { alert: "Not Found" } });

        return res.status(200).json(carts);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-5: Getting details of all existing carts
router.get('/', authenticateAdminOnly, async (req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

module.exports = router;