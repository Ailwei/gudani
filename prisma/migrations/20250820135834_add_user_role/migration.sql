-- CreateEnum
CREATE TYPE "public"."usersRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "userRole" "public"."usersRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlashcardSet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flashcard" (
    "id" SERIAL NOT NULL,
    "setId" INTEGER NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NoteSummary" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SyllabusChunk" (
    "id" SERIAL NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "chunk" TEXT NOT NULL,
    "fileData" BYTEA,
    "fileName" TEXT,
    "topic" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyllabusChunk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlashcardSet" ADD CONSTRAINT "FlashcardSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flashcard" ADD CONSTRAINT "Flashcard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."FlashcardSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoteSummary" ADD CONSTRAINT "NoteSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
