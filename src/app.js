//create server/express app
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const foodRoutes = require('./routes/food.routes');

const dotenv = require('dotenv');
dotenv.config();



const cors = require('cors');

const app = express();
app.use(cors({
    // origin: 'http://localhost:5173',
    origin: 'https://instazometo-frontend.vercel.app/',
    credentials: true
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/food',foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

module.exports = app;