const jwt=require('jsonwebtoken')

const Doctor_Check = async (req, res, next) => {
    console.log(`Token: ${req.cookies.token}`);
    
    if (!req.cookies.token) {
        return res.status(401).send("Login Required");
    }
    
    try {
        
        const decoded = jwt.verify(req.cookies.token, process.env.SecretKey);
        
       
        req.doctorId = decoded.id; 
        req.doctor = decoded;
        
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).send("Unauthorized");
    }
};
module.exports=Doctor_Check