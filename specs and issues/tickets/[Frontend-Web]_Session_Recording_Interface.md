# [Frontend-Web] Session Recording Interface

## Overview
Implement the session recording interface allowing therapists to record therapy sessions, view real-time transcription, and generate AI-powered clinical notes.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web Implementation - Session Recording Section)

The recording interface is a critical feature that enables the AI Scribe Agent to automate clinical documentation.

## Recording Interface

```wireframe
┌────────────────────────────────────────────────────────────┐
│  Session Recording                                  [Close] │
│                                                             │
│  Patient: Rahul Sharma                                     │
│  Session Type: Individual Therapy                          │
│  Duration: 00:45:23                                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                    🎙️                               │  │
│  │                                                      │  │
│  │                 Recording...                         │  │
│  │                                                      │  │
│  │              [⏸️ Pause]  [⏹️ Stop]                   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Live Transcript (Beta)                        [Hide/Show] │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Therapist: How have you been feeling this week?     │  │
│  │                                                      │  │
│  │ Patient: I've been feeling quite anxious about      │  │
│  │ the upcoming exams...                               │  │
│  │                                                      │  │
│  │ Therapist: Let's explore that anxiety. Can you      │  │
│  │ describe what specifically worries you?             │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Quick Notes                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Add any important observations during the session... │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Post-Recording Review

```wireframe
┌────────────────────────────────────────────────────────────┐
│  Session Completed                                          │
│                                                             │
│  ✅ Recording saved successfully                            │
│  Duration: 45 minutes 23 seconds                           │
│                                                             │
│  What would you like to do next?                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🤖 Generate AI Clinical Note                        │  │
│  │  Let AI create a structured SOAP note from the       │  │
│  │  session transcript                                  │  │
│  │                                    [Generate Note]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📝 Write Manual Note                                │  │
│  │  Create a clinical note manually                     │  │
│  │                                    [Write Note]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📄 View Transcript                                  │  │
│  │  Review the full session transcript                  │  │
│  │                                    [View]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                                    [Save & Close]           │
└────────────────────────────────────────────────────────────┘
```

## AI Note Generation Progress

```wireframe
┌────────────────────────────────────────────────────────────┐
│  Generating Clinical Note...                               │
│                                                             │
│  ✅ Transcription completed                                 │
│  ✅ Analyzing session content                               │
│  🔄 Generating SOAP note...                                 │
│  ⏳ Extracting key insights                                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ████████████████░░░░░░░░░░░░  60%                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  This usually takes 20-30 seconds...                       │
└────────────────────────────────────────────────────────────┘
```

## Technical Requirements

### 1. Audio Recording Setup
```typescript
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';

export default function RecordingInterface({ sessionId, patientId }) {
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    audioBlob
  } = useAudioRecorder();
  
  const handleStart = async () => {
    await startRecording();
    // Update session status to 'in_progress'
    await supabase
      .from('sessions')
      .update({ status: 'in_progress', started_at: new Date() })
      .eq('id', sessionId);
  };
  
  const handleStop = async () => {
    const blob = await stopRecording();
    await uploadRecording(blob, sessionId);
  };
  
  return (
    <div>
      <RecordingControls 
        isRecording={isRecording}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={pauseRecording}
        onResume={resumeRecording}
        onStop={handleStop}
      />
      <DurationDisplay duration={duration} />
    </div>
  );
}
```

### 2. Audio Recording Hook
```typescript
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      } 
    });
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    mediaRecorder.start(1000); // Collect data every second
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    
    // Start duration timer
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  };
  
  const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return;
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        resolve(blob);
      };
      
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
  };
  
  return {
    isRecording,
    isPaused,
    duration,
    startRecording,
    pauseRecording: () => {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
    },
    resumeRecording: () => {
      mediaRecorderRef.current?.resume();
      setIsPaused(false);
    },
    stopRecording
  };
}
```

### 3. Upload Recording to Supabase Storage
```typescript
async function uploadRecording(blob: Blob, sessionId: string) {
  const fileName = `${sessionId}_${Date.now()}.webm`;
  
  const { data, error } = await supabase.storage
    .from('session-recordings')
    .upload(fileName, blob, {
      contentType: 'audio/webm',
      cacheControl: '3600'
    });
  
  if (error) throw error;
  
  // Save recording metadata
  await supabase
    .from('session_recordings')
    .insert({
      session_id: sessionId,
      file_path: data.path,
      duration_seconds: duration,
      file_size_bytes: blob.size
    });
  
  return data.path;
}
```

### 4. Trigger AI Transcription
```typescript
async function triggerTranscription(sessionId: string) {
  const { data, error } = await supabase.functions.invoke('transcribe-session', {
    body: { sessionId }
  });
  
  if (error) throw error;
  return data;
}
```

### 5. Live Transcript Display (Optional)
Implement real-time transcription using Web Speech API:
```typescript
function useLiveTranscript() {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  
  useEffect(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      
      setTranscript(prev => [...prev, {
        text,
        timestamp: Date.now(),
        isFinal: result.isFinal
      }]);
    };
    
    recognition.start();
    
    return () => recognition.stop();
  }, []);
  
  return transcript;
}
```

### 6. Post-Recording Actions
```typescript
function PostRecordingActions({ sessionId }: { sessionId: string }) {
  const [generating, setGenerating] = useState(false);
  
  const generateNote = async () => {
    setGenerating(true);
    
    try {
      // Trigger transcription
      await supabase.functions.invoke('transcribe-session', {
        body: { sessionId }
      });
      
      // Poll for completion
      await pollTranscriptionStatus(sessionId);
      
      // Generate note
      await supabase.functions.invoke('generate-note', {
        body: { sessionId }
      });
      
      toast.success('Clinical note generated successfully');
      router.push(`/sessions/${sessionId}/note`);
    } catch (error) {
      toast.error('Failed to generate note');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div>
      <Button onClick={generateNote} disabled={generating}>
        {generating ? 'Generating...' : 'Generate AI Clinical Note'}
      </Button>
    </div>
  );
}
```

## Acceptance Criteria
- [ ] Recording interface implemented
- [ ] Audio recording working in all browsers
- [ ] Pause/resume functionality working
- [ ] Duration timer accurate
- [ ] Recording upload to Supabase Storage working
- [ ] Post-recording actions screen implemented
- [ ] AI note generation trigger working
- [ ] Progress indicator during generation
- [ ] Error handling for recording failures
- [ ] Microphone permission handling
- [ ] Audio quality settings configurable
- [ ] Quick notes feature working
- [ ] Live transcript display (optional)
- [ ] Responsive design on tablet
- [ ] Keyboard shortcuts (Space to pause/resume)

## Dependencies
- Requires: Dashboard Layout Implementation
- Requires: OpenAI Integration & Scribe Agent
- Requires: Database Schema Implementation

## Estimated Effort
10-12 hours