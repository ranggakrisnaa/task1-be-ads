const { Op } = require('sequelize')
const { User, UserToken } = require('../db/models/index')
const { ErrHandler } = require('../middlewares/errHandlerMiddleware')
const JwtUtil = require('../utils/jwtUtil')
const BcryptUtil = require('../utils/bcryptUtil')
const OtpauthUtil = require('../utils/otpUtil')

class AuthController {
    static async registerUser(req, res, next) {
        try {
            let payload
            if (req.body.password) {
                const hashedPassword = BcryptUtil.hashPassword(req.body.password)
                payload = { ...req.body, password: hashedPassword }
            }
            await User.create(payload)
            res.status(201).json({
                success: true,
                statusCode: 201,
                message: "User created successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    static async loginUser(req, res, next) {
        try {
            const { usernameOrEmail, password } = req.body;

            const foundUser = await User.findOne({
                where: {
                    [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
                }
            })
            console.log(foundUser);
            if (!foundUser) {
                throw new ErrHandler(401, 'Incorrect email/username or password.');
            }

            const isMatchPassword = await BcryptUtil.comparePassword(password, foundUser.password)
            console.log('Password Match:', isMatchPassword);
            if (!isMatchPassword) {
                throw new ErrHandler(401, 'Incorrect email/username or password.')
            }

            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User login Successfully",
                idUser: foundUser.id,
            })
        } catch (error) {
            next(error)
        }
    }

    static async generateOtp(req, res, next) {
        try {
            const { userId } = req.body
            const foundUser = await User.findOne({ where: { id: userId } })
            if (!foundUser) {
                throw new ErrHandler(404, 'User is not found.')
            }
            const tokenOtp = OtpauthUtil.generateTOTP()

            foundUser.otpSecret = tokenOtp
            await foundUser.save()
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Token generated successfully",
                tokenOtp
            })
        } catch (error) {
            next(error)
        }
    }

    static async verifyOtp(req, res, next) {
        try {
            const { userId, otp } = req.body
            const foundUser = await User.findOne({ where: { id: userId } })
            if (!foundUser) {
                throw new ErrHandler(404, 'User is not found.')
            }

            let delta = OtpauthUtil.validateTOTP(otp)
            console.log(delta);
            // token is expired in 3 minutes
            if (delta !== 0 && otp != foundUser.otpSecret) {
                throw new ErrHandler(401, 'Token otp is invalid.')
            }

            const tokenJwt = JwtUtil.signToken(foundUser.id)
            const payload = {
                userId: foundUser.id,
                token: tokenJwt
            }
            await UserToken.create(payload)
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User verified successfully",
                tokenJwt
            })
        } catch (error) {
            next(error)
        }
    }

    static async logoutUser(req, res, next) {
        try {
            const { userId } = req.body;
            const foundToken = await UserToken.findOne({ where: { userId } })
            if (!foundToken) {
                throw new ErrHandler(404, 'User is not found.')
            }

            await foundToken.destroy()
            JwtUtil.signToken(userId)
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User logout successfully",
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AuthController