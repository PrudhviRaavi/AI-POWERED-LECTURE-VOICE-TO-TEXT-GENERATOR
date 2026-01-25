import { useState, useEffect } from 'react';
import { Mic, Plus, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import type { Lecture, Note } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
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

  useEffect(() => {
    if (user) {
      loadLectures();
    }
  }, [user]);

  const loadLectures = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading lectures:', error);
      return;
    }

    setLectures(data || []);

    const notePromises = (data || []).map(async (lecture) => {
      const { data: noteData } = await supabase
        .from('notes')
        .select('*')
        .eq('lecture_id', lecture.id)
        .maybeSingle();

      return { lectureId: lecture.id, note: noteData };
    });

    const notesData = await Promise.all(notePromises);
    const notesMap: { [key: string]: Note } = {};
    notesData.forEach(({ lectureId, note }) => {
      if (note) {
        notesMap[lectureId] = note;
      }
    });

    setNotes(notesMap);
  };

  const handleNewLecture = (title: string, subject: string) => {
    setCurrentLectureData({ title, subject });
    setShowNewLectureModal(false);
    setShowRecording(true);
  };

  const handleSaveRecording = async (transcript: string, duration: number) => {
    if (!user || !currentLectureData) return;

    setShowRecording(false);
    setLoading(true);

    try {
      const { data: lectureData, error: lectureError } = await supabase
        .from('lectures')
        .insert({
          user_id: user.id,
          title: currentLectureData.title,
          subject: currentLectureData.subject,
          duration,
          status: 'processing',
        })
        .select()
        .single();

      if (lectureError) throw lectureError;

      const aiSummary = await generateAISummary(transcript);
      const keyPoints = await extractKeyPoints(transcript);
      const tags = await generateTags(transcript, currentLectureData.subject);

      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          lecture_id: lectureData.id,
          user_id: user.id,
          transcription: transcript,
          ai_summary: aiSummary,
          key_points: keyPoints,
          content: `${aiSummary}\n\nKey Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
          tags,
        })
        .select()
        .single();

      if (noteError) throw noteError;

      await supabase
        .from('lectures')
        .update({ status: 'completed' })
        .eq('id', lectureData.id);

      await loadLectures();
      setSelectedLecture({ ...lectureData, status: 'completed' });
    } catch (error) {
      console.error('Error saving lecture:', error);
      alert('Failed to save lecture. Please try again.');
    } finally {
      setLoading(false);
      setCurrentLectureData(null);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('lectures').delete().eq('id', id);

    if (error) {
      console.error('Error deleting lecture:', error);
      alert('Failed to delete lecture.');
      return;
    }

    if (selectedLecture?.id === id) {
      setSelectedLecture(null);
    }

    await loadLectures();
  };

  const handleUpdateNote = async (content: string) => {
    if (!selectedLecture) return;

    const note = notes[selectedLecture.id];
    if (!note) return;

    const { error } = await supabase
      .from('notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', note.id);

    if (error) {
      console.error('Error updating note:', error);
      alert('Failed to save note.');
      return;
    }

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

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
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
