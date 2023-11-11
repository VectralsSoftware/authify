import { errorMessages, jwtErrors } from "../helpers/index.js"
import { generateRefreshToken, generateToken } from "../helpers/tokenGenerator.js"
import { UserService } from "../services/userService.js"
import { ProfileService } from "../services/profileService.js"

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
        const { token, expiresIn } = generateToken(user._id)

        // Generate REFRESH JWT
        generateRefreshToken(user._id, res)

        // Send token as response
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

const authWithProvider = async (req, res) => {

    // Get the simplified json data from the oAuth response
    const { _json, provider } = req.user?.profile

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
        given_name: _json.given_name,
        family_name: _json.family_name,
        picture: _json.picture
    })

     // Generate JWT
     const { token } = generateToken(user._id)

     // Send token as response in the frontend url. (Handling login logic from frontend is necessary)
     return res.redirect(`${process.env.CLIENT_URL}/google?accessToken=${token}`)
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
    logout
}