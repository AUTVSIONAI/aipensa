import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";
import { authLimiter, refreshTokenLimiter } from "../middleware/rateLimiter";

const authRoutes = Router();

authRoutes.post("/signup", authLimiter, UserController.store);
authRoutes.post("/login", authLimiter, SessionController.store);
authRoutes.post(
  "/refresh_token",
  refreshTokenLimiter,
  SessionController.update
);
authRoutes.delete("/logout", SessionController.remove);
authRoutes.get("/me", isAuth, SessionController.me);

export default authRoutes;
