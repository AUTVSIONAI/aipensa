import express from "express";
import isAuth from "../middleware/isAuth";

import * as SubscriptionController from "../controllers/SubscriptionController";

const subscriptionRoutes = express.Router();

subscriptionRoutes.post(
  "/subscription",
  isAuth,
  SubscriptionController.createSubscription
);

// Note: /subscription/stripewebhook is mounted directly in app.ts
// BEFORE bodyParser.json() so Stripe signature verification works with raw body

export default subscriptionRoutes;
