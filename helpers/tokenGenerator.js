import jwt from 'jsonwebtoken'

const generateToken = (userId) => {

    // const expiresIn = 60 * 15 // Token will expire in 15 minutes (PROD)
    const expiresIn = 60 // Token will expire in 60 seconds (DEV)

    try {

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn })
        return { token, expiresIn }

    } catch (error) {
        console.log(error);
    }
}

const generateRefreshToken = (userId, res) => {

    const expiresIn = 60 * 60 * 24 * 365 // Token will expire in 1 year
    //const expiresIn = 60 // Token will expire in 1 minute (DEV)

    try {

        const refreshToken = jwt.sign({ userId }, process.env.REFRESH_JWT_SECRET, { expiresIn })
        return res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: !(process.env.ENVIRONMENT === 'development'),
            expiresIn: new Date(Date.now() + expiresIn * 1000) // Multiplied by 1000 because expiresIn is expressed in miliseconds
        })

    } catch (error) {
        console.log(error);
    }
}

export {
    generateToken,
    generateRefreshToken
}