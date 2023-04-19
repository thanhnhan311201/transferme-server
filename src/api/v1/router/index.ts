import express from "express";

import userRoutes from "../user/user.routes";

const router = express();

router.use("/user", userRoutes);

export default router;
