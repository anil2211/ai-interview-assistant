import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  confidence: number;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!isSupported) return;

    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    recognitionRef.current = new SR();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + ' ' + finalTranscript);
      }
      setInterimTranscript(interimTranscript);
      setConfidence(maxConfidence);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [isSupported]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to start recording');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch {
        setError('Failed to stop recording');
      }
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    confidence,
  };
}
