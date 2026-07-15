import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/floors", label: "Floors" },
  { to: "/story", label: "Story" },
  { to: "/amenities", label: "Amenities" },
  { to: "/about", label: "About" },
] as const;

const chapterMap: Record<string, string> = {
  "/": "Tatvarth Heights",
  "/floors": "Tatvarth Heights",
  "/story": "Tatvarth Heights",
  "/amenities": "Tatvarth Heights",
  "/about": "Tatvarth Heights",
};

function HostCursor({ isHoveringNav }: { isHoveringNav: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(${isHoveringNav ? 0.7 : 0.6})`;
      }
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHoveringNav, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 pointer-events-none z-[9999999]"
      style={{ 
        opacity: isHoveringNav ? 1 : 0,
        transition: 'opacity 0.2s, transform 0.1s ease-out'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="34" viewBox="0 0 50 54" fill="none">
        <path d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z" fill="black"/>
        <path d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z" stroke="white" strokeWidth="2.25"/>
      </svg>
    </div>
  );
}

export function PageFrame({ src, title }: { src: string; title: string }) {
  const location = useLocation();
  const chapter = chapterMap[location.pathname] || "01";
  const [isHoveringNav, setIsHoveringNav] = useState(false);

  // Check if prefers-reduced-motion is active
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="fixed inset-0 bg-[#faf9f6] cursor-none">
      <HostCursor isHoveringNav={isHoveringNav} />
      
      {/* Iframe container */}
      <motion.div
        initial={prefersReduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReduced ? 0 : 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        <iframe
          src={src}
          title={title}
          className="w-full h-full border-0"
        />
      </motion.div>

      {/* Floating nav pill styled to match design system */}
      <nav 
        id="main-nav-pill" 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1 rounded-full border border-[#1a1c1a]/10 bg-[#faf9f6]/85 px-2 py-1.5 backdrop-blur-md shadow-sm transition-all duration-500 ease-out transform cursor-none"
        onMouseEnter={() => setIsHoveringNav(true)}
        onMouseLeave={() => setIsHoveringNav(false)}
      >
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="px-4 py-2 text-[11px] uppercase tracking-wider font-medium text-[#1a1c1a]/60 rounded-full hover:bg-[#1a1c1a]/5 hover:text-[#1a1c1a] transition-all cursor-none"
            activeProps={{ className: "px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-[#1a1c1a] text-[#faf9f6] cursor-none" }}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Curtain Transition Overlay */}
      {!prefersReduced && (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ y: "-100%" }}
            animate={{ y: ["-100%", "0%", "0%", "-100%"] }}
            transition={{
              duration: 1.4,
              times: [0, 0.45, 0.55, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed inset-0 bg-[#1a1c1a] z-[9999] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.4,
                times: [0.1, 0.45, 0.55, 0.9],
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`text-[#faf9f6] ${chapter.length > 2 ? 'text-[8vw] md:text-[5vw] px-4' : 'text-[40vw]'} font-light leading-none select-none text-center`}
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {chapter}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
