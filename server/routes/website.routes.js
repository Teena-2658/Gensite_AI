import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { generateWebsite, deployWebsite, getUserWebsites, getWebsiteById, saveConversation, updateWebsiteCode } from "../controllers/website.controller.js";

const websiteRouter = express.Router();

// GENERATE WEBSITE
websiteRouter.post("/generate", isAuth, generateWebsite);

// GET ALL WEBSITES OF LOGGED IN USER (Dashboard ke liye)
websiteRouter.get("/", isAuth, getUserWebsites);

// SAVE CONVERSATION MESSAGE (must be before /:id routes)
websiteRouter.post("/:id/conversation", isAuth, saveConversation);

// UPDATE WEBSITE CODE (must be before /:id GET)
websiteRouter.put("/:id/code", isAuth, updateWebsiteCode);

// DEPLOY WEBSITE
websiteRouter.put("/:id/deploy", isAuth, deployWebsite);

// GET SINGLE WEBSITE (must be last)
websiteRouter.get("/:id", isAuth, getWebsiteById);

export default websiteRouter;