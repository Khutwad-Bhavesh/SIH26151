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
    <div className="w-full h-full relative overflow-hidden font-sans antialiased">

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
            className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-200"
          >
            
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative z-20 flex flex-col items-center gap-12"
            >
              <motion.div 
                initial={{ letterSpacing: '0.4em', opacity: 0, scale: 0.95 }}
                animate={{ letterSpacing: '0.1em', opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-7xl md:text-9xl font-semibold text-slate-800 tracking-tight drop-shadow-sm">
                  A.T.L.A.S.
                </h1>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="text-slate-500 font-medium text-sm tracking-wide mt-6 flex items-center gap-4"
                >
                  <span className="w-8 md:w-16 h-[1px] bg-slate-300"></span>
                  Advanced Threat & Link Analysis System
                  <span className="w-8 md:w-16 h-[1px] bg-slate-300"></span>
                </motion.div>
              </motion.div>
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1 }}
                onClick={handleEnterDashboard}
                className="px-10 py-4 bg-white/80 border border-slate-200/60 text-slate-800 font-semibold rounded-full hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-3 group shadow-[0_8px_25px_rgba(148,163,184,0.4)] hover:shadow-[0_12px_35px_rgba(148,163,184,0.5)] backdrop-blur-xl"
              >
                <Terminal className="w-5 h-5 text-blue-600 group-hover:text-blue-700 drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)]" />
                Start Workspace
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
