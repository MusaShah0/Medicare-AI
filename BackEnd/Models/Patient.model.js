const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const patientSchema = mongoose.Schema({
    first_Name: {
        type: String,
        required: [true, "First name is required"],
        trim: true
    },
    last_Name: {
        type: String,
        required: [true, "Last name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
        
    // NEW FIELDS
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [0, "Age cannot be negative"],
        max: [120, "Please enter a valid age"]
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: ["Male", "Female", "Other"] // Professional way to restrict inputs
    }
}, { timestamps: true });

patientSchema.pre('save',async function(){
     return this.password= await bcrypt.hash(this.password,10) 
     
})

patientSchema.methods.Generate_Token=async function ()
{
    return await jwt.sign({id:this._id},process.env.P_SecretKey,{expiresIn:process.env.ExpireIn})
}

patientSchema.methods.Check_Password=async function (pass)
{

    return await bcrypt.compare(pass,this.password)
}

const PatientModel= mongoose.model('Patient',patientSchema)
module.exports=PatientModel