import { Song } from "@/generated/prisma/client";
import { PaginationType } from "@/utils/pagination";
import z from "zod";

const sortableFields = ["id", "createdAt", "updatedAt", "name"] as const;

const toArray = (v: unknown) =>
  v === undefined ? undefined : Array.isArray(v) ? v : String(v).split(",");

export class SongValidation {
  static GET = z.object({
    by: z.enum(["id", "slug"]),
    value: z.string().trim().min(1)
  });
  static QUERY = z.object({
    title: z.string().trim().min(1).optional(),
    artist: z.string().trim().min(1).optional(),
    genre: z.preprocess(toArray, z.array(z.string().trim().min(1)).optional()),
    page: z.coerce.number().int().min(1).default(1),
    take: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(sortableFields).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  });
}

export type SongQueryValidation = z.infer<typeof SongValidation.QUERY>;
export type SongGetValidation = z.infer<typeof SongValidation.GET>;
export type SongQueryResponseType = {
  items: Song[];
  pagination: PaginationType;
};
