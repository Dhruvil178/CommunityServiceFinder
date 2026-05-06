import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("No auth header provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Invalid token format - no token after split");
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      console.log("Token decoded but no id found:", decoded);
      return res.status(401).json({ message: "Invalid token structure" });
    }

    req.user = {
      id: decoded.id || decoded.userId || decoded.ngoId, // Handle 'id', 'userId', and 'ngoId' field names
      type: decoded.userType || decoded.type,
    };

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Session expired or invalid token" });
  }
};