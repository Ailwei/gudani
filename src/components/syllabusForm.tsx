import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import GradeSubjectSelector from "./GradeSubjectSelector";

interface UserSelection {
  grade: string;
  subject: string;
}
interface SyllabusFormProps {
  onSubmit?: (data: any) => void;
}

const SyllabusForm: React.FC<SyllabusFormProps> = ({onSubmit}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selection, setSelection] = useState<UserSelection>({ grade: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chunkText = (text: string, size = 800) => {
    const words = text.split(" ");
    const chunks: string[] = [];
    let current: string[] = [];
    let currentLength = 0;

    for (const word of words) {
      current.push(word);
      currentLength += word.length + 1;
      if (currentLength >= size) {
        chunks.push(current.join(" "));
        current = [];
        currentLength = 0;
      }
    }
    if (current.length > 0) chunks.push(current.join(" "));
    return chunks;
  };
  const extractPdfText = async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            text += strings.join(" ") + "\n";
          }
          resolve(text);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  const preprocessPdfText = (text: string) => {
    let processed = text.replace(/●/g, "\n");
    processed = processed.replace(/(\d+)\.\s*/g, "\n$1. ");
    processed = processed
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n");
    return processed;
  };
  const extractTopicsAndChunks = (text: string) => {
    const lines = text.split("\n");
    const topics: { topic: string; chunks: string[] }[] = [];
    let currentTopic: { topic: string; chunks: string[] } | null = null;

    for (const line of lines) {
      if (/^\d+\.\s/.test(line)) {
        if (currentTopic) topics.push(currentTopic);
        currentTopic = { topic: line.replace(/^\d+\.\s*/, ""), chunks: [] };
      } else if (currentTopic) {
        currentTopic.chunks.push(line);
      }
    }

    if (currentTopic) topics.push(currentTopic);
    return topics;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError("Please upload a PDF file.");
    if (!selection.grade || !selection.subject) return setError("Please select grade and subject.");

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const pdfText = await extractPdfText(file);

      const preprocessedText = preprocessPdfText(pdfText);

      const topics = extractTopicsAndChunks(preprocessedText);

      if (topics.length === 0) {
        setError("No topics detected in PDF.");
        return;
      }
const payload = topics.map(t => ({
        topic: t.topic,
        chunks: t.chunks.filter(c => c.trim()).map(c => c.trim()),
}));

      const res = await axios.post("/api/syllabusPDFupload", {
        grade: selection.grade,
        subject: selection.subject,
        payload,
      });

      if (res.status === 200) {
        setSuccess(`Uploaded successfully! Saved ${payload.length} topics.`);
        setFile(null);
        setSelection({ grade: "", subject: "" });
      } else {
        setError("Failed to save syllabus data.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Error processing PDF.");
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = file && selection.grade && selection.subject;

  return (
    <form className="space-y-4 bg-white p-6 rounded-xl shadow border" onSubmit={handleSubmit}>
      <GradeSubjectSelector selection={selection} onSelectionChange={setSelection} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Syllabus PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          required
        />
      </div>

      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}

      <button
        type="submit"
        className={`w-full py-2 rounded-lg font-semibold transition-colors ${
          isFormComplete && !loading
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isFormComplete || loading}
      >
        {loading ? "Processing..." : "Upload & Auto Chunk"}
      </button>
    </form>
  );
};

export default SyllabusForm;
