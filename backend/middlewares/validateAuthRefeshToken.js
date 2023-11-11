import jwt from 'jsonwebtoken'
import { jwtErrors } from '../helpers/index.js';

const validateAuthRefreshToken = (req, res, next) => {
    try {
        const refreshTokenFromCookie = req.cookies.refreshToken

        // If the refreshTokenFromCookie is not sent in the cookies:
        if (!refreshTokenFromCookie) {
            throw new Error('invalid token')
        }

        // We get the payload from the decoded refresh token
        const payload = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_JWT_SECRET)

        // Set the userId in the req
        req.userId = payload.userId

        next()

    } catch (error) {
        return res.status(401).json({ error: jwtErrors[error.message] })
    }
}

export {
    validateAuthRefreshToken
}