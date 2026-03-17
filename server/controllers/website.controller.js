import mongoose from "mongoose";
import Website from "../models/website.model.js";
import User from "../models/user.model.js";
import { generateResponse } from "../config/openRouter.js";
import extractJson from "../utils/extractJson.js";
import fetch from "node-fetch";

const masterPrompt = `
YOU ARE A SENIOR FULL-STACK WEB DEVELOPER.
TASK: Generate a single-file (HTML/CSS/JS) production-grade website.

RULES:
1. If EXISTING_CODE is provided, MODIFY it based on the USER_REQUEST.
2. If NO existing code is provided, BUILD a complete, modern website from scratch.
3. Use modern UI/UX (Tailwind CSS via CDN, Google Fonts, Lucide Icons).
4. ALWAYS include professional animations (Framer Motion style but in JS/CSS).
5. Ensure the design is responsive and has a luxury look.
6. OUTPUT MUST BE RAW JSON ONLY:
   { "message": "Short summary of changes", "code": "FULL_HTML_CODE" }
`;

export const generateWebsite = async (req, res) => {
    const send = (data) => {
        try {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            if (res.flush) res.flush();
        } catch (e) {
            console.error("SSE write failed:", e);
        }
    };

    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.flushHeaders();

        const { prompt, websiteId, model } = req.body;

        if (!prompt || !req.user) {
            send({ error: true, message: "Prompt or authentication missing" });
            return res.end();
        }

        const user = await User.findById(req.user._id);
        const cost = websiteId ? 25 : 50;

        if (!user || user.credits < cost) {
            send({ error: true, type: "CREDIT_ERROR", message: "Insufficient credits" });
            return res.end();
        }

        send({ message: "Analyzing requirement..." });

        let existingCode = "";
        let website = null;

        if (websiteId) {
            website = await Website.findOne({ _id: websiteId, user: user._id });
            if (website) {
                existingCode = website.latestCode;
            }
        }

        const messages = [
            { role: "system", content: masterPrompt },
            { role: "user", content: existingCode ? `Modify this existing code: ${existingCode}\n\nBased on this request: ${prompt}` : prompt }
        ];

        send({ message: "AI is crafting your code..." });
        const rawResponse = await generateResponse(messages, model);
        const parsed = await extractJson(rawResponse);

        if (!parsed || !parsed.code) {
            send({ error: true, message: "AI failed to generate valid code. Please try again." });
            return res.end();
        }

        if (website) {
            website.latestCode = parsed.code;
            website.conversation.push(
                { role: "user", content: prompt },
                { role: "ai", content: parsed.message || "Updated successfully" }
            );
        } else {
            // SLUG GENERATION FIX
            const uniqueSlug = `${prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 25)}-${Math.random().toString(36).substring(2, 8)}`;

            website = await Website.create({
                user: user._id,
                title: prompt.substring(0, 60),
                latestCode: parsed.code,
                slug: uniqueSlug,
                conversation: [
                    { role: "user", content: prompt },
                    { role: "ai", content: parsed.message || "Initial version generated" }
                ]
            });
        }

        user.credits -= cost;
        await user.save();
        await website.save();

        send({
            message: "Success! Website is ready.",
            code: parsed.code,
            websiteId: website._id,
            remainingCredits: user.credits
        });

        res.end();

    } catch (error) {
        console.error("Critical Error:", error);
        send({ error: true, message: error.message || "An internal error occurred" });
        res.end();
    }
};

export const getUserWebsites = async (req, res) => {
    try {
        const websites = await Website.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, websites });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch websites" });
    }
};

export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
        if (!website) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, website });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching website" });
    }
};

export const deployWebsite = async (req, res) => {
    try {
        const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
        if (!website) return res.status(404).json({ success: false, message: "Website not found" });

        // Vercel project name rules: lowercase, alphanumeric and hyphens only
        const projectName = `gensite-${website._id}`;
        
        // added skipAutoDetectionConfirmation=1 to prevent projectSettings error
        const vercelResponse = await fetch("https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.VERCEL_TOKEN.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: projectName,
                files: [{ 
                    file: "index.html", 
                    data: website.latestCode 
                }],
                projectSettings: {
                    framework: null // Tells Vercel this is a static HTML site
                },
                target: "production"
            })
        });

        const data = await vercelResponse.json();
        
        if (data.error) {
            console.error("Vercel Error:", data.error);
            throw new Error(data.error.message);
        }

        // Update database with live URL
        website.deployed = true;
        website.deployedUrl = `https://${data.url}`;
        await website.save();

        res.json({ 
            success: true, 
            deployedUrl: website.deployedUrl,
            message: "Deployed successfully!" 
        });
    } catch (error) {
        console.error("Deployment Catch Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWebsite = async (req, res) => {
    try {
        await Website.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

export const saveConversation = async (req, res) => {
    try {
        const { websiteId, role, content } = req.body;
        const website = await Website.findById(websiteId);
        if (!website) return res.status(404).json({ success: false });
        
        website.conversation.push({ role, content });
        await website.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

export const updateWebsiteCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;
        const website = await Website.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { latestCode: code },
            { new: true }
        );
        res.json({ success: true, website });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};