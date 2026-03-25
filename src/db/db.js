const mongoose = require('mongoose');
const { DB_NAME } = require('../constant/constants');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        // Do not terminate the server if DB is unavailable; allow app to run for non-DB routes
        // You may implement retry logic here if desired
    }
};

module.exports = { connectDB };