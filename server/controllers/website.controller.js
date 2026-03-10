import mongoose from "mongoose";
import Website from "../models/website.model.js";
import User from "../models/user.model.js";
import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";
import fetch from "node-fetch";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT AND A SENIOR UI/UX ENGINEER.
YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES USING ONLY HTML, CSS, AND JS.
--------------------------------------------------
USER REQUIREMENT: {USER_PROMPT}
--------------------------------------------------
GLOBAL QUALITY BAR: Premium modern UI, Business ready, Smooth transitions.
TECHNICAL RULES: ONE HTML, ONE style tag, ONE script tag, NO external libraries.
OUTPUT FORMAT: { "message": "short confirmation", "code": "<FULL HTML DOCUMENT>" }
RETURN RAW JSON ONLY.
`;

/*
-----------------------------------------
HELPER: VERCEL DEPLOYMENT
-----------------------------------------
*/
const triggerVercelDeploy = async (website, code) => {
  const projectName =
    website.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 30) +
    "-" +
    website._id.toString().slice(-6);

  try {
    const response = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          files: [{ file: "index.html", data: code }],
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Vercel Fetch Error:", err.message);
    return { error: err.message };
  }
};

/*
-----------------------------------------
GENERATE & AUTO-UPDATE WEBSITE
-----------------------------------------
*/
export const generateWebsite = async (req, res) => {
  const sendProgress = (percent, text) => {
    res.write(`data: ${JSON.stringify({ percent, text })}\n\n`);
  };

  try {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const { prompt, websiteId, imageBase64 } = req.method === "GET" ? req.query : req.body;

    sendProgress(5, "Checking prompt...");
    if (!prompt && !imageBase64) {
      sendProgress(0, "Input missing");
      return res.end();
    }

    sendProgress(10, "Checking authentication...");
    if (!req.user) {
      sendProgress(0, "User not authenticated");
      return res.end();
    }

    const user = await User.findById(req.user._id);
    const cost = websiteId ? 25 : 50;

    sendProgress(15, "Checking credits...");
    if (!user || user.credits < cost) {
      sendProgress(0, "Insufficient credits");
      return res.end();
    }

    const sanitizedPrompt = prompt ? prompt.replace(/[<>]/g, "") : "Update based on image";
    const finalPrompt = masterPrompt.replace("{USER_PROMPT}", sanitizedPrompt);

    const aiInput = [
      {
        role: "user",
        content: [
          { type: "text", text: finalPrompt + "\n\nIMPORTANT: RETURN ONLY RAW JSON." },
          ...(imageBase64 ? [{ type: "image_url", image_url: { url: imageBase64 } }] : []),
        ],
      },
    ];

    let raw = "";
    let parsed = null;
    sendProgress(25, "AI is processing...");

    for (let i = 0; i < 3 && !parsed; i++) {
      try {
        raw = await generateResponse(aiInput);
        sendProgress(55, "Generating code...");
        parsed = await extractJson(raw);
      } catch (aiError) {
        console.error("⚠️ AI attempt failed:", aiError.message);
      }
    }

    if (!parsed || !parsed.code) {
      sendProgress(0, "AI parsing failed");
      return res.end();
    }

    let website;
    sendProgress(70, "Finalizing website...");

    if (websiteId) {
      website = await Website.findOne({ _id: websiteId, user: user._id });
      if (!website) {
        sendProgress(0, "Not found");
        return res.end();
      }

      website.latestCode = parsed.code;
      website.conversation.push(
        { role: "user", content: prompt || "Update request" },
        { role: "ai", content: parsed.message }
      );

      // --- AUTO-UPDATE LOGIC ---
      if (website.deployed) {
        sendProgress(85, "Updating live deployment...");
        const deployData = await triggerVercelDeploy(website, parsed.code);
        if (deployData && deployData.url) {
          website.deployedUrl = `https://${deployData.url}`;
        }
      }
      await website.save();
    } else {
      const slug = `${prompt?.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) || "site"}-${Date.now()}`;
      website = await Website.create({
        user: user._id,
        title: prompt?.split(" ").slice(0, 6).join(" ") || "New Project",
        slug,
        latestCode: parsed.code,
        conversation: [
          { role: "user", content: prompt || "Initial request" },
          { role: "ai", content: parsed.message },
        ],
      });
    }

    // Deduct credits and save
    user.credits -= cost;
    await user.save();

    // Success response with updated credits
    sendProgress(100, "Success");
    res.write(
      `data: ${JSON.stringify({
        done: true,
        websiteId: website._id,
        code: parsed.code,
        message: parsed.message,
        remainingCredits: user.credits, // Updated credit count
        deployedUrl: website.deployedUrl,
        isDeployed: website.deployed
      })}\n\n`
    );
    res.end();
  } catch (error) {
    console.error("Main Error:", error);
    res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    res.end();
  }
};

