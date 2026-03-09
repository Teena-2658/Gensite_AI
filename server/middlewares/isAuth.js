import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuth = async (req, res, next) => {
    try {
        // Check Authorization header first, then fallback to cookies
        let token = req.cookies.token;
        
        // If not in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.slice(7); // Remove "Bearer " prefix
            }
        }

        if (!token) {
            return res.status(401).json({ message: "token not found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ message: "invalid token" });
    }
}

export default isAuth;
