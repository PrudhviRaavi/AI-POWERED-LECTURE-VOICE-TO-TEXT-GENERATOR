import { useState, useEffect } from 'react';
import { Mic, Plus, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import type { Lecture, Note } from './lib/supabase';
import { LectureList } from './components/LectureList';
import { NoteEditor } from './components/NoteEditor';
import { RecordingInterface } from './components/RecordingInterface';
import { NewLectureModal } from './components/NewLectureModal';
import { generateAISummary, extractKeyPoints, generateTags } from './utils/aiProcessor';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: Note }>({});
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [showNewLectureModal, setShowNewLectureModal] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [currentLectureData, setCurrentLectureData] = useState<{ title: string; subject: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Use a fixed demo user ID for now
  const demoUserId = 'demo-user-123';

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    // Load from local storage instead of Supabase
    const stored = localStorage.getItem('lectures');
    const lecturesData = stored ? JSON.parse(stored) : [];
    setLectures(lecturesData);

    const notesMap: { [key: string]: Note } = {};
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      const notesData = JSON.parse(storedNotes);
      notesData.forEach((note: Note) => {
        notesMap[note.lecture_id] = note;
      });
    }
    setNotes(notesMap);
  };

  const handleNewLecture = (title: string, subject: string) => {
    setCurrentLectureData({ title, subject });
    setShowNewLectureModal(false);
    setShowRecording(true);
  };

  const handleSaveRecording = async (transcript: string, duration: number) => {
    if (!currentLectureData) return;

    setShowRecording(false);
    setLoading(true);

    try {
      console.log('Starting lecture save process...');
      
      // Generate AI content
      const aiSummary = await generateAISummary(transcript);
      const keyPoints = await extractKeyPoints(transcript);
      const tags = await generateTags(transcript, currentLectureData.subject);

      // Create lecture object
      const newLecture: Lecture = {
        id: crypto.randomUUID(),
        user_id: demoUserId,
        title: currentLectureData.title,
        subject: currentLectureData.subject,
        duration,
        audio_url: null,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create note object
      const newNote: Note = {
        id: crypto.randomUUID(),
        lecture_id: newLecture.id,
        user_id: demoUserId,
        transcription: transcript,
        ai_summary: aiSummary,
        key_points: keyPoints,
        content: `${aiSummary}\n\nKey Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to local storage
      const existingLectures = JSON.parse(localStorage.getItem('lectures') || '[]');
      existingLectures.unshift(newLecture);
      localStorage.setItem('lectures', JSON.stringify(existingLectures));

      const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      existingNotes.push(newNote);
      localStorage.setItem('notes', JSON.stringify(existingNotes));

      console.log('Lecture saved to local storage!');
      
      // Update state
      setLectures(existingLectures);
      setNotes((prev) => ({ ...prev, [newLecture.id]: newNote }));
      setSelectedLecture(newLecture);
      alert('Lecture saved successfully!');
    } catch (error: any) {
      console.error('Error saving lecture:', error);
      alert(`Failed to save lecture: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
      setCurrentLectureData(null);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    // Delete from local storage
    const existingLectures = JSON.parse(localStorage.getItem('lectures') || '[]');
    const filtered = existingLectures.filter((l: Lecture) => l.id !== id);
    localStorage.setItem('lectures', JSON.stringify(filtered));

    const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const filteredNotes = existingNotes.filter((n: Note) => n.lecture_id !== id);
    localStorage.setItem('notes', JSON.stringify(filteredNotes));

    if (selectedLecture?.id === id) {
      setSelectedLecture(null);
    }

    await loadLectures();
  };

  const handleUpdateNote = async (content: string) => {
    if (!selectedLecture) return;

    const note = notes[selectedLecture.id];
    if (!note) return;

    // Update in local storage
    const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    const updatedNotes = existingNotes.map((n: Note) =>
      n.id === note.id ? { ...n, content, updated_at: new Date().toISOString() } : n
    );
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    setNotes({
      ...notes,
      [selectedLecture.id]: { ...note, content },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Voice-to-Notes</h1>
              <p className="text-sm text-gray-600">AI-Powered Smart Notetaker</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewLectureModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Lecture
            </button>

            <button
              onClick={signOut}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-96 border-r border-gray-200 overflow-hidden">
          <LectureList
            lectures={lectures}
            onSelectLecture={setSelectedLecture}
            onDeleteLecture={handleDeleteLecture}
            selectedLectureId={selectedLecture?.id}
          />
        </aside>

        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Processing your lecture...</p>
                <p className="text-gray-500 text-sm mt-2">Generating AI summary and key points</p>
              </div>
            </div>
          ) : selectedLecture && notes[selectedLecture.id] ? (
            <NoteEditor
              lecture={selectedLecture}
              note={notes[selectedLecture.id]}
              onUpdateNote={handleUpdateNote}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome to Voice-to-Notes
                </h2>
                <p className="text-gray-600 mb-6">
                  Record your lectures and get instant AI-powered transcriptions, summaries, and key points.
                  Click "New Lecture" to get started!
                </p>
                <button
                  onClick={() => setShowNewLectureModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors mx-auto shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Lecture
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showNewLectureModal && (
        <NewLectureModal
          onSubmit={handleNewLecture}
          onCancel={() => setShowNewLectureModal(false)}
        />
      )}

      {showRecording && (
        <RecordingInterface
          onSave={handleSaveRecording}
          onCancel={() => {
            setShowRecording(false);
            setCurrentLectureData(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
