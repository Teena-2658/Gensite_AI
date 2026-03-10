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
// app.use(express.json());
// purana code: app.use(express.json());
// naya code:
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📲 ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gensite-ai.vercel.app"
  ],
  credentials: true
}));
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/website", websiteRouter)
app.use("/api/payment", paymentRoutes);
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
