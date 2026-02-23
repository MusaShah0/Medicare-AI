const Sechdule_Model = require('../Models/sechdule.model')// Import the model

const Add_Sechdule = async (req, res) => {
    try {
        // 1. Get the Arrays from Frontend
        // We expect payload: { days: ['Monday', 'Tuesday'], slots: [{startTime: '09:00', endTime: '09:30'}, ...] }
        const { days, slots, clinic_fee, slotDuration } = req.body;
        const doctorId = req.doctorId; // Kept your existing ID logic

        const schedulesToSave = [];

        // 2. Double Loop: Iterate Days AND Slots
        // For every Day selected...
        for (const day of days) {
            // For every Slot generated...
            for (const slot of slots) {
                
                // Optional: Check if this specific slot already exists to prevent duplicates
                const exists = await Sechdule_Model.findOne({
                    doctor: doctorId,
                    day: day,
                    startTime: slot.startTime
                });

                if (!exists) {
                    schedulesToSave.push({
                        doctor: doctorId,
                        day: day,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        clinic_fee: clinic_fee,
                        slotDuration: slotDuration,
                        status: 'available'
                    });
                }
            }
        }

        // 3. Bulk Insert (Much faster than saving one by one)
        if (schedulesToSave.length > 0) {
            await Sechdule_Model.insertMany(schedulesToSave);
            
            res.status(201).json({
                success: true,
                message: `Successfully added ${schedulesToSave.length} slots.`,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "No new slots were created (they might already exist).",
            });
        }

    } catch (error) {
        console.error("Error adding schedule:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add schedule",
            error: error.message
        });
    }
};


const Show_Doctor_Sechdule = async (req, res) => {
  try {
    const doctorId = req.doctorId;

    const schedule = await Sechdule_Model.find({ doctor: doctorId });

    if (!schedule || schedule.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No schedule found"
      });
    }

    return res.status(200).json({
      status: 1,
      data: schedule
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};

const Show_Doctor_Sechdule_Day = async function (req, res) {
  try {
    const day = req.params.id;
    const doctorId = req.doctorId;
     console.log(day)
    console.log(doctorId) 
    const sechdule = await Sechdule_Model.find({
      day: day,
      doctor: doctorId
    });

    if (!sechdule || sechdule.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "Not Found"
      });
    }

    return res.status(200).json({
      status: 1,
      data: sechdule
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};


const Delete_Sechdule = async function (req, res) {
  try {
    const sechduleId = req.params.id;
    const doctorId = req.doctorId;
    console.log(doctorId)

    const sechdule = await Sechdule_Model.findOneAndDelete({
      _id: sechduleId,
      doctor: doctorId
    });

    if (!sechdule) {
      return res.status(404).json({
        status: 0,
        msg: "Sechdule not found or unauthorized"
      });
    }

    return res.status(200).json({
      status: 1,
      msg: "Sechdule deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};


const Show_Sechdule_Status = async function (req, res) {
  try {
    const status = req.params.status;
    const doctorId = req.doctorId;
    console.log(status)
    console.log(doctorId)

    const sechdule = await Sechdule_Model.find({
      status: status,
      doctor: doctorId
    });

    if (!sechdule || sechdule.length === 0) {
      return res.status(404).json({
        status: 0,
        msg: "No sechdule found for this status"
      });
    }

    return res.status(200).json({
      status: 1,
      data: sechdule
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};




module.exports = {Add_Sechdule, Show_Doctor_Sechdule, Show_Doctor_Sechdule_Day, Delete_Sechdule, Show_Sechdule_Status};