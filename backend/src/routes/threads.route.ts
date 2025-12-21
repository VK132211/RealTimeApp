import { Router } from "express";
import {
  createdThreads,
  getThreadById,
  listCategories,
  listThreads,
  parseThreadListFilter,
} from "../modules/threads/threads.repository.js";
import { getAuth } from "@clerk/express";
import { BadRequestError, UnAuthorizedError } from "../lib/errors.js";
import z from "zod";
import { getUserFromClerk } from "../modules/users/user.service.js";
export const threadsRouter = Router();

const createdThreadSchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(10).max(2000),
  categorySlug: z.string().trim().min(1),
});
threadsRouter.get("/categories", async (_req, res, next) => {
  try {
    const extractListOfCategories = await listCategories();
    res.json({ data: extractListOfCategories });
  } catch (error) {
    next(error);
  }
});

threadsRouter.post("/threads", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }
    const parsedBody = createdThreadSchema.parse(req.body);
    const profile = await getUserFromClerk(auth.userId);
    const newlyCreatedThread = await createdThreads({
      categorySlug: parsedBody.categorySlug,
      authorUserId: profile.user.id,
      title: parsedBody.title,
      body: parsedBody.body,
    });
    res.status(201).json({ data: newlyCreatedThread });
  } catch (error) {
    next(error);
  }
});

threadsRouter.get("/threads/:threadId", async (req, res, next) => {
  try {
    const threadId = BigInt(req.params.threadId);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError("Invalid thread id");
    }
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }
    // const profile = await getUserFromClerk(auth.userId)
    // const viewerUserId=profile.user.id;
    const thread = await getThreadById(threadId);
    res.json({ data: thread });
  } catch (error) {
    next(error);
  }
});

threadsRouter.get("threads", async (req, res, next) => {
  try {
    const filter = parseThreadListFilter({
      page: req.query.page,
      pageSize: req.query.pageSize,
      category: req.query.category,
      q: req.query.q,
      sort: req.query.sort,
    });

    const extractListOfThreads = await listThreads(filter);
    res.json({ data: extractListOfThreads });
  } catch (error) {
    next(error);
  }
});
