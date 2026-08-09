import express from "express";
import type { Request, Response } from "express";
import { pool } from "../config/db";

const router = express.Router();

// Public, unauthenticated liveness/readiness check. Deliberately touches the
// database (not just `res.json`) so a periodic ping to this route also
// prevents free-tier Postgres providers (e.g. Supabase) from pausing the
// project after a period of inactivity, in addition to keeping a free-tier
// Render web service from spinning down after ~15 idle minutes.
router.get("/", async (_req: Request, res: Response) => {
    try {
        await pool.query("SELECT 1");
        return res.status(200).json({ status: "ok" });
    } catch {
        return res.status(503).json({ status: "unavailable" });
    }
});

export default router;
