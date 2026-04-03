import { useState } from 'react';
import { Mic, Square, Pause, Play, Save, X } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { formatDuration } from '../utils/aiProcessor';

interface RecordingInterfaceProps {
  onSave: (transcript: string, duration: number) => void;
  onCancel: () => void;
}

export function RecordingInterface({ onSave, onCancel }: RecordingInterfaceProps) {
  const {
    isRecording,
    isPaused,
    duration,
    transcript,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useVoiceRecording();

  const [isStopped, setIsStopped] = useState(false);

  const handleStart = () => {
    startRecording();
  };

  const handlePause = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleStop = async () => {
    await stopRecording();
    setIsStopped(true);
  };

  const handleSave = () => {
    onSave(transcript, duration);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="soft-panel rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden fade-up">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-editorial text-4xl">Record Lecture</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-extrabold tracking-tight">{formatDuration(duration)}</div>
              <div className="text-blue-100 text-sm mt-1">
                {isRecording && !isPaused && (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Recording...
                  </span>
                )}
                {isPaused && <span>Paused</span>}
                {isStopped && <span>Stopped</span>}
                {!isRecording && !isStopped && <span>Ready to record</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isRecording && !isStopped && (
              <button
                onClick={handleStart}
                className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}

            {isRecording && (
              <>
                <button
                  onClick={handlePause}
                  className="w-16 h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </button>

                <button
                  onClick={handleStop}
                  className="w-20 h-20 bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <Square className="w-8 h-8" />
                </button>
              </>
            )}

            {isStopped && (
              <button
                onClick={handleSave}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                disabled={!transcript}
              >
                <Save className="w-8 h-8" />
              </button>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Live Transcription
            </h3>
            <div className="text-slate-600 text-sm leading-relaxed">
              {transcript || 'Start speaking to see transcription...'}
            </div>
          </div>

          {isStopped && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Recording complete! Click the save button to process your lecture and generate AI-powered notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
