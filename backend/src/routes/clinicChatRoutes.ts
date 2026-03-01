// backend/src/routes/clinicChatRoutes.ts
import { Router, Request, Response } from "express";
import { handleAppointmentRequest } from "../services/ClinicChatService";
import { clinicLimiter } from "../middleware/rateLimiter";
import logger from "../utils/logger";

const router = Router();

router.use(clinicLimiter);

router.post("/clinic-schedule", async (req: Request, res: Response) => {
  const { patientInfo, medicId, date, time } = req.body;

  if (!patientInfo || !medicId || !date || !time) {
    return res.status(400).json({
      error: "Missing required fields: patientInfo, medicId, date, time"
    });
  }

  try {
    const result = await handleAppointmentRequest(
      patientInfo,
      medicId,
      date,
      time
    );
    res.json(result);
  } catch (error: any) {
    logger.error(error, "Erro ao agendar consulta");
    res.status(500).json({
      error: "Erro interno ao agendar consulta",
      details: error.message
    });
  }
});

export default router;
