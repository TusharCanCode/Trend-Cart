const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
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
    ],
    address: {
        type: Object,
        required: [true, "Address cannot be empty"],
    },
    amount: {
        type: Number,
        required: [true, "Amount cannot be empty"],
    },
    status: {
        type: String,
        default: "Pending"
    }
},

    { timestamps: true }

);

let Order = new mongoose.model('Order', orderSchema);
module.exports = Order;