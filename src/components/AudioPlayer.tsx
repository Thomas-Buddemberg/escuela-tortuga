"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Track = { name: string; url: string };

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hidden, setHidden] = useState<boolean>(false);

  const currentTrack = useMemo(() => tracks[currentIndex], [tracks, currentIndex]);

  // Restore "hidden" from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem("audio:hidden");
      if (v === "1") setHidden(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("audio:hidden", hidden ? "1" : "0");
    } catch {}
  }, [hidden]);

  // Set source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack) {
      audio.src = currentTrack.url;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      // Autoplay if already in "playing" state
      if (isPlaying) {
        void audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      audio.removeAttribute("src");
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentTrack?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bind audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // stop at end (no auto-next unless you want it)
      audio.currentTime = 0;
      audio.pause();
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Clean up object URLs when replacing playlist or unmounting
  useEffect(() => {
    return () => {
      tracks.forEach(t => URL.revokeObjectURL(t.url));
    };
  }, [tracks]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) return;
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(e.target.value);
    audio.currentTime = Number.isFinite(next) ? next : 0;
  };

  const SEEK_STEP = 30; // seconds

  const handleBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - SEEK_STEP);
  };

  const handleForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const end = Number.isFinite(audio.duration) ? audio.duration : audio.currentTime + SEEK_STEP;
    audio.currentTime = Math.min(end, audio.currentTime + SEEK_STEP);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Revoke existing URLs
    tracks.forEach(t => URL.revokeObjectURL(t.url));

    const newTracks: Track[] = Array.from(files).map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));

    setTracks(newTracks);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  if (hidden) {
    return (
      <>
        <button
          aria-label="Show audio player"
          onClick={() => setHidden(false)}
          className="fixed bottom-3 right-3 z-50 rounded-full bg-blue-600 text-white shadow-lg px-4 py-3 active:scale-95"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)" }}
        >
          Player
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        <audio ref={audioRef} preload="metadata" />
      </>
    );
  }

  return (
    <>
      <footer
        className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-neutral-900 text-white shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="region"
        aria-label="Audio player"
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <button
            onClick={() => setHidden(true)}
            aria-label="Hide audio player"
            className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700"
          >
            Hide
          </button>

          <button
            onClick={openFilePicker}
            aria-label="Select audio files"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-500 active:scale-95"
          >
            Choose files
          </button>

          <button
            onClick={handleBack}
            aria-label="Seek backward 30 seconds"
            className="rounded-md bg-neutral-800 px-3 py-2 hover:bg-neutral-700 active:scale-95"
            disabled={!currentTrack}
          >
            -30s
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="rounded-md bg-green-600 px-3 py-2 font-medium hover:bg-green-500 active:scale-95 disabled:opacity-60"
            disabled={!currentTrack}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleForward}
            aria-label="Seek forward 30 seconds"
            className="rounded-md bg-neutral-800 px-3 py-2 hover:bg-neutral-700 active:scale-95"
            disabled={!currentTrack}
          >
            +30s
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <input
              type="range"
              min={0}
              max={Number.isFinite(duration) && duration > 0 ? duration : 0}
              step={0.01}
              value={Number.isFinite(currentTime) ? currentTime : 0}
              onChange={handleSeek}
              aria-label="Seek position"
              className="w-full"
              disabled={!currentTrack || !Number.isFinite(duration) || duration <= 0}
            />
          </div>

          <div className="text-xs tabular-nums min-w-[120px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="truncate max-w-[28ch] text-xs text-neutral-300">
            {currentTrack ? currentTrack.name : "No file selected"}
          </div>
        </div>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />
      <audio ref={audioRef} preload="metadata" />
    </>
  );
}