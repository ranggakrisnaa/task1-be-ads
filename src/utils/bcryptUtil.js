const bcrypt = require('bcrypt')
const saltRounds = 10

class BcryptUtil {
    static hashPassword(password) {
        return bcrypt.hashSync(password, saltRounds);
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword)
    }
}

module.exports = BcryptUtil