const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const foodModel = require("../model/food.model");
const ApiError = require("../utils/ApiError");
const storage = require("../utils/storage.utils");
const { v4: uuidv4 } = require("uuid");
const likeModel = require("../model/like.model")
const saveModel = require("../model/save.model")

// Create Food Item
const createFood = asyncHandler(async (req, res) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded. Send 'video' file via multipart/form-data.");
    }

    const fileUploadResult = await storage.upload(req.file.buffer, uuidv4())

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })


    res.status(201).json(new ApiResponse(201, foodItem, "Food item created successfully"));
});

const getAllFood = asyncHandler(async (req, res) => {
    const foods = await foodModel.find();
    console.log(foods);
    if (!foods) {
        throw new ApiError(404, "No food item found")
    }

    // Fix any negative counts in the database
    for (const food of foods) {
        if (food.likeCount < 0 || food.saveCount < 0) {
            await foodModel.findByIdAndUpdate(food._id, {
                $set: {
                    likeCount: Math.max(0, food.likeCount || 0),
                    saveCount: Math.max(0, food.saveCount || 0)
                }
            });
        }
    }

    // Fetch the corrected data
    const correctedFoods = await foodModel.find();
    res.status(200).json(new ApiResponse(200, correctedFoods,"Food item fetched sucsessfully"))
})

const likeFood = asyncHandler(async (req, res) => {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })
        
        // Decrement likeCount but ensure it never goes below 0
        const food = await foodModel.findById(foodId);
        if (food && food.likeCount > 0) {
            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { likeCount: -1 }
            });
        }

        return res.status(200).json({
            message: "Food unliked successfully",
            liked: false
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like,
        liked: true
    })

})

const saveFood = asyncHandler(async (req, res) => {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })
    
    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })
        
        // Decrement saveCount but ensure it never goes below 0
        const food = await foodModel.findById(foodId);
        if (food && food.saveCount > 0) {
            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { saveCount: -1 }
            });
        }

        return res.status(200).json({
            message: "Food unsaved successfully",
            saved: false
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })
    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { saveCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save,
        saved: true
    })

})
const getSaveFood = asyncHandler(async (req, res) => {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

})

module.exports = { createFood, getAllFood, likeFood, saveFood, getSaveFood }