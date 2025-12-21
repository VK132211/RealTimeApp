import { Router } from "express";
import {
  createdThreads,
  listCategories,
  listThreads,
  parseThreadListFilter,
} from "../modules/threads/threads.repository.js";
import { getAuth } from "@clerk/express";
import { BadRequestError, UnAuthorizedError } from "../lib/errors.js";
import z from "zod";
import { getUserFromClerk } from "../modules/users/user.service.js";
import {
  createReply,
  deleteReplyById,
  findReplyAuthor,
  getThreadDetailsWithCount,
  likeThreadOnce,
  listRepliesForThread,
} from "../modules/threads/replies.repository.js";
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
    const profile = await getUserFromClerk(auth.userId);
    const viewerUserId = profile.user.id;
    const thread = await getThreadDetailsWithCount({ threadId, viewerUserId });
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

threadsRouter.get("/threads/:threadId/replies", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }
    const threadId = BigInt(req.params.threadId);
    const replies = await listRepliesForThread(threadId);
    res.json({ data: replies });
  } catch (error) {
    next(error);
  }
});
threadsRouter.post("/threads/:threadId/replies", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }

    const threadId = BigInt(req.params.threadId);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError("Invalid Thread ID");
    }
    const bodyRaw = typeof req.body?.body === "string" ? req.body.body : "";
    if (bodyRaw.trim().length <= 2) {
      throw new BadRequestError("Reply is too short");
    }
    const profile = await getUserFromClerk(auth.userId);

    const reply = await createReply({
      threadId,
      authorUserId: profile.user.id,
      body: bodyRaw,
    });

    res.status(201).json({ data: reply });
  } catch (error) {
    next(error);
  }
});

threadsRouter.delete("/replies/:replyId", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }
    const replyId = BigInt(req.params.replyId);
    if (!Number.isInteger(replyId) || replyId <= 0) {
      throw new BadRequestError("Invalid Reply ID");
    }
    const profile = await getUserFromClerk(auth.userId);
    const authorUserId = await findReplyAuthor(replyId);
    if (authorUserId !== profile.user.id) {
      throw new UnAuthorizedError("you can only delete your own posts");
    }
    await deleteReplyById(replyId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

threadsRouter.post("/threads/:threadId/like", async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      throw new UnAuthorizedError("Unauthorized");
    }
    const threadId = BigInt(req.params.threadId);
    if (!Number.isInteger(threadId) || threadId <= 0) {
      throw new BadRequestError("Invalid Thread ID");
    }
    const profile = await getUserFromClerk(auth.userId);
    await likeThreadOnce({
      threadId,
      userId: profile.user.id,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
