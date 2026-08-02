/**
 * Audio Synthesizer and Web Speech API helper for LingoQuest
 */

// Web Speech API Text-to-Speech (Pronunciation)
export function speakText(text: string, lang: "fr" | "en", slow: boolean = false): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "fr" ? "fr-FR" : "en-US";
  utterance.rate = slow ? 0.65 : 0.95; // 0.65 for slow turtle mode
  utterance.pitch = 1.05; // Slightly lively tone like Duolingo

  // Select appropriate voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(lang === "fr" ? "fr" : "en") &&
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Thomas") || v.name.includes("Samantha"))
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Web Audio API Sound Effects (Duolingo-style chimes)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: "correct" | "wrong" | "complete" | "pop" | "levelUp" | "heart"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === "correct") {
    // Bright happy ascending chime: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.26);
    });
  } else if (type === "wrong") {
    // Low descending tone: E3 (164.81), C#3 (138.59)
    const notes = [164.81, 138.59];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.32);
    });
  } else if (type === "complete" || type === "levelUp") {
    // Fanfare arpeggio: C5 - E5 - G5 - C6 - E6
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);

      gain.gain.setValueAtTime(0, now + idx * 0.11);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.46);
    });
  } else if (type === "pop") {
    // Quick crisp pop for button click / tile tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } else if (type === "heart") {
    // Soft harp-like chime when heart refill
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.36);
    });
  }
}
