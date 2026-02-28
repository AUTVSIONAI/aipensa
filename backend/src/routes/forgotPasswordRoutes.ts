import express from "express";
import * as ForgotController from "../controllers/ForgotController";
import { forgotPasswordLimiter } from "../middleware/rateLimiter";

const forgotsRoutes = express.Router();
forgotsRoutes.post("/forgetpassword/:email", forgotPasswordLimiter, ForgotController.store);
forgotsRoutes.post(
  "/resetpasswords/:email/:token/:password",
  forgotPasswordLimiter,
  ForgotController.resetPasswords
);
export default forgotsRoutes;
