const { User, UserToken } = require('../db/models/index')
const JwtUtil = require("../utils/jwtUtil");
const { ErrHandler } = require("./errHandlerMiddleware");

class AuthMiddleware {
    static async Authentication(req, res, next) {
        try {
            const tokenJwt = req.headers.authorization && !req.headers.authorization.includes('Bearer') ? req.headers.authorization : req.headers.authorization?.split(' ')[1];
            if (!tokenJwt) {
                throw new ErrHandler(404, 'Token jwt is not found.');
            }

            const decoded = JwtUtil.verifyToken(tokenJwt)

            const foundUser = await User.findOne({ where: { id: decoded.idUser } })
            if (!foundUser) {
                throw new ErrHandler(401, 'Unauthenticated user.')
            }

            const foundUserToken = await UserToken.findOne({ where: { userId: foundUser.id } })
            if (!foundUserToken) {
                throw new ErrHandler(401, 'Unauthenticated user.')
            }

            req.loggedUser = { id: foundUser.id }
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AuthMiddleware