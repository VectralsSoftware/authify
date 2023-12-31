import { errorMessages, jwtErrors } from "../helpers/index.js"
import { generateRefreshToken, generateToken } from "../helpers/tokenGenerator.js"
import { UserService } from "../services/userService.js"
import { ProfileService } from "../services/profileService.js"
import jwt from "jsonwebtoken"

const register = async (req, res) => {

    try {

        // Get input data
        const { email, password } = req.body

        // Create the user
        const user = await UserService.createUser({
            email,
            password,
            username: await UserService.generateUsername(),
            providers: ['credentials']
        })

        // Generate JWT
        const { token, expiresIn } = generateToken(user._id)

        // Generate REFRESH JWT
        generateRefreshToken(user._id, res)

        // Send token as response
        return res.json({ token, expiresIn })

    } catch (error) {

        console.log(error);

        if (error.code === 11000) {
            return res.status(500).json({ error: errorMessages.userAlreadyExists(req.body.email) })
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
        const response = generateToken(user._id)

        // Generate REFRESH JWT
        generateRefreshToken(user._id, res)

        // Send token as response
        return res.json(response)

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

const authWithProvider = async (req, res) => {

    console.log(req.user);
    console.log(req.user.profile);
    // Get the simplified json data from the oAuth response
    const { _json, provider } = req.user?.profile || req.user

    // Check if user with email already exists
    const userExists = await UserService.findByEmail(_json.email)

    // Instantiate the user object
    let user;

    // If it does not exist create a new user
    if (!userExists) {
        user = await UserService.createUser({
            username: await UserService.generateUsername(),
            email: _json.email,
            password: null,
            providers: [provider]
        })
    } else {
        // If it exists, add provider to db
        user = await UserService.updateUser({ userId: userExists._id, newProvider: provider })
    }

    // Complete the profile or create a new one with the info comming from oAuth Provider
    const profile = await ProfileService.createOrUpdateProfile({
        user: user._id,
        fullName: _json.name,
        given_name: _json.given_name,
        family_name: _json.family_name,
        picture: _json.picture.data?.url || _json.picture
    })

    // Generate JWT
    const { token } = generateToken(user._id)

    // Send token as response in the frontend url. (Handling login logic from frontend is necessary)
    return res.redirect(`${process.env.CLIENT_URL}/oauth/${provider}?accessToken=${token}`)
}

// This function is mainly used for authenticating a user after social login with oAuth providers
const loginWithAccessToken = async (req, res) => {
    try {

        // Get the token sent in the body of the request
        const { accessToken } = req.body

        // If the token is not specified in the authorization header:
        if (!accessToken) {
            throw new Error('invalid token')
        }

        // Check the token is valid
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET)

        // Generate JWT
        const { token, expiresIn } = generateToken(payload.userId)

        // Generate REFRESH JWT
        generateRefreshToken(payload.userId, res)

        // Send token as response
        return res.json({ token, expiresIn })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: jwtErrors[error.message] })
    }
}

const getLoggedUser = async (req, res) => {
    try {

        const user = await UserService.findById(req.userId)
        const profile = await ProfileService.getProfileByUserId(req.userId)
        return res.json({user, profile})

    } catch (error) {
        console.log(error);
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
    authWithProvider,
    loginWithAccessToken,
    getLoggedUser,
    logout
}