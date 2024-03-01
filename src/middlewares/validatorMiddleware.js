const { ErrHandler } = require('./errHandlerMiddleware')

class Validator {
    static validate(schema) {
        return function (req, res, next) {
            try {
                const { error, value } = schema.validate(req.body)
                if (error) {
                    throw new ErrHandler(400, error.message.replace(/"/g, ''))
                }
                req.value = value
                next()
            } catch (error) {
                next(error)
            }
        }
    }
}

module.exports = Validator