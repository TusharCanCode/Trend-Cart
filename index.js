const express = require('express');
const app = express();
const Connection = require('./database');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 3000;

//Middleware:
app.use(express.json());
app.use(cookieParser());

//Routers:
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const stripeRoute = require('./routes/stripe');

//API Routes:
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/product', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoute);
app.use('/api/stripe', stripeRoute);

Connection();

app.listen(port, () => {
    console.log(`Server is running at port ${port} successfully!`)
});