const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const foodPartnerModel = require("../model/foodpartner.model")


const authFoodPartnerMiddleware = asyncHandler(async(req, res, next) =>{
    try {
        // Get token from header or cookies
        const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, "No token, authorization denied");
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get food partner from token
        const foodPartner = await foodPartnerModel.findById(decoded.id);
        if (!foodPartner) {
            throw new ApiError(401, "Food partner not found with this token");
        }

        // Attach food partner to request object
        req.foodPartner = foodPartner;
        next();
    } catch (err) {
        throw new ApiError(401, err.message || "Invalid token");
    }
})

const authUserMiddleware = asyncHandler(async (req, res, next) => {
    try {
        // Get token from header or cookies
        const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, "No token, authorization denied");
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            throw new ApiError(401, "User not found with this token");
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, err.message || "Invalid token");
    }
})
module.exports = { authUserMiddleware, authFoodPartnerMiddleware };