/*
-----------------------------------------
DEPLOY WEBSITE (MANUAL)
-----------------------------------------
*/
export const deployWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const website = await Website.findOne({ _id: id, user: req.user._id });

    if (!website) return res.status(404).json({ message: "Website not found" });

    const data = await triggerVercelDeploy(website, website.latestCode);

    if (data.error || !data.url) {
      return res.status(500).json({ message: data.error || "Vercel deployment failed" });
    }

    website.deployed = true;
    website.deployedUrl = `https://${data.url}`;
    await website.save();

    res.json({
      success: true,
      deployedUrl: website.deployedUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Deployment failed", error: error.message });
  }
};

// ... (Baki ke functions: getUserWebsites, getWebsiteById, saveConversation, updateWebsiteCode, deleteWebsite wahi rahenge)

/*
-----------------------------------------
GET USER WEBSITES
-----------------------------------------
*/
export const getUserWebsites = async (req, res) => {

  try {

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const websites = await Website.find({
      user: req.user._id
    })
      .sort({ createdAt: -1 })
      .select("_id title deployed deployedUrl createdAt")

    return res.status(200).json({
      success: true,
      websites
    });

  } catch (error) {

    console.error("Fetch websites error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch websites"
    });

  }
  
};



/*
-----------------------------------------
GET SINGLE WEBSITE
-----------------------------------------
*/
export const getWebsiteById = async (req, res) => {

  try {

    const { id } = req.params;

    const website = await Website.findOne({
      _id: id,
      user: req.user._id
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    return res.status(200).json({
      success: true,
      website
    });

  } catch (error) {

    console.error("Fetch website error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch website"
    });

  }

};



/*
-----------------------------------------
DEPLOY WEBSITE
-----------------------------------------
*/


/*
-----------------------------------------
SAVE CONVERSATION MESSAGE
-----------------------------------------
*/
export const saveConversation = async (req, res) => {

  try {

    const { id } = req.params;
    const { message } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    if (!message || !message.role || !message.content) {
      return res.status(400).json({
        message: "Invalid message format"
      });
    }

    const website = await Website.findOne({
      _id: id,
      user: req.user._id
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    // Add message to conversation and save
    website.conversation.push(message);
    await website.save();

    return res.status(200).json({
      success: true,
      message: "Conversation saved",
      conversation: website.conversation
    });

  } catch (error) {

    console.error("❌ Save conversation error:", error.message);
    console.error("MongoDB Connection:", mongoose.connection.readyState); // 1=connected, 0=disconnected

    return res.status(500).json({
      success: false,
      message: "Failed to save conversation",
      error: error.message,
      mongoStatus: mongoose.connection.readyState
    });

  }

};



/*
-----------------------------------------
UPDATE WEBSITE CODE
-----------------------------------------
*/
export const updateWebsiteCode = async (req, res) => {

  try {

    const { id } = req.params;
    const { code } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    if (!code) {
      return res.status(400).json({
        message: "Code is required"
      });
    }

    const website = await Website.findOne({
      _id: id,
      user: req.user._id
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    // Update code and save
    website.latestCode = code;
    await website.save();

    return res.status(200).json({
      success: true,
      message: "Code updated successfully",
      website
    });

  } catch (error) {

    console.error("Update code error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update code",
      error: error.message
    });

  }

};

/*
-----------------------------------------
DELETE WEBSITE
-----------------------------------------
*/
export const deleteWebsite = async (req, res) => {

  try {

    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const website = await Website.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!website) {
      return res.status(404).json({
        message: "Website not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Website deleted successfully"
    });

  } catch (error) {

    console.error("Delete website error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete website",
      error: error.message
    });

  }

};