import express from "express";
import isAuth from "../middleware/isAuth";
import * as MarketingController from "../controllers/MarketingController";

const routes = express.Router();

routes.get("/marketing/status", isAuth, MarketingController.status);
routes.get("/marketing/insights", isAuth, MarketingController.insights);
routes.post("/marketing/campaign", isAuth, MarketingController.createCampaign);
routes.post("/marketing/adset", isAuth, MarketingController.createAdSet);
routes.post("/marketing/creative", isAuth, MarketingController.createCreative);
routes.post("/marketing/ad", isAuth, MarketingController.createAd);

export default routes;
