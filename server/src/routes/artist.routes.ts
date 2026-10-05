import { ArtistController } from "@/controllers/artist.controller";
import { Router } from "express";

const artistRouter = Router();

artistRouter.get("/get", ArtistController.GET);
artistRouter.get("/query", ArtistController.QUERY);

export default artistRouter;
