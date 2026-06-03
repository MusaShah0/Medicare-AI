const express=require('express')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const { startNewChat, SendMessage } = require('../Controlers/Chat.contoller')
const ChatRoutes=express.Router()

ChatRoutes.post('/startNewChat', Patient_Check, startNewChat)

ChatRoutes.post('/SendMessage', Patient_Check, SendMessage)



module.exports= ChatRoutes
