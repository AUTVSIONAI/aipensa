import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as HuggingFaceController from "../controllers/HuggingFaceController";

const huggingFaceRoutes = Router();

huggingFaceRoutes.post("/api/images/generate", isAuth, HuggingFaceController.generate);

export default huggingFaceRoutes;
