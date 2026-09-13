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
              className="relative z-20 flex flex-col items-center gap-12"
            >
              <motion.div 
                initial={{ letterSpacing: '0.8em', opacity: 0, scale: 0.9 }}
                animate={{ letterSpacing: '0.2em', opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-7xl md:text-9xl font-black text-white uppercase" style={{ textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 100px rgba(34,197,94,0.2)' }}>
                  A.T.L.A.S.
                </h1>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="text-[#E8A33D] font-mono text-xs md:text-sm tracking-[0.5em] uppercase mt-6 flex items-center gap-4 opacity-90"
                >
                  <span className="w-8 md:w-16 h-[1px] bg-[#E8A33D]/50"></span>
                  Advanced Threat & Link Analysis System
                  <span className="w-8 md:w-16 h-[1px] bg-[#E8A33D]/50"></span>
                </motion.div>
              </motion.div>
              
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                onClick={handleEnterDashboard}
                className="px-8 py-4 border border-emerald-500/50 text-emerald-500 font-mono tracking-[0.3em] uppercase text-sm hover:bg-emerald-500 hover:text-black transition-all duration-300 flex items-center gap-3 group shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] backdrop-blur-sm"
              >
                <Terminal className="w-5 h-5 group-hover:animate-pulse" />
                Initiate Sequence
              </motion.button>
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
            transition={{ duration: 0.5 }}
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
            
            <button
              onClick={onStartVideoEnd}
              className="absolute bottom-8 right-8 text-slate-400 hover:text-white font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-2 z-50 transition-all bg-black/50 px-6 py-2 border border-slate-700 hover:border-emerald-500 hover:text-emerald-400 backdrop-blur-sm cursor-pointer"
            >
              Skip to Dashboard <span className="text-emerald-500 font-bold">►►</span>
            </button>
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
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-black flex items-center justify-center pointer-events-auto"
          >
            <video 
              ref={endVideoRef}
              src="/end.mp4" 
              className="w-full h-full object-cover"
              onEnded={onEndVideoEnd}
              playsInline
              muted
            />
            
            <button
              onClick={onEndVideoEnd}
              className="absolute bottom-8 right-8 text-slate-400 hover:text-white font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-2 z-50 transition-all bg-black/50 px-6 py-2 border border-slate-700 hover:border-red-500 hover:text-red-400 backdrop-blur-sm cursor-pointer"
            >
              Force Terminate <span className="text-red-500 font-bold">►►</span>
            </button>
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
