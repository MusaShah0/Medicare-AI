const express = require('express')
const { handleVideoSDKWebhook } = require('../Controlers/Webhook.controller')

const Webhook_Routes = express.Router()

// No auth middleware — VideoSDK calls this from their servers, not from a user browser
// This route must be reachable without auth cookies
Webhook_Routes.post('/webhook/videosdk', handleVideoSDKWebhook)

module.exports = Webhook_Routes
