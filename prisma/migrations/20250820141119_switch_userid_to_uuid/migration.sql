/*
  Warnings:

  - The primary key for the `Activity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Flashcard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FlashcardSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `NoteSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SyllabusChunk` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Flashcard" DROP CONSTRAINT "Flashcard_setId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FlashcardSet" DROP CONSTRAINT "FlashcardSet_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NoteSummary" DROP CONSTRAINT "NoteSummary_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Activity" DROP CONSTRAINT "Activity_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Activity_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Activity_id_seq";

-- AlterTable
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chat_id_seq";

-- AlterTable
ALTER TABLE "public"."Flashcard" DROP CONSTRAINT "Flashcard_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "setId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Flashcard_id_seq";

-- AlterTable
ALTER TABLE "public"."FlashcardSet" DROP CONSTRAINT "FlashcardSet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FlashcardSet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FlashcardSet_id_seq";

-- AlterTable
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chatId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- AlterTable
ALTER TABLE "public"."NoteSummary" DROP CONSTRAINT "NoteSummary_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "NoteSummary_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "NoteSummary_id_seq";

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Quiz_id_seq";

-- AlterTable
ALTER TABLE "public"."SyllabusChunk" DROP CONSTRAINT "SyllabusChunk_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SyllabusChunk_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SyllabusChunk_id_seq";

-- AlterTable
ALTER TABLE "public"."user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

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
