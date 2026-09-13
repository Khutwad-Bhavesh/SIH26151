import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from 'lucide-react'
import Dashboard from './Dashboard'

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
      startVideoRef.current.playbackRate = 1.5
      startVideoRef.current.play().catch(e => console.error("Play failed:", e))
    }
    if (appState === STATE.END_VIDEO && endVideoRef.current) {
      endVideoRef.current.playbackRate = 1.5
      endVideoRef.current.play().catch(e => console.error("Play failed:", e))
    }
  }, [appState])

  return (
    <div className="w-full h-full relative overflow-hidden bg-black scanlines">
      
      {/* 
        ========================================================================
        STATE: NATIVE DASHBOARD (ADHD Headless Architecture)
        ========================================================================
      */}
      {appState === STATE.DASHBOARD && (
        <Dashboard onTerminate={handleQuitDashboard} />
      )}

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
            
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none"></div>

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
