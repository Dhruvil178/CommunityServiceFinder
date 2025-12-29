import express from 'express';
import { recommendForUser } from '../controllers/recommendController.js';


const router = express.Router();


// POST /api/recommend
router.post('/recommend', recommendForUser);


export default router;