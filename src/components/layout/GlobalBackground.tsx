export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#F8FAFC]">
      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Floating Cinematic Light Meshes */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.45] blur-[130px]">
        {/* Orb 1: Brand Blue */}
        <div className="global-orb global-orb-one absolute -top-[10%] left-[10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-blue-400/25 to-blue-600/5" />

        {/* Orb 2: Royal Indigo */}
        <div className="global-orb global-orb-two absolute top-[35%] -right-[5%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-purple-400/5" />

        {/* Orb 3: Soft Sapphire */}
        <div className="global-orb global-orb-three absolute -bottom-[10%] left-[20%] h-[650px] w-[650px] rounded-full bg-gradient-to-br from-blue-300/15 via-indigo-200/10 to-transparent" />
      </div>
      
      {/* Light vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/50 via-transparent to-[#F8FAFC]/80 pointer-events-none" />
    </div>
  );
}
