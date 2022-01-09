const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "userId cannot be empty"],
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
},

    { timestamps: true }

);

let Cart = new mongoose.model('Cart', cartSchema);
module.exports = Cart;