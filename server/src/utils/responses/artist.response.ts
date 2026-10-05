import { Prisma } from "@/generated/prisma/client";
import { SongQueryResponse } from "@/utils/responses/song.response";
export const ArtistGetResponse: Prisma.ArtistInclude = {
  songs: {
    select: SongQueryResponse
  }
};
export const ArtistQueryResponse: Prisma.ArtistSelect = {
  id: true,
  slug: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  imageUrl: true,
  verified: true,
  _count: {
    select: {
      songs: true
    }
  }
};
