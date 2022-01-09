const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title cannot be empty"],
        unique: true,
        minlength: [3, "Title length must be between 3 to 50 characters"],
        maxlength: [50, "Title length must be between 3 to 50 characters"]
    },
    description: {
        type: String,
        required: [true, "Description cannot be empty"],
        minlength: [5, "Description must be of atmost 5 characters"]
    },
    image: {
        type: String,
        required: [true, "Provide an image to the product"]
    },
    categories: Array,
    size: String,
    color: String,
    price: {
        type: Number,
        required: [true, "Provide price to the product"]
    },
},

    { timestamps: true }

);

let Product = new mongoose.model('Product', productSchema);
module.exports = Product;