import { Artist, Song } from "@/generated/prisma/client";
import { PaginationType } from "@/utils/pagination";
import z from "zod";

const sortableFields = ["id", "createdAt", "updatedAt", "name"] as const;

export class ArtistValidation {
  static GET = z.object({
    by: z.enum(["id", "slug"]),
    value: z.string().trim().min(1)
  });
  static QUERY = z.object({
    name: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    take: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  });
}

export type ArtistQueryValidation = z.infer<typeof ArtistValidation.QUERY>;
export type ArtistGetValidation = z.infer<typeof ArtistValidation.GET>;
export type ArtistQueryResponseType = {
  items: Artist[];
  pagination: PaginationType;
};
