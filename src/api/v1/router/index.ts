import express from "express";

import userRoutes from "../user/user.routes";

const router = express();

router.use("/auth", userRoutes);

export default router;
