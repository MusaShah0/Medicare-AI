const express = require('express')
const { getNotifications, markAllRead, markOneRead } = require('../Controlers/Notification.controller')
const Doctor_Check  = require('../MiddleWare/Doctor.middleware')
const Patient_Check = require('../MiddleWare/Patient.middleware')
const AnyUser_Check = require('../MiddleWare/AnyUser.middleware')

const router = express.Router()

router.get('/notifications',             AnyUser_Check, getNotifications)
router.patch('/notifications/read-all',  AnyUser_Check, markAllRead)
router.patch('/notifications/:id/read',  AnyUser_Check, markOneRead)

module.exports = router
