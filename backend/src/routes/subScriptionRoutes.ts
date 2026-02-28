import express from "express";
import isAuth from "../middleware/isAuth";
import { webhookLimiter } from "../middleware/rateLimiter";

import * as SubscriptionController from "../controllers/SubscriptionController";

const subscriptionRoutes = express.Router();

subscriptionRoutes.post(
  "/subscription",
  isAuth,
  SubscriptionController.createSubscription
);

subscriptionRoutes.post(
  "/subscription/stripewebhook",
  webhookLimiter,
  express.raw({ type: "application/json" }),
  SubscriptionController.stripewebhook
);

export default subscriptionRoutes;
