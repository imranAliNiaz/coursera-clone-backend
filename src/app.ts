import express from "express";
import path from "path";
import routes from "./routes";
import uploadRoutes from "./routes/upload.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/upload", uploadRoutes);
app.use(routes);

app.use(errorMiddleware);

export default app;
