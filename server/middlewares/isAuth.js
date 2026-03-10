import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {

  try {

    console.log("🔐 Auth check for:", req.method, req.path);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No auth header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("✅ Auth passed for user:", user._id);

    req.user = user;

    next();

  } catch (error) {

    console.error("❌ Auth error:", error.message);

    res.status(401).json({ message: "Invalid token" });

  }

};

export default authMiddleware;