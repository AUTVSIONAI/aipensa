import express from "express";
import isAuth from "../middleware/isAuth";
import isAuthCompany from "../middleware/isAuthCompany";

import * as CompanyController from "../controllers/CompanyController";

const companyRoutes = express.Router();

companyRoutes.get("/companies/list", isAuth, CompanyController.list);
companyRoutes.get("/companies", isAuth, CompanyController.index);
companyRoutes.get("/companies/:id", isAuth, CompanyController.show);
companyRoutes.post("/companies", CompanyController.store);
companyRoutes.put("/companies/:id", isAuth, CompanyController.update);
companyRoutes.put(
  "/companies/:id/schedules",
  isAuth,
  CompanyController.updateSchedules
);
companyRoutes.delete("/companies/:id", isAuth, CompanyController.remove);

// Rota para listar o plano da empresa
companyRoutes.get(
  "/companies/listPlan/:id",
  isAuthCompany,
  CompanyController.listPlan
);
companyRoutes.get("/companiesPlan", isAuth, CompanyController.indexPlan);

export default companyRoutes;
