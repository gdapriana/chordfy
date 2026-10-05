import { SongController } from "@/controllers/song.controller";
import { Router } from "express";

const songRouter = Router();

songRouter.get("/get", SongController.GET);
songRouter.get("/query", SongController.QUERY);

export default songRouter;
