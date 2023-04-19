import express from "express";

import { default as routerV1 } from "./api/v1/router";

const apiRouter = express();

apiRouter.use("/v1", routerV1);

export default apiRouter;
