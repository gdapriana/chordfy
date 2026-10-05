import { RESPONSE_MESSAGE } from "@/constants/response-message";
import { STATUS_CODES } from "@/constants/status-codes";
import { SongGetService } from "@/services/song/get";
import { SongQueryService } from "@/services/song/query";
import { ApiResponse } from "@/utils/api-response";
import type { NextFunction, Request, Response } from "express";

export class SongController {
  static async GET(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await SongGetService(query);
      ApiResponse.Success(
        res,
        RESPONSE_MESSAGE.SUCCESS.QUERY,
        result,
        STATUS_CODES.OK
      );
    } catch (e) {
      next(e);
    }
  }

  static async QUERY(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await SongQueryService(query);
      ApiResponse.Success(
        res,
        RESPONSE_MESSAGE.SUCCESS.QUERY,
        result,
        STATUS_CODES.OK
      );
    } catch (e) {
      next(e);
    }
  }
}
