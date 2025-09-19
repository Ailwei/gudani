import React, { useState } from "react";
import { Upload, Save, Download, FileText, Copy, Menu, X } from "lucide-react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
import SummaryList from "./GetSummary";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface UserSelection {
  grade: string;
  subject: string;
}

const NoteUploadTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pastedNotes, setPastedNotes] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryId, setSummaryId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFile(uploadedFile);
    setPastedNotes("");

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        text += pageText + "\n";
      }

      setExtractedText(text);
    };
    fileReader.readAsArrayBuffer(uploadedFile);
  };

  const generateSummary = async () => {
    const notesToSummarize = pastedNotes.trim() || extractedText.trim();
    if (!notesToSummarize) {
      alert("Please paste notes or upload a PDF first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to save summaries");
        return;
      }

      const res = await axios.post(
        "/api/noteSummary",
        {
          document: notesToSummarize,
          grade: selection.grade,
          subject: selection.subject,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSummary(
        typeof res.data.summary === "string"
          ? res.data.summary
          : res.data.summary?.choices?.[0]?.text || "No summary generated."
      );
      setTopic(res.data.topic || "Untitled");
      setSummaryId(null)
    } catch (err: any) {
      console.error("Error generating summary:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.error || "Error generating summary. Please try again.";
      setError(errorMessage);
      setSummary("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to save summaries");
        return;
      }

      const res = await axios.post(
        "/api/SaveSummary",
        {

          grade: selection.grade,
          subject: selection.subject,
          notes: pastedNotes.trim() || extractedText.trim(),
          summary,
          topic,
          summaryId
          
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

     if (res.status >= 200 && res.status < 300) {
      setSummaryId(res.data.summaryId || null);
        alert("Summary saved successfully");
        handleCloseSummary();
      }
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary");
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert("Summary copied to clipboard");
    } catch (err) {
      alert("Failed to copy");
    }
  };

  const handleExportSummary = () => {
    const doc = new jsPDF();
    doc.text(summary, 10, 10);
    doc.save(`${selection.subject}-summary.pdf`);
  };

  const handleCloseSummary = () => {
  setSummary("");
  setTopic("");
  setPastedNotes("");
  setExtractedText("");
  setFile(null);
  setError("");
  setIsGenerating(false);
  setSummaryId(null);
  }

  return (
    <div className="flex h-screen gap-2">
      <div className="hidden md:block w-64 border-r border-gray-200 overflow-y-auto">
        <SummaryList
          onSelectSummary={(summary) => {
            setSummary(summary.summary);
            setTopic(summary.topic);
            setSummaryId(summary.summaryId);
          }}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
            <div className="p-4 border-b flex justify-end">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <SummaryList
              onSelectSummary={(summary) => {
                setSummary(summary.summary);
                setTopic(summary.topic);
                setSummaryId(summary.summaryId);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Note/PDF
              </h2>
              <p className="text-gray-600">
                {selection.grade} • {selection.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Tools
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-1" /> Paste Notes Manually
            </label>
            <textarea
              rows={6}
              value={pastedNotes}
              onChange={(e) => {
                setPastedNotes(e.target.value);
                setFile(null);
              }}
              className="w-full border rounded-lg p-3 text-sm text-gray-900"
              placeholder="Paste your notes here..."
            />
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <label className="flex items-center cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
              <Upload className="w-4 h-4 mr-1" />
              <span>{file ? `File uploaded: ${file.name}` : "Choose PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <button
            onClick={generateSummary}
            disabled={isGenerating || (!file && !pastedNotes.trim())}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating Summary..." : "Generate Grade-Level Summary"}
          </button>

          {summary && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Summary
                </h3>
                <div className="flex space-x-2">
                  <button
                    className="flex items-center text-purple-600 hover:text-purple-700 text-sm"
                    onClick={handleCopySummary}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                  <button
                    className="flex items-center text-purple-600 hover:text-purple-700 text-sm"
                    onClick={handleSaveSummary}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    className="flex items-center text-purple-600 hover:text-purple-700 text-sm"
                    onClick={handleExportSummary}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                    <button
          onClick={handleCloseSummary}
          className="text-gray-600 hover:text-gray-800 p-1 rounded-md"
          title="Close summary"
        >
          <X className="w-6 h-6" />
        </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteUploadTool;
