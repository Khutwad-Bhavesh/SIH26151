import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import cytoscape from 'cytoscape'
import { FileJson, FileText, FileDown, Search, X, ShieldAlert, Activity, AlertTriangle, Fingerprint, Network, TerminalSquare } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import DitherCanvas from './DitherCanvas'

export default function Dashboard({ onTerminate }) {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [targetQuery, setTargetQuery] = useState('')
  const [terminalLogs, setTerminalLogs] = useState([])
  
  // Metrics
  const [avgConfidence, setAvgConfidence] = useState("0.0%")
  const [misconfigs, setMisconfigs] = useState(0)
  const [sslLeaks, setSslLeaks] = useState(0)

  // Modals
  const [activeModal, setActiveModal] = useState(null) // 'timeline' | 'ledger' | null

  // Panning State
  const containerRef = useRef(null)

  const cyRef = useRef(null)
  const terminalEndRef = useRef(null)

  const logToTerminal = (msg, type = "normal") => {
    setTerminalLogs(prev => [...prev.slice(-15), { id: Date.now() + Math.random(), msg, type }])
  }

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [terminalLogs])

  // Live Threat Feed
  const [liveAlerts, setLiveAlerts] = useState([])
  const mockAlerts = [
    "[ALERT] ACTOR MIGRATION: AlphaFox → DarkFox (99% Conf)",
    "[FINANCE] SUSPICIOUS TX: 4.5 BTC to Mixer",
    "[INFRA] INFRA CHANGE: New Onion Service Detected",
    "[KEY] PGP ROTATION: ShadowBroker updated keys",
    "[ALERT] ALIAS CORRELATION: FoxX matches DarkFox",
    "[RISK] HIGH RISK: ZeroDay.exe payload seen in MarketA"
  ]
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const text = mockAlerts[Math.floor(Math.random() * mockAlerts.length)]
        setLiveAlerts(prev => [{ id: Date.now(), text }, ...prev].slice(0, 5))
      }
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const runScan = async () => {
    if (isScanning) return
    setIsScanning(true)
    setTerminalLogs([])
    setSelectedNode(null)
    setSelectedEdge(null)
    setNodes([])
    setEdges([])
    setAvgConfidence("0.0%")
    setMisconfigs(0)
    setSslLeaks(0)

    const targetName = targetQuery ? `[${targetQuery}]` : "BROAD NETWORK"
    if (targetQuery) {
      logToTerminal(`TARGET LOCK: ${targetName}`, "warn")
      logToTerminal(`ISOLATING TARGET FOOTPRINT...`, "normal")
    } else {
      logToTerminal("EXECUTING BROAD NETWORK SWEEP...", "normal")
    }

    // Fake delay
    await new Promise(r => setTimeout(r, 1000))
    logToTerminal(`Extracting Signatures...`, "normal")
    await new Promise(r => setTimeout(r, 1000))
    logToTerminal(`Computing stylometric embeddings...`, "normal")

    try {
      const url = targetQuery ? `/api/graph?target=${encodeURIComponent(targetQuery)}` : "/api/graph"
      const res = await fetch(url)
      const result = await res.json()

      if (result.status === "success") {
        logToTerminal("CLUSTERS DETECTED.", "success")
        
        // Run Headless Cytoscape Physics
        logToTerminal("COMPUTING KINETIC LAYOUT...", "normal")
        const cy = cytoscape({
          headless: true,
          elements: { nodes: result.data.nodes, edges: result.data.edges },
        })

        const layout = cy.layout({
          name: 'cose',
          randomize: true,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          nodeOverlap: 10,
          idealEdgeLength: 100,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
          animate: false
        })
        
        layout.run()
        
        const calculatedNodes = cy.nodes().map(n => ({ ...n.data(), position: n.position() }))
        const calculatedEdges = cy.edges().map(e => ({
          ...e.data(),
          sourcePos: cy.getElementById(e.data('source')).position(),
          targetPos: cy.getElementById(e.data('target')).position()
        }))

        setNodes(calculatedNodes)
        setEdges(calculatedEdges)
        
        if (result.data.edges.length > 0) {
          const totalWeight = result.data.edges.reduce((sum, e) => sum + e.data.weight, 0)
          setAvgConfidence((totalWeight / result.data.edges.length * 10).toFixed(1) + "%")
        }
        setMisconfigs(Math.floor(Math.random() * 5) + 1)
        setSslLeaks(Math.floor(Math.random() * 3))

        cyRef.current = cy
        logToTerminal("VISUALIZATION RENDERED.", "success")
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      logToTerminal(`ERROR: TARGET [${targetQuery}] NOT IN DATABASE`, "warn")
    } finally {
      setIsScanning(false)
    }
  }

  const exportJSON = () => {
    if (!cyRef.current) return
    const jsonStr = JSON.stringify(cyRef.current.json().elements, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = "ATLAS_Report.json"; a.click()
  }

  const exportCSV = () => {
    if (nodes.length === 0) return
    const headers = Object.keys(nodes[0]).filter(k => k !== 'position').join(",")
    const rows = nodes.map(n => Object.entries(n).filter(([k]) => k !== 'position').map(([_, v]) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = "ATLAS_Report.csv"; a.click()
  }

  const exportPDF = () => {
    if (!selectedNode && !selectedEdge) return alert("Select a node or edge first.")
    const el = document.getElementById("dossier-panel")
    if(el) {
      html2pdf().from(el).save('ATLAS_Dossier.pdf')
    }
  }

  return (
    <div className="w-full h-full relative bg-[#020617] text-slate-100 overflow-hidden font-mono select-none">
      
      {/* MAGNIFYING DITHER BACKGROUND */}
      <DitherCanvas />

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* 
        ========================================
        PANNING / ZOOMING CANVAS (Framer Motion)
        ========================================
      */}
      <motion.div 
        ref={containerRef}
        drag 
        dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E8A33D" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {edges.map((edge, i) => (
            <motion.line
              key={edge.id}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 1 }}
              x1={edge.sourcePos.x + window.innerWidth / 2}
              y1={edge.sourcePos.y + window.innerHeight / 2}
              x2={edge.targetPos.x + window.innerWidth / 2}
              y2={edge.targetPos.y + window.innerHeight / 2}
              stroke="url(#edgeGrad)"
              strokeWidth={Math.max(1, edge.weight || 1)}
              className="cursor-pointer pointer-events-auto hover:stroke-emerald-400 transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); setSelectedNode(null); }}
            />
          ))}
        </svg>

        {nodes.map((node, i) => {
          const isSelected = selectedNode?.id === node.id
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isSelected ? 1.5 : 1, 
                opacity: 1,
                x: node.position.x + window.innerWidth / 2 - 12,
                y: node.position.y + window.innerHeight / 2 - 12
              }}
              transition={{ delay: i * 0.02, type: 'spring' }}
              whileHover={{ scale: 1.2 }}
              onClick={(e) => { e.stopPropagation(); setSelectedNode(node); setSelectedEdge(null); }}
              className={`absolute w-6 h-6 flex items-center justify-center cursor-pointer
                ${isSelected ? 'bg-emerald-500 shadow-[0_0_20px_#22C55E]' : 'bg-[#E8A33D] shadow-[0_0_10px_#E8A33D] opacity-80'}
              `}
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', left: 0, top: 0 }}
            >
              {/* Node Label (Always Visible) */}
              <div className={`absolute top-8 text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded 
                ${isSelected ? 'text-emerald-400 bg-black border border-emerald-500/30' : 'text-slate-400 bg-black/50'}
              `}>
                {node.label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 
        ========================================
        OVERLAY UI (Vengeance / Skipper HUD)
        ========================================
      */}

      {/* LEFT SIDEBAR */}
      <div className="absolute top-6 left-6 bottom-6 w-80 flex flex-col gap-4 pointer-events-none z-40">
        
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar min-h-0">
          {/* LOGO */}
          <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <Activity className="text-emerald-500 w-6 h-6 animate-pulse" />
            <div>
              <div className="text-emerald-500 font-bold text-sm tracking-widest glitch-text" data-text="A.T.L.A.S.">A.T.L.A.S.</div>
              <div className="text-[10px] text-slate-500">INTELLIGENCE COMMAND</div>
            </div>
          </div>

          {/* SEARCH BAR (Magnifying Glass) */}
          <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-4 pointer-events-auto flex-shrink-0">
            <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">Analysis Controls</div>
            <div className="relative group mb-3">
              <input 
                type="text" 
                placeholder="ENTER TARGET ALIAS..." 
                value={targetQuery}
                onChange={e => setTargetQuery(e.target.value)}
                className="bg-black border border-slate-700 focus:border-emerald-500 w-full px-3 py-2 text-xs outline-none transition-colors"
              />
              <button className="absolute right-0 top-0 h-full px-3 text-emerald-500 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={runScan}
              disabled={isScanning}
              className="w-full bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-colors py-2 text-xs font-bold tracking-widest uppercase flex justify-center gap-2"
            >
              {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <TerminalSquare className="w-4 h-4" />}
              {isScanning ? 'SCAN IN PROGRESS...' : 'INITIALIZE OSINT SCAN'}
            </button>
          </div>

          {/* LIVE THREAT FEED */}
          <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-4 flex-shrink-0">
            <div className="text-[10px] text-emerald-500 mb-2 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Threat Feed
            </div>
            <div className="h-24 overflow-hidden flex flex-col gap-2 text-[10px]">
              <AnimatePresence>
                {liveAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={alert.text.includes('[ALERT]') || alert.text.includes('[RISK]') ? 'text-red-400' : alert.text.includes('[FINANCE]') ? 'text-gold' : 'text-slate-300'}
                  >
                    {alert.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* BENTO GRID - GLOBAL METRICS */}
          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
            <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-3 flex flex-col items-center justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Identities</div>
              <div className="text-xl font-bold text-white">{nodes.length}</div>
            </div>
            <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-3 flex flex-col items-center justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Correlations</div>
              <div className="text-xl font-bold text-white">{edges.length}</div>
            </div>
            <div className="col-span-2 bg-black/60 border border-slate-800 backdrop-blur-md p-3 flex flex-col items-center justify-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Avg Confidence</div>
              <div className="text-xl font-bold text-emerald-500">{avgConfidence}</div>
            </div>
          </div>

          {/* INFRASTRUCTURE INTEL */}
          <div className="bg-black/60 border border-slate-800 backdrop-blur-md p-4 text-xs flex-shrink-0">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Tor Misconfigs</span>
              <span className="text-red-400 font-bold">{misconfigs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SSL Clearnet Leaks</span>
              <span className="text-red-400 font-bold">{sslLeaks}</span>
            </div>
          </div>
        </div>

        {/* TERMINAL / LOGGER */}
        <div className="mt-auto flex-1 min-h-[120px] max-h-[200px] bg-black/60 border border-slate-800 backdrop-blur-md p-4 flex flex-col text-[10px] pointer-events-auto">
          <div className="text-slate-500 uppercase font-bold tracking-widest border-b border-slate-800 pb-2 mb-2 flex justify-between">
            <span>Subsystem Logs</span>
            <span className="text-emerald-500/50 block">v4.9.1</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {terminalLogs.map(log => (
              <div key={log.id} className={`${log.type === 'warn' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {">"} {log.msg}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      {/* TOP RIGHT - TERMINATE */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
        <button 
          onClick={onTerminate}
          className="bg-black/60 border border-red-500/50 text-red-500 px-6 py-2 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors tracking-widest uppercase flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Terminate Link
        </button>
      </div>

      {/* DOSSIER PANEL (VENGEANCE UI) */}
      <AnimatePresence>
        {(selectedNode || selectedEdge) && (
          <motion.div
            id="dossier-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute top-0 right-0 w-[400px] h-full bg-[#0f172a]/95 backdrop-blur-2xl border-l border-slate-800 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] pointer-events-auto"
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/50">
              <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> 
                {selectedNode ? "TARGET DOSSIER" : "LINK ANALYSIS"}
              </h3>
              <button onClick={() => { setSelectedNode(null); setSelectedEdge(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {selectedNode && (
                <>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">ID / Alias</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-slate-500" />
                      {selectedNode.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">Cluster Affiliation</div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-2 text-xs font-bold">
                      <Network className="w-3 h-3" />
                      {selectedNode.cluster}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">Primary PGP Key</div>
                    <div className="font-mono text-[10px] text-emerald-500 break-all bg-black p-3 border border-slate-800">
                      {selectedNode.pgp}
                    </div>
                  </div>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">BTC Wallet</span>
                      <span className="font-mono">{selectedNode.btc}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Risk Level</span>
                      <span className={selectedNode.risk === 'Critical' ? 'text-red-400 font-bold flex items-center gap-1' : ''}>
                        {selectedNode.risk === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                        {selectedNode.risk}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500">Malware Strain</span>
                      <span>{selectedNode.malware}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <button onClick={() => setActiveModal('timeline')} className="w-full bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold tracking-widest uppercase transition-colors">
                      View Timeline
                    </button>
                    <button onClick={() => setActiveModal('ledger')} className="w-full bg-slate-800 hover:bg-slate-700 py-2 text-xs font-bold tracking-widest uppercase transition-colors">
                      Trace Crypto Ledger
                    </button>
                  </div>
                </>
              )}

              {selectedEdge && (
                <>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">Connection</div>
                    <div className="text-xl font-bold text-white">
                      {selectedEdge.source} <span className="text-emerald-500 mx-2">↔</span> {selectedEdge.target}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 tracking-widest uppercase">Fusion Score</div>
                    <div className="text-4xl font-black text-[#E8A33D] glitch-text" data-text={(selectedEdge.weight * 10).toFixed(1)}>
                      {(selectedEdge.weight * 10).toFixed(1)} <span className="text-sm text-slate-500 font-normal">/ 10.0</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-2 tracking-widest uppercase">Corroborating Evidence</div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {selectedEdge.reason?.split(' | ').map((r, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-emerald-500">►</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* ACTION MENU (FAB Alternative) */}
            <div className="p-4 bg-black/80 border-t border-slate-800 flex gap-2">
              <button onClick={exportJSON} className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded text-[10px] font-bold transition-colors">
                <FileJson className="w-4 h-4" /> JSON
              </button>
              <button onClick={exportCSV} className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white py-2 rounded text-[10px] font-bold transition-colors">
                <FileText className="w-4 h-4" /> CSV
              </button>
              <button onClick={exportPDF} className="flex-[2] flex flex-col items-center justify-center gap-1 bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-500 text-emerald-500 hover:text-black py-2 rounded text-[10px] font-bold transition-colors">
                <FileDown className="w-4 h-4" /> EXPORT PDF
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0f172a] border border-slate-700 p-6 w-[500px] max-w-[90vw] shadow-[0_0_50px_rgba(34,197,94,0.1)]"
            >
              <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-sm">
                  {activeModal === 'timeline' ? `TIMELINE: ${selectedNode?.label}` : `LEDGER TRACE: ${selectedNode?.label}`}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="text-xs text-slate-300 space-y-4 font-mono">
                {activeModal === 'timeline' ? (
                  <div className="border-l-2 border-emerald-500 pl-4 ml-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-500 text-sm">2019-2020</strong><br/>
                      Initial activity detected on MarketAlpha.<br/>
                      <span className="text-slate-500">Infrastructure: SRV-NGINX-SSH-99X8</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-500 text-sm">2021-2022</strong><br/>
                      Migration to DreadForum. New PGP generated.<br/>
                      <span className="text-slate-500">Infrastructure remains identical.</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-500 text-sm">2023-Present</strong><br/>
                      Rebranded identity detected. Active malware distribution.<br/>
                      <span className="text-emerald-500/50">Confidence: 99% (Infrastructure Match)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <h4 className="text-emerald-500 mb-6 tracking-widest">TRANSACTION GRAPH (MOCK)</h4>
                    <div className="flex justify-between items-center bg-black/50 p-6 border border-slate-800 rounded">
                      <div className="border border-slate-700 p-3 rounded text-[10px]">WALLET</div>
                      <div className="text-slate-500 text-[10px]">→ 4.5 BTC →</div>
                      <div className="border border-emerald-500 text-emerald-500 p-3 rounded text-[10px] shadow-[0_0_15px_rgba(34,197,94,0.2)]">MIXER</div>
                      <div className="text-slate-500 text-[10px]">→ 4.4 BTC →</div>
                      <div className="border border-slate-700 p-3 rounded text-[10px]">EXCH.</div>
                    </div>
                    <p className="mt-6 text-slate-500 text-[10px]">Ledger integration active. Tracing heuristic: High-risk mixing service.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
