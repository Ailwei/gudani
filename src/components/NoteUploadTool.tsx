import React, { useState } from 'react';
import { Upload, Save, Download } from 'lucide-react';

interface UserSelection {
  grade: string;
  subject: string;
}
const NoteUploadTool: React.FC<{
  selection: UserSelection;
  onBack: () => void;
}> = ({ selection, onBack }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSummary(`Here's your ${selection.grade} level summary for ${selection.subject}:\n\nKey concepts simplified for your grade level with focus on exam-relevant points...`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Note Upload + Summary</h2>
          <button onClick={onBack} className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Tools
          </button>
        </div>
        <p className="text-gray-600">{selection.grade} • {selection.subject}</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your notes or upload a file
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here..."
            className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-normal placeholder-gray-400"
          />
          <div className="mt-2">
            <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
              <Upload className="w-4 h-4 mr-1" />
              Or upload a file
            </button>
          </div>
        </div>

        <button
          onClick={generateSummary}
          disabled={!notes.trim() || isGenerating}
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