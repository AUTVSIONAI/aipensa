import { Router, Request, Response } from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  getClinics,
  getClinicById,
  getPatients,
  getPatientById,
  createPatient,
  updatePatient
} from "../services/imaginasoftApi";
import { clinicLimiter } from "../middleware/rateLimiter";
import logger from "../utils/logger";

const router = Router();

router.use(clinicLimiter);

// --- Rotas de Clinics ---
router.get("/clinics", async (req: Request, res: Response) => {
  try {
    const clinics = await getClinics();
    res.json(clinics);
  } catch (error: any) {
    logger.error(error, "Erro ao obter clínicas");
    res
      .status(500)
      .json({ error: "Erro ao obter clínicas", details: error.message });
  }
});

router.get("/clinics/:id", async (req: Request, res: Response) => {
  try {
    const clinic = await getClinicById(req.params.id);
    res.json(clinic);
  } catch (error: any) {
    logger.error(error, "Erro ao obter detalhes da clínica");
    res.status(500).json({
      error: "Erro ao obter detalhes da clínica",
      details: error.message
    });
  }
});

// --- Rotas de Patients ---
router.get("/patients", async (req: Request, res: Response) => {
  try {
    const patients = await getPatients(req.query);
    res.json(patients);
  } catch (error: any) {
    logger.error(error, "Erro ao obter pacientes");
    res
      .status(500)
      .json({ error: "Erro ao obter pacientes", details: error.message });
  }
});

router.get("/patients/:id", async (req: Request, res: Response) => {
  try {
    const patient = await getPatientById(req.params.id);
    res.json(patient);
  } catch (error: any) {
    logger.error(error, "Erro ao obter detalhes do paciente");
    res.status(500).json({
      error: "Erro ao obter detalhes do paciente",
      details: error.message
    });
  }
});

router.post("/patients", async (req: Request, res: Response) => {
  try {
    const newPatient = await createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (error: any) {
    logger.error(error, "Erro ao criar paciente");
    res
      .status(500)
      .json({ error: "Erro ao criar paciente", details: error.message });
  }
});

router.put("/patients/:id", async (req: Request, res: Response) => {
  try {
    const updatedPatient = await updatePatient(req.params.id, req.body);
    res.json(updatedPatient);
  } catch (error: any) {
    logger.error(error, "Erro ao atualizar paciente");
    res
      .status(500)
      .json({ error: "Erro ao atualizar paciente", details: error.message });
  }
});

// --- Rotas de Appointments ---
router.get("/appointments", async (req: Request, res: Response) => {
  try {
    const appointments = await getAppointments(req.query);
    res.json(appointments);
  } catch (error: any) {
    logger.error(error, "Erro ao obter agendamentos");
    res
      .status(500)
      .json({ error: "Erro ao obter agendamentos", details: error.message });
  }
});

router.get("/appointments/:id", async (req: Request, res: Response) => {
  try {
    const appointment = await getAppointmentById(req.params.id);
    res.json(appointment);
  } catch (error: any) {
    logger.error(error, "Erro ao obter detalhes do agendamento");
    res.status(500).json({
      error: "Erro ao obter detalhes do agendamento",
      details: error.message
    });
  }
});

router.post("/appointments", async (req: Request, res: Response) => {
  try {
    const newAppointment = await createAppointment(req.body);
    res.status(201).json(newAppointment);
  } catch (error: any) {
    logger.error(error, "Erro ao criar agendamento");
    res
      .status(500)
      .json({ error: "Erro ao criar agendamento", details: error.message });
  }
});

router.put("/appointments/:id", async (req: Request, res: Response) => {
  try {
    const updatedAppointment = await updateAppointment(req.params.id, req.body);
    res.json(updatedAppointment);
  } catch (error: any) {
    logger.error(error, "Erro ao atualizar agendamento");
    res
      .status(500)
      .json({ error: "Erro ao atualizar agendamento", details: error.message });
  }
});

export default router;
