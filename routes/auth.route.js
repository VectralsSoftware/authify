import { Router } from "express";
import { getProtectedInfoExample, login, logout, refreshToken, register } from "../controllers/auth.controller.js";
import { validationResultMiddleware, validateAuthToken, validateAuthRefreshToken } from "../middlewares/index.js";
import { bodyValidators } from "../helpers/index.js";

const router = Router()

// @route   POST /auth/register
// @access  PUBLIC
router.post('/register',
    bodyValidators.credentials,
    validationResultMiddleware,
    register)

// @route   POST /auth/login
// @access  PUBLIC
// @desc  Logs in a user and also sets the refresh token in a HTTP-Only Cookie
router.post('/login',
    bodyValidators.credentials,
    validationResultMiddleware,
    login)

// @route   GET /auth/protectedRoute
// @access  PRIVATE
router.get('/protectedRoute',
    [validateAuthToken],
    getProtectedInfoExample)

// @route   GET /auth/refreshToken
// @access  PRIVATE (needs the refresh token from the cookies)
// @desc  Returns a new token
router.get('/refreshToken',
    [validateAuthRefreshToken],
    refreshToken)

// @route   GET /auth/logout
// @access  PRIVATE (needs the refresh token from the cookies)
// @desc  Clears the refreshToken from cookies
router.post('/logout',
    logout
)

export default router