import { body } from "express-validator"
import { errorMessages } from "./strings.js"

const credentials = [
    body('email', errorMessages.invalidEmail)
        .trim()
        .isEmail()
        .normalizeEmail(),
    body('password', errorMessages.passwordTooShort)
        .trim()
        .isLength({ min: '8' })
]

export const bodyValidators = {
    credentials,
}

