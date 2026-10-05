import { RESPONSE_MESSAGE } from "@/constants/response-message";
import { STATUS_CODES } from "@/constants/status-codes";
import { prisma } from "@/db/db";
import { Song } from "@/generated/prisma/client";
import { ApiError } from "@/utils/api-error";
import { SongGetResponse } from "@/utils/responses/song.response";
import { SongValidation } from "@/validations/song.validation";

export const SongGetService = async (query: unknown): Promise<Song> => {
  return await prisma.$transaction(async tx => {
    const { by, value } = SongValidation.GET.parse(query);
    const song = await tx.song.findUnique({
      where: by === "id" ? { id: value } : { slug: value },
      include: SongGetResponse
    });
    if (!song) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGE.ERROR.NOT_FOUND
      );
    }
    return song;
  });
};
