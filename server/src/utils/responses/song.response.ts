import { Prisma } from "@/generated/prisma/client";
export const SongGetResponse: Prisma.SongInclude = {
  artist: true,
  _count: true,
  genres: {
    include: {
      genre: true
    }
  }
};

export const SongQueryResponse: Prisma.SongSelect = {
  id: true,
  bpm: true,
  slug: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  originalKey: true,
  capo: true,
  viewsCount: true,
  artist: {
    select: {
      name: true,
      id: true,
      slug: true
    }
  },
  genres: {
    select: {
      genre: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  }
};
