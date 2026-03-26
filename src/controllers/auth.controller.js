const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const userModel = require("../model/user.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const foodPartnerModel = require("../model/foodPartner.model");
const foodPartnerModel = require("../model/foodpartner.model");

const getAuthCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

//User Register
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ fullName, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, }, process.env.JWT_SECRET)
    res.cookie("token", token, getAuthCookieOptions())


    res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

//User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Not user found with this email");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Password");
    }

    const token = jwt.sign({ id: user._id, }, process.env.JWT_SECRET)
    res.cookie("token", token, getAuthCookieOptions())

    res.status(200).json(new ApiResponse(200, user, "User logged in successfully"));
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json(new ApiResponse(200, req.user, "User loaded successfully"));
});

// Food Partner Register
const registerFoodPartner = asyncHandler(async (req, res) => {

    const { name, email, password, phone, address, contactName } = req.body;

    if (!name || !email || !password || !phone || !address || !contactName) {
        throw new ApiError(400, "All fields are required")
    }
    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email })

    if (isAccountAlreadyExists) {
        throw new ApiError(400, "Food partner with this email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const foodPartner = await foodPartnerModel.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        contactName
    })

    const token = jwt.sign({
        id: foodPartner._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token, getAuthCookieOptions())

    res.status(201).json(
        new ApiResponse(201, foodPartner, "Food partner registered successfully")
    )

});

const loginFoodPartner = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const foodPartner = await foodPartnerModel.findOne({ email })

    if (!foodPartner) {
        throw new ApiError(404, "user not found with this email")
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Password")
    }

    const token = jwt.sign({
        id: foodPartner._id,
    }, process.env.JWT_SECRET)

    res.cookie("token", token, getAuthCookieOptions())

    res.status(200).json(
        new ApiResponse(200, foodPartner, "Food partner logged in successfully")
    )
})

const logoutFoodPartner = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json(
        new ApiResponse(200, req.foodPartner, "Food partner logged out successfully")
    );
})

module.exports = { registerUser, loginUser, logoutUser, registerFoodPartner, loginFoodPartner, logoutFoodPartner };