import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { errorHandler } from "./middlewares/error-handler";
import { setupSwagger } from "./configs/swagger";
import healthRoutes from "./routes/health.routes";
import env from "./configs/env";
import sourceMapSupport from "source-map-support";
import songRouter from "@/routes/song.routes";
import artistRouter from "@/routes/artist.routes";
sourceMapSupport.install();

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

setupSwagger(app);

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api/health");
});
app.use("/api/health", healthRoutes);
app.use("/api/songs", songRouter);
app.use("/api/artists", artistRouter);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
