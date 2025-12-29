import express from "express";
import { getEvents, registerEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/events", getEvents);
router.post("/events/register", registerEvent);

export default router;
