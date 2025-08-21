import React, { useState } from 'react';
import { Upload, Save, Download, FileText } from 'lucide-react';
import axios from 'axios';
import * as pdfjsLib from "pdfjs-dist";

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
  const [pastedNotes, setPastedNotes] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setFile(uploadedFile);
    setPastedNotes("");

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
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
    try {
      const prompt = `Summarize these notes for ${selection.grade} level in ${selection.subject}:`;
      const res = await axios.post('/api/noteSummary', {
        document: notesToSummarize,
        prompt,
      });

      setSummary(
        typeof res.data.summary === "string"
          ? res.data.summary
          : res.data.summary?.choices?.[0]?.text || "No summary generated."
      );
    } catch (err) {
      setSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Note Upload + Summary</h2>
          <p className="text-gray-600">{selection.grade} • {selection.subject}</p>
        </div>
        <button onClick={onBack} className="text-purple-600 hover:text-purple-700 font-medium">
          ← Back to Tools
        </button>
      </div>
      <div className="p-6 space-y-6">
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
            className="w-full border rounded-lg p-3 text-sm"
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
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <button
          onClick={generateSummary}
          disabled={isGenerating || (!file && !pastedNotes.trim())}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating Summary...' : 'Generate Grade-Level Summary'}
        </button>
        {summary && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
              <div className="flex space-x-2">
                <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button className="flex items-center text-purple-600 hover:text-purple-700 text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteUploadTool;
