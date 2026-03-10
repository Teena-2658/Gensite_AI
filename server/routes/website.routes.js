import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  generateWebsite,
  deployWebsite,
  getUserWebsites,
  getWebsiteById,
  saveConversation,
  updateWebsiteCode
} from "../controllers/website.controller.js";

const websiteRouter = express.Router();


// GENERATE WEBSITE (normal API)
websiteRouter.post("/generate", isAuth, generateWebsite);


// GENERATE WEBSITE WITH PROGRESS STREAM
websiteRouter.get("/generate-stream", isAuth, generateWebsite);


// GET ALL WEBSITES OF LOGGED IN USER
websiteRouter.get("/", isAuth, getUserWebsites);


// SAVE CONVERSATION MESSAGE
websiteRouter.post("/:id/conversation", isAuth, saveConversation);


// DEPLOY WEBSITE
websiteRouter.put("/deploy/:id", isAuth, deployWebsite);


// UPDATE WEBSITE CODE
websiteRouter.put("/:id/code", isAuth, updateWebsiteCode);


// GET SINGLE WEBSITE
websiteRouter.get("/:id", isAuth, getWebsiteById);


export default websiteRouter;