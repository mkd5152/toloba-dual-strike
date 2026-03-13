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
      // Close existing context if it exists and is not closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      // Initialize new Web Audio API context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else if (!soundEnabled && audioContextRef.current && audioContextRef.current.state !== 'closed') {
      // Close context when sound is disabled
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    return () => {
      // Cleanup on unmount: only close if it exists and is not already closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [soundEnabled]);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    // Only check if AudioContext exists (don't check soundEnabled state as it can be stale)
    if (!audioContextRef.current) {
      console.warn('⚠️ AudioContext not initialized');
      return;
    }

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
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // BAT CRACK - Sharp percussive hit
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.05);

    // CROWD ROAR - Excited response
    setTimeout(() => {
      const crowdBufferSize = ctx.sampleRate * 1.0;
      const crowdBuffer = ctx.createBuffer(1, crowdBufferSize, ctx.sampleRate);
      const crowdOutput = crowdBuffer.getChannelData(0);
      for (let i = 0; i < crowdBufferSize; i++) {
        crowdOutput[i] = (Math.random() * 2 - 1) * (1 - i / crowdBufferSize);
      }

      const crowd = ctx.createBufferSource();
      crowd.buffer = crowdBuffer;
      const crowdFilter = ctx.createBiquadFilter();
      crowdFilter.type = 'lowpass';
      crowdFilter.frequency.setValueAtTime(600, ctx.currentTime);
      crowdFilter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.5);
      const crowdGain = ctx.createGain();
      crowdGain.gain.setValueAtTime(0.3, ctx.currentTime);
      crowdGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.3);
      crowdGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      crowd.connect(crowdFilter);
      crowdFilter.connect(crowdGain);
      crowdGain.connect(ctx.destination);
      crowd.start(ctx.currentTime);
      crowd.stop(ctx.currentTime + 1.0);
    }, 40);
  };

  const playSix = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // MASSIVE BAT IMPACT - Huge crack
    const bufferSize = ctx.sampleRate * 0.08;
    const hitBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = hitBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const hit = ctx.createBufferSource();
    hit.buffer = hitBuffer;
    const hitFilter = ctx.createBiquadFilter();
    hitFilter.type = 'bandpass';
    hitFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    hitFilter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    const hitGain = ctx.createGain();
    hitGain.gain.setValueAtTime(1.0, ctx.currentTime);
    hitGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    hit.connect(hitFilter);
    hitFilter.connect(hitGain);
    hitGain.connect(ctx.destination);
    hit.start(ctx.currentTime);
    hit.stop(ctx.currentTime + 0.08);

    // STADIUM ERUPTION - Massive crowd roar
    setTimeout(() => {
      const stadiumBufferSize = ctx.sampleRate * 2.0;
      const stadiumBuffer = ctx.createBuffer(1, stadiumBufferSize, ctx.sampleRate);
      const stadiumOutput = stadiumBuffer.getChannelData(0);
      for (let i = 0; i < stadiumBufferSize; i++) {
        stadiumOutput[i] = (Math.random() * 2 - 1) * Math.min(1, i / (ctx.sampleRate * 0.3));
      }

      const stadium = ctx.createBufferSource();
      stadium.buffer = stadiumBuffer;
      const stadiumFilter = ctx.createBiquadFilter();
      stadiumFilter.type = 'lowpass';
      stadiumFilter.frequency.setValueAtTime(400, ctx.currentTime);
      stadiumFilter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.8);
      stadiumFilter.Q.setValueAtTime(0.5, ctx.currentTime);
      const stadiumGain = ctx.createGain();
      stadiumGain.gain.setValueAtTime(0.4, ctx.currentTime);
      stadiumGain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.5);
      stadiumGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      stadium.connect(stadiumFilter);
      stadiumFilter.connect(stadiumGain);
      stadiumGain.connect(ctx.destination);
      stadium.start(ctx.currentTime);
      stadium.stop(ctx.currentTime + 2.0);
    }, 50);

    // SUB-BASS THUMP - Feel it in your chest
    setTimeout(() => {
      const bass = ctx.createOscillator();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(50, ctx.currentTime);
      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.7, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + 0.4);
    }, 10);
  };

  const playWicket = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // STUMPS SHATTERING - Sharp wooden crack
    const stumpBufferSize = ctx.sampleRate * 0.15;
    const stumpBuffer = ctx.createBuffer(1, stumpBufferSize, ctx.sampleRate);
    const stumpOutput = stumpBuffer.getChannelData(0);
    for (let i = 0; i < stumpBufferSize; i++) {
      stumpOutput[i] = (Math.random() * 2 - 1) * (1 - i / stumpBufferSize) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const stumps = ctx.createBufferSource();
    stumps.buffer = stumpBuffer;
    const stumpsFilter = ctx.createBiquadFilter();
    stumpsFilter.type = 'bandpass';
    stumpsFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    stumpsFilter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    stumpsFilter.Q.setValueAtTime(3, ctx.currentTime);
    const stumpsGain = ctx.createGain();
    stumpsGain.gain.setValueAtTime(0.9, ctx.currentTime);
    stumpsGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    stumps.connect(stumpsFilter);
    stumpsFilter.connect(stumpsGain);
    stumpsGain.connect(ctx.destination);
    stumps.start(ctx.currentTime);
    stumps.stop(ctx.currentTime + 0.15);

    // CROWD GASP/ROAR - Explosive reaction
    setTimeout(() => {
      const crowdBufferSize = ctx.sampleRate * 1.5;
      const crowdBuffer = ctx.createBuffer(1, crowdBufferSize, ctx.sampleRate);
      const crowdOutput = crowdBuffer.getChannelData(0);
      for (let i = 0; i < crowdBufferSize; i++) {
        const envelope = Math.min(1, i / (ctx.sampleRate * 0.2));
        crowdOutput[i] = (Math.random() * 2 - 1) * envelope;
      }

      const crowd = ctx.createBufferSource();
      crowd.buffer = crowdBuffer;
      const crowdFilter = ctx.createBiquadFilter();
      crowdFilter.type = 'lowpass';
      crowdFilter.frequency.setValueAtTime(500, ctx.currentTime);
      crowdFilter.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.6);
      const crowdGain = ctx.createGain();
      crowdGain.gain.setValueAtTime(0.3, ctx.currentTime);
      crowdGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.4);
      crowdGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      crowd.connect(crowdFilter);
      crowdFilter.connect(crowdGain);
      crowdGain.connect(ctx.destination);
      crowd.start(ctx.currentTime);
      crowd.stop(ctx.currentTime + 1.5);
    }, 80);

    // LOW DRAMA TONE - Ominous undertone
    setTimeout(() => {
      const drama = ctx.createOscillator();
      drama.type = 'sine';
      drama.frequency.setValueAtTime(45, ctx.currentTime);
      const dramaGain = ctx.createGain();
      dramaGain.gain.setValueAtTime(0.5, ctx.currentTime);
      dramaGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      drama.connect(dramaGain);
      dramaGain.connect(ctx.destination);
      drama.start(ctx.currentTime);
      drama.stop(ctx.currentTime + 0.5);
    }, 100);
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
