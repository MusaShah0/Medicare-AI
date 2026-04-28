const express=require('express')
const cookieParser=require('cookie-parser')
const D_Routes=require('./Routes/Doctor.route')
const app=express()
const mongoose=require('mongoose')
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
const path = require('path');
const Sechdule_Routes = require('./Routes/Sechdule.Route')
const PatientRoutes = require('./Routes/Patient.route')
const Apppoitment_Routes = require('./Routes/Appoitment.route')
const ChatRoutes = require('./Routes/Chat.route')
const ReviewRoutes = require('./Routes/Rewiew.route')
const NotesRoutes = require('./Routes/Notes.route')
const WebhookRoutes = require('./Routes/Webhook.route')
require('dotenv').config()

app.use('/pictures', express.static(path.join(__dirname, 'public/pictures')));

// ── Body parsers FIRST — webhook needs express.json() to read req.body ──
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Routes ──
app.use('', WebhookRoutes)      // webhook has no auth — must come before auth-gated routes
app.use('',D_Routes)
app.use('',Sechdule_Routes)
app.use('',PatientRoutes)
app.use('',Apppoitment_Routes)
app.use('', ChatRoutes)
app.use('', ReviewRoutes)
app.use('', NotesRoutes)

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



