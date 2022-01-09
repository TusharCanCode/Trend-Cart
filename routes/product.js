const express = require('express');
const { authenticateAdminOnly } = require('../middleware/TokenVerification');
const Product = require('../models/Product');
const router = express.Router();

//Route-1: Create a new product
router.post('/createProduct', authenticateAdminOnly, async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(200).json(newProduct);
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ error: errors });
    }
})

//Route-2: Updating an existing product
router.put('/:id', authenticateAdminOnly, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ error: { alert: "Not Found!" } });

        product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        return res.status(200).json(product);
    } catch (error) {
        const errors = handleErrors(error);
        return res.status(400).json({ error: errors });
    }
});

//Route-3: Deleting an existing product
router.delete('/:id', authenticateAdminOnly, async (req, res) => {
    try {
        let product = await Product.findByIdAndDelete(req.params.id);
        if (!product)
            return res.status(404).json({ error: { alert: "Not Found" } });

        return res.status(200).json({ message: { alert: "Product has been deleted successfully!" } });
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-4: Getting details of an existing product
router.get('/details/:id', async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ error: { alert: "Not Found" } });

        const { updatedAt, ...other } = product._doc;
        return res.status(200).json(other);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Route-5: Filtering details of existing products
router.get('/', authenticateAdminOnly, async (req, res) => {
    const queryNew = req.query.new;
    const queryCategory = req.query.category;
    try {
        let products;
        if (queryNew) {
            products = await Product.find().sort({ _id: -1 }).limit(1);
        }
        else if (queryCategory) {
            products = await Product.find({ categories: { $in: [queryCategory] } });
        }
        else {
            products = await Product.find();
        }
        res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ error: { alert: error.message } });
    }
});

//Utility Functions
function handleErrors(err) {
    const errors = { title: '', description: '', image: '', price: '', alert: '' };
    if (err.message.includes("Validation failed") || err.message.includes("validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    if (err.code === 11000)
        errors.alert = "Product already exists";

    return errors;
}

module.exports = router;