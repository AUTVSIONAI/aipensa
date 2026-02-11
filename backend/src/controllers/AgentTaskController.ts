import { Request, Response } from "express";
import AgentTask from "../models/AgentTask";
import { AgentExecutionQueue } from "../jobs";
import Queue from "../libs/queue";

export const createTask = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  const { type, payload } = req.body;

  try {
    const task = await AgentTask.create({
      userId,
      type,
      status: "awaiting_confirmation",
      payload
    });

    return res.json(task);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const confirmTask = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  const { taskId, confirmed } = req.body;

  try {
    const task = await AgentTask.findOne({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (confirmed) {
      await task.update({ status: "pending" });
      // Add to BullMQ
      Queue.add("AgentExecutionQueue", { taskId: task.id });
    } else {
      await task.update({ status: "cancelled" });
    }

    return res.json(task);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getTaskStatus = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  const { id } = req.params;

  try {
    const task = await AgentTask.findOne({ where: { id, userId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    return res.json(task);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const listTasks = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  try {
    const tasks = await AgentTask.findAll({ 
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 50 
    });
    return res.json(tasks);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
