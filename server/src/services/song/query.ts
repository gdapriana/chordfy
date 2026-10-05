import { prisma } from "@/db/db";
import { Prisma } from "@/generated/prisma/client";
import { SongQueryResponse } from "@/utils/responses/song.response";
import {
  SongQueryResponseType,
  SongValidation
} from "@/validations/song.validation";

export const SongQueryService = async (
  query: unknown
): Promise<SongQueryResponseType> => {
  return prisma.$transaction(async tx => {
    const validatedQuery = SongValidation.QUERY.parse(query);
    const { title, artist, genre, page, take, sort, order } = validatedQuery;

    const where: Prisma.SongWhereInput = {};
    const orderBy: Prisma.SongOrderByWithRelationInput[] =
      sort === "id" ? [{ id: order }] : [{ [sort]: order }, { id: order }];

    if (title) {
      where.title = { contains: title, mode: "insensitive" };
    }
    if (artist) {
      where.artist = { name: { contains: artist, mode: "insensitive" } };
    }
    if (genre?.length) {
      where.genres = { some: { genre: { name: { in: genre } } } };
    }
    const [data, total] = await prisma.$transaction([
      prisma.song.findMany({
        where,
        select: SongQueryResponse,
        orderBy,
        skip: (page - 1) * take,
        take
      }),
      prisma.song.count()
    ]);
    const totalPages = Math.ceil(total / take);

    return {
      items: data,
      pagination: {
        page,
        take,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  });
};
