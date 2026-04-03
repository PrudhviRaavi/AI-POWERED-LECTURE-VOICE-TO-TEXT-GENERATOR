import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

interface NewLectureModalProps {
  onSubmit: (title: string, subject: string) => void;
  onCancel: () => void;
}

export function NewLectureModal({ onSubmit, onCancel }: NewLectureModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), subject.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="soft-panel rounded-3xl max-w-md w-full fade-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="font-editorial text-3xl text-slate-900">New Lecture</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
              Lecture Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Machine Learning"
              required
              autoFocus
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
              Subject (Optional)
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Computer Science, Mathematics"
                className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-xl transition-colors"
            >
              Start Recording
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
