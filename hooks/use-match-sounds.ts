"use client";

import { useEffect, useRef, useState } from "react";

interface MatchSoundsOptions {
  enabled: boolean;
}

export function useMatchSounds({ enabled }: MatchSoundsOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(enabled);

  useEffect(() => {
    if (typeof window !== 'undefined' && soundEnabled) {
      // Initialize Web Audio API
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, [soundEnabled]);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playFour = () => {
    // Boundary sound - rising tone
    playSound(523, 0.15, 'sine'); // C5
    setTimeout(() => playSound(659, 0.15, 'sine'), 80); // E5
    setTimeout(() => playSound(784, 0.2, 'sine'), 160); // G5
  };

  const playSix = () => {
    // Six sound - explosive rising sweep
    playSound(440, 0.1, 'square'); // A4
    setTimeout(() => playSound(554, 0.1, 'square'), 60); // C#5
    setTimeout(() => playSound(659, 0.1, 'square'), 120); // E5
    setTimeout(() => playSound(880, 0.3, 'sawtooth'), 180); // A5 - explosion
  };

  const playWicket = () => {
    // Wicket sound - stumps falling (descending)
    playSound(800, 0.08, 'square'); // High
    setTimeout(() => playSound(600, 0.08, 'square'), 60);
    setTimeout(() => playSound(400, 0.08, 'square'), 120);
    setTimeout(() => playSound(200, 0.15, 'square'), 180); // Low thud
  };

  const playVictory = () => {
    // Victory fanfare - triumphant ascending melody
    const notes = [262, 330, 392, 523]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      setTimeout(() => playSound(freq, 0.4, 'triangle'), idx * 150);
    });
    // Final chord
    setTimeout(() => {
      playSound(523, 0.8, 'sine'); // C5
      playSound(659, 0.8, 'sine'); // E5
      playSound(784, 0.8, 'sine'); // G5
    }, 600);
  };

  return {
    soundEnabled,
    setSoundEnabled,
    playFour,
    playSix,
    playWicket,
    playVictory,
  };
}
