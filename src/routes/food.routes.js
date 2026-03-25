const express = require('express');
const foodController = require("../controllers/food.controller")
const { authFoodPartnerMiddleware, authUserMiddleware } = require("../middelware/auth.middelware")
const multer = require('multer');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
})


/* POST /api/food/ [protected]*/
router.post('/create', authFoodPartnerMiddleware,
    upload.single("video"),
    foodController.createFood
)

/*Get =/api/food/all*/
router.get('/all', authUserMiddleware, foodController.getAllFood)
// router.get('/all', foodController.getAllFood)

/*POST /api/food/like [protected]*/
router.post('/like',authUserMiddleware, foodController.likeFood)

/*POST /api/food/save [protected]*/
router.post('/save',authUserMiddleware, foodController.saveFood)

/*GET /api/food/save [protected]*/
router.get('/save', authUserMiddleware, (req, res) => foodController.getSaveFood(req, res))

module.exports = router;
