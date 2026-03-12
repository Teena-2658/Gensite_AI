import express from "express";
import { createCheckoutSession, verifyPayment } from "../controllers/payment.controller.js";
import authMiddleware from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/create-checkout", authMiddleware, createCheckoutSession);

router.post("/verify", verifyPayment);

export default router;