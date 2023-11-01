import "dotenv/config"
import express from 'express'
import { networkInterfaces } from 'os'

// Connect DB
import './database/connect.js'

// Initializing express
const app = express()

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