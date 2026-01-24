import express from "express";
import isAuth from "../middleware/isAuth";
import * as MarketingController from "../controllers/MarketingController";
import multer from "multer";
import uploadConfig from "../config/upload";

const routes = express.Router();
const upload = multer(uploadConfig);

routes.get("/marketing/status", isAuth, MarketingController.status);
routes.get("/marketing/insights", isAuth, MarketingController.insights);
routes.get("/marketing/pages", isAuth, MarketingController.pages);
routes.post("/marketing/campaign", isAuth, MarketingController.createCampaign);
routes.post("/marketing/adset", isAuth, MarketingController.createAdSet);
routes.post("/marketing/creative", isAuth, MarketingController.createCreative);
routes.post("/marketing/ad", isAuth, MarketingController.createAd);
routes.post("/marketing/whatsapp-adflow", isAuth, MarketingController.createWhatsappAdFlow);
routes.post("/marketing/campaign/status", isAuth, MarketingController.updateCampaignStatus);
routes.post("/marketing/adset/status", isAuth, MarketingController.updateAdSetStatus);
routes.post("/marketing/adimage", isAuth, upload.single("image"), MarketingController.uploadAdImage);

export default routes;
