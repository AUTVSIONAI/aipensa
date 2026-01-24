import express from "express";
import isAuth from "../middleware/isAuth";
import * as InstagramController from "../controllers/InstagramController";

const routes = express.Router();

routes.post("/instagram/message", isAuth, InstagramController.sendMessage);

export default routes;
