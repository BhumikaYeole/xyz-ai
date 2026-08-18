'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechCode } from '@/lib/languages';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'unsupported';

interface UseVoiceOptions {
  language: string;
  onTranscript: (text: string) => void;
}

// Clean markdown syntax for natural voice reading
function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_#~]/g, '') // bold/italic/header symbols
    .replace(/^[*-]\s+/gm, '') // list bullets
    .replace(/^\d+\.\s+/gm, '') // numbered lists
    .replace(/[:;][\-~]?[)(DPdp]/g, '') // ascii emojis
    .replace(/\s+/g, ' ')
    .trim();
}

export function useVoice({ language, onTranscript }: UseVoiceOptions) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Initialize available voices and speech recognition capabilities on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSupported(hasRecognition);

    const updateVoices = () => {
      if (window.speechSynthesis) {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      }
    };

    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setStatus('unsupported');
      setErrorMsg('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      // Cancel any ongoing speaking before listening
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognitionAPI();
      const speechLang = getSpeechCode(language);
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus('listening');
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setStatus('processing');
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        isListeningRef.current = false;
        if (event.error === 'not-allowed') {
          setStatus('error');
          setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setStatus('idle');
        } else {
          setStatus('error');
          setErrorMsg(`Microphone note: ${event.error}. You can also type your message.`);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg('Could not initialize microphone. Please check browser permissions.');
    }
  }, [language, onTranscript]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setStatus('idle');
  }, []);

  const speak = useCallback((text: string, onStart?: () => void, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleanText = sanitizeTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLangCode = getSpeechCode(language);
    utterance.lang = targetLangCode;
    utterance.rate = 0.96; // Human-like conversational pace
    utterance.pitch = 1.02; // Warm tone

    // Match best voice for current language
    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (currentVoices.length > 0) {
      const primaryPrefix = language.toLowerCase();
      const exactMatch = currentVoices.find((v) => v.lang.toLowerCase() === targetLangCode.toLowerCase());
      const prefixMatch = currentVoices.find((v) => v.lang.toLowerCase().startsWith(primaryPrefix));
      const naturalVoice = currentVoices.find((v) => v.lang.toLowerCase().startsWith(primaryPrefix) && v.name.toLowerCase().includes('natural'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      } else if (exactMatch) {
        utterance.voice = exactMatch;
      } else if (prefixMatch) {
        utterance.voice = prefixMatch;
      }
    }

    utterance.onstart = () => {
      setStatus('speaking');
      onStart?.();
    };

    utterance.onend = () => {
      setStatus('idle');
      onEnd?.();
    };

    utterance.onerror = () => {
      setStatus('idle');
    };

    setStatus('speaking');
    window.speechSynthesis.speak(utterance);
  }, [language, voices]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
  }, []);

  const clearError = useCallback(() => {
    setErrorMsg('');
    setStatus('idle');
  }, []);

  return {
    status,
    errorMsg,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError,
  };
}
