"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Pause, Play } from "lucide-react";

interface ChatAudioPlayerProps {
  src: string;
  playLabel: string;
  pauseLabel: string;
}

export default function ChatAudioPlayer({
  src,
  playLabel,
  pauseLabel,
}: ChatAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const waveform = useMemo(() => {
    let seed = 0;
    for (let index = 0; index < src.length; index += 1) {
      seed = (seed * 31 + src.charCodeAt(index)) >>> 0;
    }

    return Array.from({ length: 42 }, () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return 0.2 + (seed / 0xffffffff) * 0.8;
    });
  }, [src]);

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = Math.max(0, Math.min(duration, time));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleWaveformClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = (event.clientX - bounds.left) / bounds.width;
    seekTo(progress * duration);
  };

  const handleWaveformKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      seekTo(currentTime - 3);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      seekTo(currentTime + 3);
    } else if (event.key === "Home") {
      event.preventDefault();
      seekTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      seekTo(duration);
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="flex h-11 w-[min(280px,65vw)] items-center gap-2 rounded-full px-1">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={togglePlayback}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primaryHover cursor-pointer"
        aria-label={isPlaying ? pauseLabel : playLabel}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ltr:ml-0.5 rtl:mr-0.5" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div
          role="slider"
          tabIndex={0}
          aria-label={playLabel}
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={formatTime(currentTime)}
          onClick={handleWaveformClick}
          onKeyDown={handleWaveformKeyDown}
          className="flex h-7 w-full cursor-pointer items-center justify-between gap-px rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {waveform.map((height, index) => (
            <span
              key={index}
              className={`w-[2px] shrink-0 rounded-full transition-colors ${
                (index + 1) / waveform.length <= progress
                  ? "bg-primary"
                  : "bg-textSecondary/45"
              }`}
              style={{ height: `${Math.max(15, height * 100)}%` }}
            />
          ))}
        </div>
        <span className="text-[10px] leading-none text-textSecondary">
          {formatTime(currentTime || duration)}
        </span>
      </div>
    </div>
  );
}
