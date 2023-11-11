// This middleware is used to protect routes. It checks if the token sent in a request is valid or not
import jwt from 'jsonwebtoken'
import { jwtErrors } from '../helpers/index.js'

const validateAuthToken = (req, res, next) => {
    try {

        // Get the token from the request headers (Authorization: Bearer token)
        const bearerToken = req.headers?.authorization

        // If the token is not specified in the authorization header:
        if (!bearerToken) {
            throw new Error('invalid token')
        }

        // If the token is not valid
        const token = bearerToken.split(' ')[1] // Separate the token from the "Bearer" word
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        // Set the userId in the req
        req.userId = payload.userId

        next()
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: jwtErrors[error.message] })
    }
}

export {
    validateAuthToken
}