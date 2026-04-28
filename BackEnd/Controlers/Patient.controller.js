const PatientModel = require('../Models/Patient.model')


const P_SignUp = async (req, res) => {
  try {
    const { first_Name, last_Name, email, password, age, gender } = req.body;

    // Input validation
    if (!first_Name || !last_Name || !email || !password) {
      return res.status(400).json({ status: 0, msg: "All fields are required." });
    }
    if (first_Name.length > 50 || last_Name.length > 50) {
      return res.status(400).json({ status: 0, msg: "Name must be 50 characters or fewer." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: 0, msg: "Invalid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 0, msg: "Password must be at least 8 characters." });
    }
    const ageNum = Number(age);
    if (age === undefined || age === null || age === '' || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return res.status(400).json({ status: 0, msg: "Please provide a valid age (0-120)." });
    }
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ status: 0, msg: "Gender must be Male, Female, or Other." });
    }

    const existingUser = await PatientModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 0,
        msg: "Email already exists"
      });
    }

    // 3. Create the patient instance with new fields
    const patient = new PatientModel({
      first_Name,
      last_Name,
      email,
      password,
      age,    // New field
      gender  // New field
    });

    // 4. Save to Database (Middleware handles password hashing)
    await patient.save();

    // 5. Auto-login: set httpOnly cookie so patient lands on dashboard
    const token = await patient.Generate_Token();
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.status(201).json({
      status: 1,
      login: true,
      role: 'patient',
      msg: "Signup successful",
      data: {
        id: patient._id,
        first_Name: patient.first_Name
      }
    });

  } catch (error) {
    console.error("Patient Signup Error:", error.message);
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};

const P_LoginIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await PatientModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 0,
        msg: "Invalid email or password"
      });
    }

    const isMatch = await user.Check_Password(password);
    
    if (!isMatch) {
      return res.status(401).json({
        status: 0,
        msg: "Invalid email or password"
      });
    }

    const token = await  user.Generate_Token();
  

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.json({
        status: 1,
        login: true,
        role: 'patient',
        msg: "Login Successful",
        data: {
            _id: user._id,
            first_Name: user.first_Name,
            last_Name: user.last_Name,
            email: user.email,
            age: user.age
        }
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      msg: "Server error",
      error: error.message
    });
  }
};
const logout = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res.status(200).json({ status: 1, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 0, message: "Logout failed" });
  }
};

const verifyPatient = (req, res) => {
  return res.status(200).json({ status: 1, authenticated: true, id: req.PatientId });
};

module.exports={P_SignUp,P_LoginIn, logout, verifyPatient}

