require('dotenv').config
const express = require('express')
const authRoute = require('../src/routes/index')
const { handleError } = require('./middlewares/errHandlerMiddleware')
const swaggerFile = require('../swagger_docs.json')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const app = express()
const port = process.env.PORT || 2000

app.use(express.json())
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        statusCOde: 200,
        message: "Hello, successful access to this API."
    })
})
app.use('api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use('/api/v1/', authRoute)
app.use(handleError)

app.listen(port, () => {
    console.log(`app server listening on http://localhost:${port}`)
})