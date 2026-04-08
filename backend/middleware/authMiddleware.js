import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded.ngoId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: userId,
      userType: decoded.userType || decoded.type || "user",
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
