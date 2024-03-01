class ErrHandler extends Error {
    statusCode = 0
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
    }
}

const handleError = (err, req, res, next) => {
    console.log(err)
    let messages
    if (err instanceof ErrHandler) {
        res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message
        })
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        err.errors.map(e => messages = e.message)
        res.status(409).json({
            success: false,
            statusCode: 409,
            message: messages
        })
    } else if (err.name === 'SequelizeValidationError') {
        err.errors.map(e => messages = e.message)
        res.status(409).json({
            success: false,
            statusCode: 409,
            message: messages
        })
    } else {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: err.message
        });
    }
}



module.exports = { ErrHandler, handleError }