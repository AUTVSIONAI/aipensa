import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as VerssionController from "../controllers/VersionController";

const versionRouter = Router();

versionRouter.get("/version", VerssionController.index);
versionRouter.post("/version", isAuth, VerssionController.store);

export default versionRouter;
