import { errorMessages, jwtErrors } from "../helpers/index.js"
import { generateRefreshToken, generateToken } from "../helpers/tokenGenerator.js"
import { User } from "../models/User.js"
import { UserService } from "../services/UserService.js"
import jwt from 'jsonwebtoken'

const register = async (req, res) => {

    try {

        // Get input data
        const { email, password } = req.body

        // Create user instance
        const user = new User({ email, password })

        // Check if user is already registered and exit the process
        const userExists = await UserService.findByEmail(email)
        if (userExists) {
            throw { code: 11000 }
        }

        // Save the user
        await user.save()

        // Return JWT
        return res.status(201).json({ ok: true })

    } catch (error) {

        console.log(error);

        if (error.code === 11000) {
            return res.status(500).json({ error: errorMessages.userAlreadyExists(email) })
        }

        return res.status(500).json({ error: 'Internal Server Error' })
    }
}

const login = async (req, res) => {

    try {
        // Get input data
        const { email, password } = req.body

        // Check if user exists in the db
        const user = await UserService.findByEmail(email)
        if (!user) {
            return res.status(403).json({ error: errorMessages.invalidCredentials })
        }

        // Check if password is correct
        const passwordsMatch = await user.comparePassword(password)
        if (!passwordsMatch) {
            return res.status(403).json({ error: errorMessages.invalidCredentials })
        }

        // Generate JWT
        const { token, expiresIn } = generateToken(user._id)

        // Generate REFRESH JWT
        generateRefreshToken(user._id, res)


        return res.json({ token, expiresIn })

    } catch (error) {
        console.log(error);
    }
}

const getProtectedInfoExample = async (req, res) => {

    try {
        const user = await UserService.findById(req.userId)
        return res.json({ user })
    } catch (error) {
        return res.status(500).json({ error: errorMessages.internalServerError })
    }
}


const refreshToken = async (req, res) => {

    try {

        /*  Generate a new token:
                                  _The userId property comes in req thanks to the validateAuthRefreshToken middleware */
        
        const { token, expiresIn } = generateToken(req.userId)

        return res.json({ token, expiresIn })

    } catch (error) {
        return res.status(500).json({ error: errorMessages.internalServerError })
    }
}

const logout = (req, res) => {
    res.clearCookie('refreshToken')
    return res.json({ ok: 'User logged out. Cookies cleared' })
}

export {
    register,
    login,
    getProtectedInfoExample,
    refreshToken,
    logout
}