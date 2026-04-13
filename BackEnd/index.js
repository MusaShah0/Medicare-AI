const express=require('express')
const cookieParser=require('cookie-parser')
const D_Routes=require('./Routes/Doctor.route')
const app=express()
const mongoose=require('mongoose')
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // <--- THIS IS MANDATORY for res.cookie to work
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
const path = require('path');
const Sechdule_Routes = require('./Routes/Sechdule.Route')
const PatientRoutes = require('./Routes/Patient.route')
const Apppoitment_Routes = require('./Routes/Appoitment.route')
const ChatRoutes = require('./Routes/Chat.route')
const ReviewRoutes = require('./Routes/Rewiew.route')
require('dotenv').config()
// server.js
app.use('/pictures', express.static(path.join(__dirname, 'public/pictures')));

app.use(cookieParser())
app.use(express.json())
app.use('',D_Routes)
app.use('',Sechdule_Routes)
app.use('',PatientRoutes)
app.use('',Apppoitment_Routes)
app.use('', ChatRoutes)
app.use('', ReviewRoutes)
mongoose.connect(process.env.DB_URL).then(()=>
{
    console.log("DB Connected")
    app.listen(process.env.PORT,()=>
{
    console.log("Server Runing")
})
}).catch((err)=>
{
    console.log("Connected Failed",err)
})



