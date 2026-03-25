require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
