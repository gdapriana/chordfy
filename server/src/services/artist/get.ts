import { RESPONSE_MESSAGE } from "@/constants/response-message";
import { STATUS_CODES } from "@/constants/status-codes";
import { prisma } from "@/db/db";
import { Artist } from "@/generated/prisma/client";
import { ApiError } from "@/utils/api-error";
import { ArtistGetResponse } from "@/utils/responses/artist.response";
import { ArtistValidation } from "@/validations/artist.validation";

export const ArtistGetService = async (query: unknown): Promise<Artist> => {
  return await prisma.$transaction(async tx => {
    const { by, value } = ArtistValidation.GET.parse(query);
    const Artist = await tx.artist.findUnique({
      where: by === "id" ? { id: value } : { slug: value },
      include: ArtistGetResponse
    });
    if (!Artist) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGE.ERROR.NOT_FOUND
      );
    }
    return Artist;
  });
};
