import { prisma } from "@/db/db";
import { Prisma } from "@/generated/prisma/client";
import { ArtistQueryResponse } from "@/utils/responses/artist.response";
import {
  ArtistQueryResponseType,
  ArtistValidation
} from "@/validations/artist.validation";

export const ArtistQueryService = async (
  query: unknown
): Promise<ArtistQueryResponseType> => {
  return prisma.$transaction(async tx => {
    const validatedQuery = ArtistValidation.QUERY.parse(query);
    const { name, page, take, sort, order } = validatedQuery;

    const where: Prisma.ArtistWhereInput = {};
    const orderBy: Prisma.ArtistOrderByWithRelationInput[] =
      sort === "id" ? [{ id: order }] : [{ [sort]: order }, { id: order }];

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }
    const [data, total] = await prisma.$transaction([
      prisma.artist.findMany({
        where,
        select: ArtistQueryResponse,
        orderBy,
        skip: (page - 1) * take,
        take
      }),
      prisma.artist.count()
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
