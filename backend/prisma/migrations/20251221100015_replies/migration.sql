-- CreateTable
CREATE TABLE "replies" (
    "id" BIGSERIAL NOT NULL,
    "thread_id" BIGINT NOT NULL,
    "author_user_id" BIGINT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_reactions" (
    "id" BIGSERIAL NOT NULL,
    "thread_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_replies_thread_created_at" ON "replies"("thread_id", "created_at" ASC);

-- CreateIndex
CREATE INDEX "idx_thread_reactions_thread" ON "thread_reactions"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "thread_reactions_thread_id_user_id_key" ON "thread_reactions"("thread_id", "user_id");

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replies" ADD CONSTRAINT "replies_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_reactions" ADD CONSTRAINT "thread_reactions_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_reactions" ADD CONSTRAINT "thread_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
