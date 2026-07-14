export default function Topbar() {
  return (
    <header className="h-16 border-b border-[#1E1F35] bg-darkBg/30 backdrop-blur-md sticky top-0 z-40 px-8 flex justify-end items-center select-none">
      <div className="flex items-center gap-3">
        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C6CFF] to-[#A68CFF] text-white flex items-center justify-center text-xs font-bold shadow-glow border border-[#7C6CFF]/30 cursor-pointer hover:scale-105 transition-all">
          L
        </div>
      </div>
    </header>
  );
}
