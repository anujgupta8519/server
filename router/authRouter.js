

const router = require('express').Router();
const authController = require('../controllers/authController');


router.post("/signup",authController.signupController);
router.post("/login",authController.loginController);
router.get("/refresh",authController.refreshToken)
router.post("/logout",authController.logOutController)

module.exports = router;