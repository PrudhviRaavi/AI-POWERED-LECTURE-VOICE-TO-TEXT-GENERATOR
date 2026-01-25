import { Clock, BookOpen, Calendar, Search, Filter, Trash2, FileText } from 'lucide-react';
import type { Lecture } from '../lib/supabase';
import { formatDuration } from '../utils/aiProcessor';
import { useState } from 'react';

interface LectureListProps {
  lectures: Lecture[];
  onSelectLecture: (lecture: Lecture) => void;
  onDeleteLecture: (id: string) => void;
  selectedLectureId?: string;
}

export function LectureList({ lectures, onSelectLecture, onDeleteLecture, selectedLectureId }: LectureListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  const subjects = ['all', ...new Set(lectures.map(l => l.subject).filter(Boolean))];

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || lecture.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const sortedLectures = [...filteredLectures].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm appearance-none bg-white"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedLectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">No lectures found</p>
            <p className="text-gray-400 text-sm">
              {searchQuery || filterSubject !== 'all'
                ? 'Try adjusting your filters'
                : 'Start recording to create your first lecture'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedLectures.map((lecture) => (
              <div
                key={lecture.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedLectureId === lecture.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
                onClick={() => onSelectLecture(lecture)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate mb-1">
                      {lecture.title}
                    </h3>

                    {lecture.subject && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="truncate">{lecture.subject}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(lecture.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(lecture.duration)}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          lecture.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : lecture.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {lecture.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this lecture?')) {
                        onDeleteLecture(lecture.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
