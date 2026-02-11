import express from "express";
import isAuth from "../middleware/isAuth";
import * as MetaAuthController from "../controllers/MetaAuthController";
import * as AgentTaskController from "../controllers/AgentTaskController";

const agentRoutes = express.Router();

// Meta Auth
agentRoutes.post("/auth/meta/login", isAuth, MetaAuthController.login);
// agentRoutes.get("/auth/meta/callback", MetaAuthController.callback); // Usually frontend handles this, backend exchanges token via login

agentRoutes.get("/meta/pages", isAuth, MetaAuthController.getPages);
agentRoutes.get("/meta/ads/accounts", isAuth, MetaAuthController.getAdAccounts);

// Agent Tasks
agentRoutes.post("/agent/task/create", isAuth, AgentTaskController.createTask);
agentRoutes.post("/agent/task/confirm", isAuth, AgentTaskController.confirmTask);
agentRoutes.get("/agent/task/:id/status", isAuth, AgentTaskController.getTaskStatus);
agentRoutes.get("/agent/tasks", isAuth, AgentTaskController.listTasks);

export default agentRoutes;
