
import z from "zod";

export const syllabusDataSchema = z.object({
  grade: z.string().min(1, "Grade is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  chunk: z.string().min(1, "Content/chunk is required"),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  fileData: z.any().optional(),
});