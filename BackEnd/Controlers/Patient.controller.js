const PatientModel = require('../Models/Patient.model')


const P_SignUp = async (req, res) => {
  try {
    // 1. Destructure the new fields
    const { first_Name, last_Name, email, password, age, gender } = req.body;

    // 2. Validation: Check if email already exists

  
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

    // 5. Generate Token (Optional: Many apps log the user in immediately after signup)
    const token = await patient.Generate_Token();

    return res.status(201).json({
      status: 1,
      msg: "Signup successful",
      token, // Returning token so the patient is logged in immediately
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
    console.log(req.body)
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
      httpOnly: true
    });

    return res.json({
        status: 1,
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
    // Clear the token cookie
    // IMPORTANT: The options (httpOnly, secure, sameSite) must match 
    // exactly how you set the cookie during login.
    res.clearCookie("token", {
      withCredentials: true,
      httpOnly: true,
      // secure: true, // Uncomment if using HTTPS
      // sameSite: "none", // Uncomment if using HTTPS/Cross-site
    });

    return res.status(200).json({ 
      status: 1, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 0, message: "Logout failed" });
  }
};
module.exports={P_SignUp,P_LoginIn, logout}

