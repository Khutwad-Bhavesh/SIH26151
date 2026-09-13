import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Terminal, Activity } from 'lucide-react'

// App States
const STATE = {
  HOME: 'HOME',
  START_VIDEO: 'START_VIDEO',
  DASHBOARD: 'DASHBOARD',
  END_VIDEO: 'END_VIDEO'
}

function App() {
  const [appState, setAppState] = useState(STATE.HOME)
  const startVideoRef = useRef(null)
  const endVideoRef = useRef(null)

  // Preload videos programmatically
  useEffect(() => {
    if (startVideoRef.current) startVideoRef.current.load()
    if (endVideoRef.current) endVideoRef.current.load()
  }, [])

  const handleEnterDashboard = () => {
    setAppState(STATE.START_VIDEO)
  }

  const handleQuitDashboard = () => {
    setAppState(STATE.END_VIDEO)
  }

  // Handle Video ends
  const onStartVideoEnd = () => {
    setAppState(STATE.DASHBOARD)
  }

  const onEndVideoEnd = () => {
    setAppState(STATE.HOME)
  }

  // Play videos explicitly when they mount in state
  useEffect(() => {
    if (appState === STATE.START_VIDEO && startVideoRef.current) {
      startVideoRef.current.play().catch(e => console.error("Play failed:", e))
    }
    if (appState === STATE.END_VIDEO && endVideoRef.current) {
      endVideoRef.current.play().catch(e => console.error("Play failed:", e))
    }
  }, [appState])

  return (
    <div className="w-full h-full relative overflow-hidden bg-black scanlines">
      
      {/* 
        ========================================================================
        IFRAME: ALWAYS MOUNTED (ADHD Architecture)
        We mount the heavy Cytoscape vanilla JS dashboard immediately in the background.
        We only toggle its opacity/pointer-events to avoid mounting jank during transition.
        ========================================================================
      */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          opacity: appState === STATE.DASHBOARD ? 1 : 0,
          pointerEvents: appState === STATE.DASHBOARD ? 'auto' : 'none'
        }}
      >
        {/* We assume FastAPI will serve the vanilla dashboard at /dashboard.html */}
        <iframe 
          src="/dashboard.html" 
          className="w-full h-full border-none" 
          title="A.T.L.A.S. Dashboard"
        />
        
        {/* React Shell Overlay Controls (Floating above Vanilla Iframe) */}
        {appState === STATE.DASHBOARD && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-2 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.3)]"
          >
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs uppercase tracking-widest">
              <Activity className="w-4 h-4 animate-pulse" />
              Live Feed
            </div>
            <div className="w-px h-4 bg-red-500/30 mx-2"></div>
            <button 
              onClick={handleQuitDashboard}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              Terminate Link
            </button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {/* 
          ========================================================================
          STATE: HOME
          ========================================================================
        */}
        {appState === STATE.HOME && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 bg-base flex items-center justify-center"
          >
            {/* Vengeance UI Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative z-20 flex flex-col items-center gap-8"
            >
              <h1 
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 glitch-text uppercase tracking-tighter"
                data-text="SYSTEM OFFLINE"
              >
                SYSTEM OFFLINE
              </h1>
              
              <button 
                onClick={handleEnterDashboard}
                className="group relative px-8 py-4 bg-gold/10 border border-gold hover:bg-gold/20 transition-all duration-300 overflow-hidden flex items-center gap-3"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <Terminal className="text-gold w-6 h-6" />
                <span className="text-gold font-mono uppercase tracking-[0.2em] font-semibold">Initiate Sequence</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 
          ========================================================================
          STATE: START VIDEO TRANSITION
          ========================================================================
        */}
        {appState === STATE.START_VIDEO && (
          <motion.div 
            key="start-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 bg-black flex items-center justify-center"
          >
            <video 
              ref={startVideoRef}
              src="/start.mp4" 
              className="w-full h-full object-cover"
              onEnded={onStartVideoEnd}
              playsInline
              muted
            />
          </motion.div>
        )}

        {/* 
          ========================================================================
          STATE: END VIDEO TRANSITION
          ========================================================================
        */}
        {appState === STATE.END_VIDEO && (
          <motion.div 
            key="end-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 bg-black flex items-center justify-center"
          >
            <video 
              ref={endVideoRef}
              src="/end.mp4" 
              className="w-full h-full object-cover"
              onEnded={onEndVideoEnd}
              playsInline
              muted
            />
          </motion.div>
        )}

      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

export default App
