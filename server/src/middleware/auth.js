const Gateway = require("../models/gatewayModel");

// Middleware function to verify the access token
const verifyToken = async (req, res, next) => {
  // 1. Check if the Authorization header exists and has the correct format
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "missingToken", 
      message: "Authorization header with Bearer token is missing" 
    });
  }

  // Extract the token string
  const token = authHeader.split(" ")[1];

  try {
    // 2. Find the gateway associated with this token in the database
    const gateway = await Gateway.findOne({ accessToken: token });
    if (!gateway) {
      return res.status(401).json({ 
        error: "invalidToken", 
        message: "Access token is invalid or expired" 
      });
    }

    // 3. Attach the securely verified Gateway ID to the request object
    // This allows the Measurement ABL to know exactly which device sent the data
    req.gatewayId = gateway._id;
    
    // Proceed to the next function (the actual ABL logic)
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error during authentication" });
  }
};

module.exports = verifyToken;