const mongoose=require('mongoose')
const SechduleSchema=mongoose.Schema({
doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  clinic_fee:{
    type:Number,
    required:true
  },
  slotDuration: {
        type: Number},
  status: {
    type: String,
    enum: ['available', 'booked', 'completed', 'cancelled', 'ongoing'],
    default: 'available'
  },
  
}, { timestamps: true

})

const Sechdule_Model=mongoose.model('Sechdule',SechduleSchema)
module.exports=Sechdule_Model