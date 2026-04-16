"use client";

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export default function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn z-10">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="text-white/40 text-sm tracking-widest uppercase">Paused</div>
        <div className="flex flex-col gap-3 w-48">
          <button
            onClick={onResume}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all"
          >
            Resume
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all"
          >
            Quit to Menu
          </button>
        </div>
        <div className="text-white/20 text-xs">Press Esc to resume</div>
      </div>
    </div>
  );
}
