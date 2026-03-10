import mongoose from "mongoose";
import Website from "../models/website.model.js";
import User from "../models/user.model.js";
import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";
import fetch from "node-fetch";
const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR UI/UX ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING ONLY HTML, CSS, AND JAVASCRIPT.

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR
--------------------------------------------------
- Premium modern UI
- Business ready content
- Smooth transitions
- Professional typography
- SPA style navigation

RESPONSIVE DESIGN (MANDATORY)
--------------------------------------------------
Mobile first responsive design

Breakpoints:
Mobile <768px
Tablet 768px–1024px
Desktop >1024px

Use:
Flexbox / Grid
Media queries
Relative units

IMAGES
--------------------------------------------------
Use only:
https://images.unsplash.com/

Add parameters:
?auto=format&fit=crop&w=1200&q=80

TECHNICAL RULES
--------------------------------------------------
- ONE HTML file
- ONE style tag
- ONE script tag
- NO external libraries
- System fonts only
- iframe srcdoc compatible

PAGES
--------------------------------------------------
Home
About
Services
Contact

OUTPUT FORMAT
--------------------------------------------------
{
"message": "short confirmation",
"code": "<FULL HTML DOCUMENT>"
}

RETURN RAW JSON ONLY
`;



/*
-----------------------------------------
GENERATE OR MODIFY WEBSITE
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
      Connection: "keep-alive"
    });

  const { prompt, websiteId } = req.method === "GET" ? req.query : req.body;  

    sendProgress(5, "Checking prompt...");

    if (!prompt) {
      sendProgress(0, "Prompt missing");
      return res.end();
    }

    sendProgress(10, "Checking authentication...");

    if (!req.user) {
      sendProgress(0, "User not authenticated");
      return res.end();
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      sendProgress(0, "User not found");
      return res.end();
    }

    const cost = websiteId ? 25 : 50;

    sendProgress(15, "Checking credits...");

    if (!user.credits || user.credits < cost) {
      sendProgress(0, "Insufficient credits");
      return res.end();
    }

    const sanitizedPrompt = prompt.replace(/[<>]/g, "");

    const finalPrompt = masterPrompt.replace(
      "{USER_PROMPT}",
      sanitizedPrompt
    );

    let raw = "";
    let parsed = null;

    sendProgress(25, "Sending request to AI...");

    for (let i = 0; i < 3 && !parsed; i++) {

      try {

        raw = await generateResponse(
          finalPrompt + "\n\nIMPORTANT: RETURN ONLY RAW JSON."
        );

        sendProgress(55, "AI generating website...");

        parsed = await extractJson(raw);

      } catch (aiError) {

        console.error("⚠️ AI parsing attempt failed:", aiError.message);

      }

    }

    if (!parsed) {

      sendProgress(0, "AI parsing failed");

      return res.end();

    }

    if (!parsed.code || !parsed.code.includes("<html")) {

      sendProgress(0, "Invalid HTML generated");

      return res.end();

    }

    let website;

    sendProgress(70, "Preparing website data...");

    /*
    MODIFY WEBSITE
    */
    if (websiteId) {

      website = await Website.findOne({
        _id: websiteId,
        user: user._id
      });

      if (!website) {
        sendProgress(0, "Website not found");
        return res.end();
      }

      website.latestCode = parsed.code;

      website.conversation.push(
        { role: "user", content: prompt },
        { role: "ai", content: parsed.message }
      );

      await website.save();

      console.log("✅ Website updated");

    }

    /*
    CREATE WEBSITE
    */
    else {

      const slug =
        prompt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();

      website = await Website.create({

        user: user._id,

        title: prompt.split(" ").slice(0, 6).join(" "),

        slug: slug,

        latestCode: parsed.code,

        conversation: [
          { role: "user", content: prompt },
          { role: "ai", content: parsed.message }
        ]

      });

      console.log("✅ Website created");

    }

    sendProgress(85, "Saving website...");

    user.credits -= cost;

    await user.save();

    sendProgress(100, "Website generated successfully");

    res.write(
      `data: ${JSON.stringify({
        done: true,
        websiteId: website._id,
        code: parsed.code,
        message: parsed.message,
        remainingCredits: user.credits
      })}\n\n`
    );

    res.end();

  }

  catch (error) {

    console.error("❌ Website generation error:", error);

    res.write(
      `data: ${JSON.stringify({
        error: true,
        message: error.message
      })}\n\n`
    );

    res.end();

  }

};



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
export const deployWebsite = async (req, res) => {

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

    const projectName =
      website.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .substring(0, 30) +
      "-" +
      website._id.toString().slice(-6);

    const vercelResponse = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: projectName,
          files: [
            {
              file: "index.html",
              data: website.latestCode
            }
          ]
        })
      }
    );

    const data = await vercelResponse.json();

    console.log("Vercel response:", data);

    if (!vercelResponse.ok) {
      return res.status(500).json({
        message: data.error?.message || "Vercel deployment failed"
      });
    }

    const deployedUrl = `https://${data.url}`;

    website.deployed = true;
    website.deployedUrl = deployedUrl;

    await website.save();

    res.json({
      success: true,
      deployedUrl
    });

  } catch (error) {

    console.error("Deploy error:", error);

    res.status(500).json({
      message: "Deployment failed",
      error: error.message
    });

  }

};


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