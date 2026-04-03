import { useState, useEffect } from 'react';
import { Mic, Plus, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase, isSupabaseConfigured } from './lib/supabase';
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
    if (user && supabase) {
      loadLectures();
    }
  }, [user]);

  const loadLectures = async () => {
    if (!user || !supabase) return;

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
    if (!user || !currentLectureData || !supabase) return;

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
    if (!user || !supabase) return;

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
    if (!selectedLecture || !supabase) return;

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

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full soft-panel rounded-3xl p-7 md:p-10 fade-up">
          <p className="text-xs tracking-[0.22em] uppercase text-slate-500 mb-2">Configuration</p>
          <h1 className="font-editorial text-4xl text-slate-900 mb-3">Setup Required</h1>
          <p className="text-slate-700 mb-5">
            Supabase environment variables are missing, so the app cannot load data yet.
          </p>
          <p className="text-sm text-slate-600 mb-2">Create a file named <code>.env.local</code> in the project folder and add:</p>
          <pre className="bg-slate-900 text-slate-100 text-sm rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
          </pre>
          <p className="text-sm text-slate-600 mt-4">After saving, restart the dev/preview server.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="min-h-screen flex flex-col px-3 py-3 md:px-6 md:py-5 gap-3 fade-up">
      <header className="soft-panel rounded-2xl px-4 md:px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-700 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Voice-to-Notes</h1>
              <p className="text-sm text-slate-600">AI-Powered Smart Notetaker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewLectureModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Lecture
            </button>

            <button
              onClick={signOut}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden soft-panel rounded-2xl">
        <aside className="w-full md:w-96 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden">
          <LectureList
            lectures={lectures}
            onSelectLecture={setSelectedLecture}
            onDeleteLecture={handleDeleteLecture}
            selectedLectureId={selectedLecture?.id}
          />
        </aside>

        <main className="flex-1 overflow-hidden bg-white/40">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-700 font-semibold">Processing your lecture...</p>
                <p className="text-slate-500 text-sm mt-2">Generating AI summary and key points</p>
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
              <div className="text-center max-w-md soft-panel rounded-3xl p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-12 h-12 text-blue-700" />
                </div>
                <h2 className="font-editorial text-4xl text-slate-900 mb-3 leading-tight">
                  Welcome to Voice-to-Notes
                </h2>
                <p className="text-slate-600 mb-6">
                  Record your lectures and get instant AI-powered transcriptions, summaries, and key points.
                  Click "New Lecture" to get started!
                </p>
                <button
                  onClick={() => setShowNewLectureModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white rounded-xl flex items-center gap-2 transition-colors mx-auto shadow-lg"
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
