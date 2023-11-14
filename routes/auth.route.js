import { Router } from "express";
import { authWithProvider, getProtectedInfoExample, login, loginWithAccessToken, logout, refreshToken, register } from "../controllers/auth.controller.js";
import { validationResultMiddleware, validateAuthToken, validateAuthRefreshToken } from "../middlewares/index.js";
import { bodyValidators } from "../helpers/index.js";
import passport from "passport";

const router = Router()
const CLIENT_URL_FAILURE = "http://localhost:3000/fail";

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

// @route   POST /auth/token/login
// @access  PUBLIC
// @desc  Logs in a user and also sets the refresh token in a HTTP-Only Cookie
router.post('/token/login',
bodyValidators.token,
validationResultMiddleware,
loginWithAccessToken)

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

/* ======================================================================================
    SOCIAL OAUTH PROVIDERS AUTHENTICATION 
   ====================================================================================== */

// @route   GET /auth/google
// @access  PUBLIC
// @desc Google Auth flow starts here - Redirect the user to the Google authentication page
router.get('/google', passport.authenticate("google", { scope: ["email", "profile", "openid"] }));

// @route   GET /auth/google/callback
// @access  PUBLIC
// @desc  Authenticates user with Google oAuth Provider after the user has granted permission
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: CLIENT_URL_FAILURE,
    }),
    authWithProvider
);

// @route   GET /auth/facebook
// @access  PUBLIC
// @desc Facebook Auth flow starts here - Redirect the user to the Facebook authentication page
router.get('/facebook', passport.authenticate("facebook", {scope: ["email", 'profile', 'public_profile']}));

// @route   GET /auth/facebook/callback
// @access  PUBLIC
// @desc  Authenticates user with Facebook oAuth Provider after the user has granted permission
router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
        failureRedirect: CLIENT_URL_FAILURE,
    }),
    authWithProvider
);


// @route   GET /auth/logout
// @access  PRIVATE (needs the refresh token from the cookies)
// @desc  Clears the refreshToken from cookies
router.post('/logout',
    logout
)

export default router