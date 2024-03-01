const jwt = require('jsonwebtoken')
const privateKey = process.env.JWTKEY || 'secret';


class JwtUtil {
    static signToken(idUser) {
        return jwt.sign({ idUser }, privateKey);
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, privateKey);
        } catch (err) {
            throw err
        }
    }
}

module.exports = JwtUtil