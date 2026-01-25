import { useState, useEffect } from 'react';
import { Save, Download, FileText, FileDown, Printer, Lightbulb, BookOpen, Tag } from 'lucide-react';
import type { Lecture, Note } from '../lib/supabase';
import { exportAsText, exportAsMarkdown, exportAsPDF } from '../utils/exportUtils';

interface NoteEditorProps {
  lecture: Lecture;
  note: Note;
  onUpdateNote: (content: string) => void;
}

export function NoteEditor({ lecture, note, onUpdateNote }: NoteEditorProps) {
  const [content, setContent] = useState(note.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcription' | 'summary' | 'keypoints' | 'notes'>('notes');

  useEffect(() => {
    setContent(note.content);
    setHasChanges(false);
  }, [note.id, note.content]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateNote(content);
    setHasChanges(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lecture.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {lecture.subject && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{lecture.subject}</span>
                </div>
              )}
              <span>{new Date(lecture.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}

            <div className="relative group">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportAsText(lecture, note)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Export as TXT
                </button>
                <button
                  onClick={() => exportAsMarkdown(lecture, note)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FileDown className="w-4 h-4" />
                  Export as Markdown
                </button>
                <button
                  onClick={() => exportAsPDF(lecture, note)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {note.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Notes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('transcription')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'transcription'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcription
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Summary
            </div>
          </button>
          <button
            onClick={() => setActiveTab('keypoints')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'keypoints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Key Points
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'notes' && (
          <div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Take your notes here... You can expand on the AI-generated summary and key points."
              className="w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'transcription' && (
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.transcription || 'No transcription available.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="prose max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.ai_summary || 'No summary available.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'keypoints' && (
          <div className="space-y-4">
            {note.key_points.length > 0 ? (
              note.key_points.map((point, index) => (
                <div key={index} className="flex gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-700 leading-relaxed">{point}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No key points extracted.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
