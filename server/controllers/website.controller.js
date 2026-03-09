import Website from "../models/website.model.js";
import User from "../models/user.model.js";
import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";

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
GENERATE WEBSITE
-----------------------------------------
*/
export const generateWebsite = async (req, res) => {

  try {

    const { prompt, websiteId } = req.body;

    if (!prompt) {
      return res.status(400).json({
        message: "Prompt is required"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.credits < 50) {
      return res.status(403).json({
        message: "Insufficient credits"
      });
    }

    const sanitizedPrompt = prompt.replace(/[<>]/g, "");

    const finalPrompt = masterPrompt.replace(
      "{USER_PROMPT}",
      sanitizedPrompt
    );

    let raw = "";
    let parsed = null;

    for (let i = 0; i < 3 && !parsed; i++) {

      raw = await generateResponse(
        finalPrompt + "\n\nIMPORTANT: RETURN ONLY RAW JSON."
      );

      parsed = await extractJson(raw);
    }

    if (!parsed) {
      return res.status(500).json({
        message: "AI response parsing failed"
      });
    }

    if (!parsed.code || !parsed.code.includes("<html")) {
      return res.status(500).json({
        message: "Invalid website generated"
      });
    }

    let website;

    // If websiteId provided, update existing website
    if (websiteId) {
      website = await Website.findOne({
        _id: websiteId,
        user: user._id
      });

      if (!website) {
        return res.status(404).json({
          message: "Website not found"
        });
      }

      // Update existing website
      website.latestCode = parsed.code;
      website.conversation.push({
        role: "user",
        content: prompt
      });
      website.conversation.push({
        role: "ai",
        content: parsed.message
      });
      await website.save();

    } else {
      // Create new website
      website = await Website.create({

        user: user._id,

        title: prompt.split(" ").slice(0, 6).join(" "),

        latestCode: parsed.code,

        conversation: [
          {
            role: "user",
            content: prompt
          },
          {
            role: "ai",
            content: parsed.message
          }
        ]

      });
    }

    await User.findByIdAndUpdate(user._id, {
      $inc: { credits: -50 }
    });

    return res.status(200).json({

      websiteId: website._id,

      code: parsed.code,

      message: parsed.message,

      remainingCredits: user.credits - 50

    });

  } catch (error) {

    console.error("Website generation error:", error);

    return res.status(500).json({
      success: false,
      message: "Website generation failed",
      error: error.message
    });

  }

};



/*
-----------------------------------------
GET USER WEBSITES (DASHBOARD)
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
      .select("_id title deployed createdAt");

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
GET SINGLE WEBSITE (PREVIEW / EDIT)
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

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
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

    // Generate unique slug for deployment
    const slug = `${website.title.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substr(2, 9)}`;

    // Update website with deployed status and slug
    const updatedWebsite = await Website.findByIdAndUpdate(
      id,
      {
        deployed: true,
        deployedUrl: `${process.env.DEPLOY_URL || "http://localhost:8000"}/deploy/${slug}`,
        slug: slug
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Website deployed successfully",
      deployedUrl: updatedWebsite.deployedUrl,
      website: updatedWebsite
    });

  } catch (error) {

    console.error("Deploy website error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deploy website",
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

    console.error("Save conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save conversation",
      error: error.message
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