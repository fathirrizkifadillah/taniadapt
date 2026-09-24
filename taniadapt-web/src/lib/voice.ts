// Voice synthesis helper for TaniAdapt
// Uses Web Speech API (window.speechSynthesis) for zero-latency Indonesian narration

let cachedIndonesianVoice: SpeechSynthesisVoice | null = null;

if (typeof window !== 'undefined' && window.speechSynthesis) {
  const updateVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    cachedIndonesianVoice =
      voices.find((v) => v.lang === 'id-ID' || v.lang.startsWith('id')) ||
      voices.find((v) => v.lang.includes('ID')) ||
      null;
  };

  updateVoices();
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export function speakText(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.92; // Slightly slower for crisp clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const idVoice =
    cachedIndonesianVoice ||
    voices.find((v) => v.lang === 'id-ID' || v.lang.startsWith('id')) ||
    voices[0];

  if (idVoice) {
    utterance.voice = idVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
