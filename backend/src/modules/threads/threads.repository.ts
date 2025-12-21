import { prisma } from "../../db/prisma.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { Category, ThreadDeatils, ThreadListFilter, ThreadSummary } from "./threads.type.js";
export function parseThreadListFilter(queryObj: {
  page?: unknown;
  pageSize?: unknown;
  category?: unknown;
  q?: unknown;
  sort?: unknown;
}): ThreadListFilter {
  const page = Number(queryObj.page) || 1;
  const rawPageSize = Number(queryObj.pageSize) || 20;
  const pageSize = Math.min(Math.max(rawPageSize, 1), 50);

  const categorySlug =
    typeof queryObj.category === "string" && queryObj.category.trim() ? queryObj.category.trim() : undefined;
  const search = typeof queryObj.q === "string" && queryObj.q.trim() ? queryObj.q.trim() : undefined;
  const sort: "new" | "old" = queryObj.sort === "old" ? "old" : "new";
  return {
    page,
    pageSize,
    search,
    sort,
    categorySlug,
  };
}
export async function listCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createdThreads(params: {
  categorySlug: string;
  authorUserId: bigint;
  title: string;
  body: string;
}): Promise<ThreadDeatils> {
  const { categorySlug, authorUserId, title, body } = params;
  const categoryRes = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } });
  if (!categoryRes?.id) {
    throw new BadRequestError("Invalid category");
  }
  const insertRes = await prisma.thread.create({
    data: { categoryId: categoryRes?.id, authorUserId: authorUserId, title: title, body: body },
  });
  return getThreadById(insertRes.id);
}

export async function getThreadById(id: bigint): Promise<ThreadDeatils> {
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          slug: true,
          name: true,
        },
      },
      author: {
        select: {
          displayName: true,
          handle: true,
        },
      },
    },
  });
  if (!thread) {
    throw new NotFoundError("Thread Not Found");
  }

  return thread;
}

export async function listThreads(filter: ThreadListFilter): Promise<ThreadSummary[]> {
  const { page, pageSize, categorySlug, sort, search } = filter;
  const threads = await prisma.thread.findMany({
    where: {
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" } }, { body: { contains: search, mode: "insensitive" } }],
      }),
    },
    orderBy: {
      createdAt: sort === "old" ? "asc" : "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      category: {
        select: {
          slug: true,
          name: true,
        },
      },
      author: {
        select: {
          displayName: true,
          handle: true,
        },
      },
    },
  });
  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    excerpt: t.body.slice(0, 200),
    createdAt: t.createdAt,
    category: t.category,
    author: t.author,
  }));
}

