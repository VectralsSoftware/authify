import "dotenv/config"
import express from 'express'
import cookieParser from "cookie-parser"
import cors from "cors"
import { networkInterfaces } from 'os'
import { errorMessages } from "./helpers/index.js"

// Connect DB
import './database/connect.js'

// Routes
import { authRouter } from "./routes/index.js"

// Initializing express
const app = express()

// Passport login sessions require session support
/* app.use(
  cookieSession({ name: "session", keys: ["authify"], maxAge: 24 * 60 * 60 * 100 })
); */

// Use Passport.js for authentication with oAuth providers
import passport from "passport"
import "./services/passportService.js"
app.use(passport.initialize());
//app.use(passport.session());


console.log(process.env.GOOGLE_AUTH_CALLBACK_URL);

// CORS configuration
const whitelistDomains = JSON.parse(process.env.ALLOWED_ORIGINS);
app.use(cors({
  origin: (origin, callback) => {
    if (whitelistDomains.includes(origin)) {
      return callback(null, origin)
    }

    // Only for dev purposes
    if (process.env.ENVIRONMENT === 'development') {
      if (!origin || whitelistDomains.includes(origin)) {
        return callback(null, origin)
      }
    }

    // Returns an error if any resource is trying to be accessed from unauthorized domains
    return callback(errorMessages.corsError(origin))
  },
  credentials: true
}))

// Accepting json requests
app.use(express.json())

// Accepting cookies
app.use(cookieParser())

// Routes
app.use('/auth', authRouter)

//====== Initialize the server with localhost and ip address check ======//
const nets = networkInterfaces();
const ipAdresses = {}

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      if (!ipAdresses[name]) {
        ipAdresses[name] = [];
      }
      ipAdresses[name].push(net.address);
    }
  }
}

const PORT = process.env.PORT || 4000
if (process.env.ENVIRONMENT === 'development') {
  for (const ip of Object.keys(ipAdresses)) {
    console.log(`
You can access the API at:
    🔗http://localhost:${PORT} (on this device)
    🔗http://${ipAdresses[ip][0]}:${PORT} (on devices connected to your local network)`);
  }
}


app.listen(PORT, () => console.log(`
Server listening on port ${PORT} 🔥
Environment: ${process.env.ENVIRONMENT} 🪐`))