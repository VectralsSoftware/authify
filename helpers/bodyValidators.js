import { body } from "express-validator"
import { errorMessages, jwtErrors } from "./strings.js"

const credentials = [
    body('email', errorMessages.invalidEmail)
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password', errorMessages.passwordTooShort)
        .trim()
        .isLength({ min: '8' })
]

const token = [
    body('accessToken', jwtErrors["jwt unexisting"])
        .exists()
]

export const bodyValidators = {
    credentials,
    token
}

