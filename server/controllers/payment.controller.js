import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import User from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/*
-----------------------------------
CREATE CHECKOUT SESSION
-----------------------------------
*/

export const createCheckoutSession = async (req, res) => {

  try {

    const { credits } = req.body;

    const priceMap = {
      10: 9900,
      50: 39900,
      100: 69900
    };

    const amount = priceMap[credits];

    if (!amount) {
      return res.status(400).json({
        message: "Invalid credit package"
      });
    }

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${credits} AI Credits`
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],

      metadata: {
        userId: req.user._id.toString(),
        credits: credits.toString()
      },

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`

    });

    res.json({
      url: session.url
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Checkout session failed"
    });

  }

};



/*
-----------------------------------
VERIFY PAYMENT
-----------------------------------
*/
// Backend: verifyPayment controller
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // 2. Check if this session was already processed
    // Stripe metadata check (Optional but good)
    if (session.metadata.isProcessed === "true") {
      return res.status(200).json({ success: true, message: "Already updated" });
    }

    const userId = session.metadata.userId;
    const creditsToAdd = Number(session.metadata.credits);

    // 3. Update User Credits
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: creditsToAdd } },
      { new: true }
    );

    // 4. (Optional) Mark session as processed in your DB if you have a Payment model
    // Otherwise, the frontend logic will handle the redirect.

    res.json({
      success: true,
      creditsAdded: creditsToAdd,
      newBalance: updatedUser.credits
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};