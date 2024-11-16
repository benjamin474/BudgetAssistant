const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const TransactionRouter = require('./routes/TransactionRoute');
const UserRouter = require('./routes/UserRoute');
const exportMongoToExcel = require('./exportMongoToExcel');
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
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

// 獲得excel
app.get('/export-excel/:user', async (req, res) => {
    const { user } = req.params;
    console.log(`server : ${user}`);
    
    try {
        const filePath = await exportMongoToExcel(user); // 產生 Excel 檔案的路徑

        // 傳送檔案給前端
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err.message);
                res.status(500).send('Failed to send the file.');
            } else {
                console.log('File sent successfully.');
            }
        });
    } catch (error) {
        console.error('Error exporting Excel:', error.message);
        res.status(500).send(error.message);
    }

});