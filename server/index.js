import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import websiteRouter from './routes/website.routes.js';
import paymentRoutes from "./routes/payment.routes.js"; 
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin: "http://localhost:5173",
        credentials: true,
}));
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/website", websiteRouter)
app.use("/api/payment", paymentRoutes);
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
