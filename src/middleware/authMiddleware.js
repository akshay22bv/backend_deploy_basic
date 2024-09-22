const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("decoded: ", decoded);
    req.user = decoded; // Attach the decoded user data (e.g., user id) to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Invalid token:", error);
    return res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
