const express=require('express')
const Doctor_Check = require('../MiddleWare/Doctor.middleware')
const { Add_Sechdule, Show_Doctor_Sechdule, Show_Doctor_Sechdule_Day, Delete_Sechdule, Show_Sechdule_Status } = require('../Controlers/Sechdule.contoller')
const Sechdule_Routes=express.Router()

Sechdule_Routes.post('/Add_Sechdule',Doctor_Check,Add_Sechdule)

Sechdule_Routes.get('/Show_Doctor_Sechdule',Doctor_Check,Show_Doctor_Sechdule)

Sechdule_Routes.get('/Show_Doctor_Sechdule/:id',Doctor_Check,Show_Doctor_Sechdule_Day)
Sechdule_Routes.delete('/Delete_Sechdule/:id',Doctor_Check, Delete_Sechdule)
Sechdule_Routes.get('/Show_Sechdule_Status/:status', Doctor_Check,Show_Sechdule_Status)



module.exports=Sechdule_Routes