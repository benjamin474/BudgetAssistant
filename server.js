const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const TransactionRouter = require('./routes/TransactionRoute');
const UserRouter = require('./routes/UserRoute');
const CategoryRouter = require('./routes/CategoryRoute');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once('open', function () {
    console.log('Connected to database...');
});
app.use('/transactions', TransactionRouter);
app.use('/users', UserRouter);
app.use('/category', CategoryRouter);
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
