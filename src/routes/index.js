const express = require('express')
const AuthController = require('../controllers/authController')
const UserController = require('../controllers/userController')
const AuthMiddleware = require('../middlewares/authMiddleware')
const UploadMiddleware = require('../middlewares/uploadMiddleware')
const ValidatorMiddleware = require('../middlewares/validatorMiddleware')
const { registerSchema, userSchema, updateUserSchema } = require('../utils/joiUtil')
const router = express.Router()

// auth routes
router.post('/login', ValidatorMiddleware.validate(registerSchema), AuthController.loginUser)
router.post('/register', ValidatorMiddleware.validate(userSchema), AuthController.registerUser)
router.post('/otp/generate', AuthController.generateOtp)
router.post('/otp/verify', AuthController.verifyOtp)
router.post('/logout', AuthController.logoutUser)

// user routes
router.get('/users', AuthMiddleware.Authentication, UserController.getAllUser)
router.get('/users/info', AuthMiddleware.Authentication, UserController.getUserProfile)
router.get('/users/:id', AuthMiddleware.Authentication, UserController.getUserById)
router.put('/users', ValidatorMiddleware.validate(updateUserSchema), UploadMiddleware.initializeUpload().single("image"), AuthMiddleware.Authentication, UserController.updateUser)
router.delete('/users/:id', AuthMiddleware.Authentication, UserController.deleteUser)

module.exports = router