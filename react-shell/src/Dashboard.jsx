import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import cytoscape from 'cytoscape'
import { FileJson, FileText, FileDown, Search, X, ShieldAlert, Activity, AlertTriangle, Fingerprint, Network, TerminalSquare } from 'lucide-react'
import html2pdf from 'html2pdf.js'

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
      logToTerminal(`ERROR: ${error.message || error}`, "warn")
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
    <div className="w-full h-full relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-200 text-slate-900 overflow-hidden font-sans select-none antialiased">


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
              className={`absolute w-6 h-6 flex items-center justify-center cursor-pointer rounded-full transition-shadow duration-300
                ${isSelected ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-[#E8A33D] shadow-[0_0_10px_rgba(232,163,61,0.5)] opacity-80 hover:opacity-100'}
              `}
              style={{ left: 0, top: 0 }}
            >
              {/* Node Label (Always Visible) */}
              <div className={`absolute top-8 text-xs font-semibold whitespace-nowrap px-3 py-1 rounded-full backdrop-blur-md transition-all duration-300
                ${isSelected ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-200 shadow-sm' : 'text-slate-600 bg-white/80 border border-white/50 shadow-sm'}
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
        
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar min-h-0 pointer-events-auto pr-1">
          {/* LOGO */}
          <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="relative w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2">
              <img src="/source_image.png" alt="A.T.L.A.S." className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-base tracking-tight">A.T.L.A.S.</div>
              <div className="text-xs text-slate-500 font-medium">Intelligence Command</div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-3xl pointer-events-auto flex-shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-xs text-slate-500 mb-3 font-medium">Analysis Controls</div>
            <div className="relative group mb-4">
              <input 
                type="text" 
                placeholder="Enter Target Alias..." 
                value={targetQuery}
                onChange={e => setTargetQuery(e.target.value)}
                className="bg-white/80 border border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-[0_0_10px_rgba(148,163,184,0.2)] hover:shadow-[0_0_15px_rgba(148,163,184,0.4)]">
                <Search className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)]" />
              </button>
            </div>
            <button 
              onClick={runScan}
              disabled={isScanning}
              className="w-full bg-slate-800 text-white hover:bg-slate-700 transition-all py-3 rounded-2xl text-sm font-semibold flex justify-center items-center gap-2 shadow-[0_4px_15px_rgba(148,163,184,0.4)] hover:shadow-[0_6px_20px_rgba(148,163,184,0.5)] disabled:opacity-50"
            >
              {isScanning ? <Activity className="w-4 h-4 animate-spin drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" /> : <Search className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" />}
              {isScanning ? 'Scanning Network...' : 'Initialize OSINT Scan'}
            </button>
          </div>

          {/* LIVE THREAT FEED */}
          <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-3xl flex-shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-xs text-emerald-700 mb-3 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Threat Feed
            </div>
            <div className="h-24 overflow-hidden flex flex-col gap-2 text-xs">
              <AnimatePresence>
                {liveAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={alert.text.includes('[ALERT]') || alert.text.includes('[RISK]') ? 'text-red-600 font-medium' : alert.text.includes('[FINANCE]') ? 'text-amber-600 font-medium' : 'text-slate-600'}
                  >
                    {alert.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* BENTO GRID - GLOBAL METRICS */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-4 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="text-xs text-slate-500 font-medium mb-1">Identities</div>
              <div className="text-2xl font-bold text-slate-800">{nodes.length}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-4 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="text-xs text-slate-500 font-medium mb-1">Correlations</div>
              <div className="text-2xl font-bold text-slate-800">{edges.length}</div>
            </div>
            <div className="col-span-2 bg-white/60 backdrop-blur-2xl border border-blue-200/60 p-4 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-r from-blue-50/50 to-transparent">
              <div className="text-xs text-slate-500 font-medium mb-1">Average Confidence</div>
              <div className="text-2xl font-bold text-blue-600">{avgConfidence}</div>
            </div>
          </div>

          {/* INFRASTRUCTURE INTEL */}
          <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-3xl text-sm flex-shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between mb-3">
              <span className="text-slate-500 font-medium">Tor Misconfigs</span>
              <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">{misconfigs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">SSL Clearnet Leaks</span>
              <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">{sslLeaks}</span>
            </div>
          </div>
        </div>

        {/* TERMINAL / LOGGER */}
        <div className="mt-auto flex-1 min-h-[120px] max-h-[200px] bg-slate-900/5 backdrop-blur-2xl border border-slate-200/60 p-5 rounded-3xl flex flex-col text-xs pointer-events-auto shadow-inner">
          <div className="text-slate-500 font-semibold border-b border-black/5 pb-3 mb-3 flex justify-between items-center">
            <span>System Log</span>
            <span className="text-slate-400 font-normal text-[10px] bg-white/50 px-2 py-1 rounded-full">v4.9.1</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono text-[11px]">
            {terminalLogs.map(log => (
              <div key={log.id} className={`${log.type === 'warn' ? 'text-red-600' : log.type === 'success' ? 'text-emerald-700' : 'text-slate-700'}`}>
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
          className="bg-white/80 backdrop-blur-xl border border-slate-200/60 text-slate-600 hover:text-red-600 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(148,163,184,0.3)] hover:shadow-[0_8px_25px_rgba(148,163,184,0.4)]"
        >
          <X className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)]" />
          Close Workspace
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
            className="absolute top-6 right-6 bottom-6 w-[400px] bg-white/70 backdrop-blur-2xl border border-slate-200/60 flex flex-col z-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] pointer-events-auto rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200/60 flex justify-between items-center bg-white/40">
              <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]" /> 
                {selectedNode ? "Target Dossier" : "Link Analysis"}
              </h3>
              <button onClick={() => { setSelectedNode(null); setSelectedEdge(null); }} className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 hover:bg-white p-1.5 rounded-full shadow-[0_4px_10px_rgba(148,163,184,0.2)] hover:shadow-[0_6px_15px_rgba(148,163,184,0.3)]">
                <X className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)]" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {selectedNode && (
                <>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 font-medium">Identity / Alias</div>
                    <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-slate-400 drop-shadow-[0_2px_8px_rgba(148,163,184,0.5)]" />
                      {selectedNode.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 font-medium">Cluster Affiliation</div>
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-2 text-xs font-semibold rounded-full shadow-[0_4px_10px_rgba(16,185,129,0.2)]">
                      <Network className="w-3 h-3 drop-shadow-[0_2px_5px_rgba(16,185,129,0.5)]" />
                      {selectedNode.cluster}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2 font-medium">Primary PGP Key</div>
                    <div className="font-mono text-xs text-slate-600 break-all bg-white/50 p-4 border border-white/50 rounded-2xl shadow-sm">
                      {selectedNode.pgp}
                    </div>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700 pt-2">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">BTC Wallet</span>
                      <span className="font-mono text-xs bg-blue-50/50 border border-blue-100 px-2 py-1 rounded-md">{selectedNode.btc}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">Risk Level</span>
                      <span className={selectedNode.risk === 'Critical' ? 'text-red-600 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md text-xs shadow-[0_4px_10px_rgba(220,38,38,0.2)]' : 'font-medium text-xs bg-slate-100 px-2 py-1 rounded-md'}>
                        {selectedNode.risk === 'Critical' && <AlertTriangle className="w-3 h-3 drop-shadow-[0_2px_5px_rgba(220,38,38,0.5)]" />}
                        {selectedNode.risk}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">Malware Strain</span>
                      <span className="font-medium text-slate-800 text-sm">{selectedNode.malware}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button onClick={() => setActiveModal('timeline')} className="w-full bg-white/80 border border-slate-200/60 text-slate-700 hover:bg-white py-3 text-sm font-semibold rounded-2xl shadow-[0_4px_15px_rgba(148,163,184,0.3)] hover:shadow-[0_6px_20px_rgba(148,163,184,0.4)] transition-all">
                      View Timeline
                    </button>
                    <button onClick={() => setActiveModal('ledger')} className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 text-sm font-semibold rounded-2xl shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.5)] transition-all">
                      Trace Crypto Ledger
                    </button>
                  </div>
                </>
              )}

              {selectedEdge && (
                <>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 font-medium">Connection</div>
                    <div className="text-xl font-bold text-slate-800">
                      {selectedEdge.source} <span className="text-emerald-500 mx-2">↔</span> {selectedEdge.target}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 font-medium">Fusion Score</div>
                    <div className="text-4xl font-black text-slate-800">
                      {(selectedEdge.weight * 10).toFixed(1)} <span className="text-sm text-slate-500 font-medium">/ 10.0</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2 font-medium">Corroborating Evidence</div>
                    <ul className="space-y-3 text-sm text-slate-600 bg-white/50 p-4 rounded-2xl border border-white/50">
                      {selectedEdge.reason?.split(' | ').map((r, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-emerald-500 mt-1 rounded-full bg-emerald-100 p-0.5"><Activity className="w-3 h-3"/></span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* ACTION MENU (FAB Alternative) */}
            <div className="p-5 bg-white/40 border-t border-slate-200/60 flex gap-3">
              <button onClick={exportJSON} className="flex-1 flex flex-col items-center justify-center gap-1 bg-white/80 border border-slate-200/60 hover:bg-white text-slate-600 hover:text-slate-900 py-3 rounded-2xl text-xs font-semibold transition-all shadow-[0_4px_10px_rgba(148,163,184,0.2)] hover:shadow-[0_6px_15px_rgba(148,163,184,0.3)]">
                <FileJson className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)]" /> JSON
              </button>
              <button onClick={exportCSV} className="flex-1 flex flex-col items-center justify-center gap-1 bg-white/80 border border-slate-200/60 hover:bg-white text-slate-600 hover:text-slate-900 py-3 rounded-2xl text-xs font-semibold transition-all shadow-[0_4px_10px_rgba(148,163,184,0.2)] hover:shadow-[0_6px_15px_rgba(148,163,184,0.3)]">
                <FileText className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)]" /> CSV
              </button>
              <button onClick={exportPDF} className="flex-[2] flex flex-col items-center justify-center gap-1 bg-slate-800 text-white hover:bg-slate-700 py-3 rounded-2xl text-xs font-semibold transition-all shadow-[0_4px_15px_rgba(30,41,59,0.3)] hover:shadow-[0_6px_20px_rgba(30,41,59,0.4)]">
                <FileDown className="w-4 h-4 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" /> Export PDF
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white/80 backdrop-blur-3xl border border-white/50 p-8 w-[500px] max-w-[90vw] shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl"
            >
              <div className="flex justify-between items-center border-b border-slate-200/50 pb-5 mb-5">
                <h3 className="text-slate-800 font-semibold text-lg">
                  {activeModal === 'timeline' ? `Timeline: ${selectedNode?.label}` : `Ledger Trace: ${selectedNode?.label}`}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-50 p-2 rounded-full shadow-[0_4px_10px_rgba(148,163,184,0.2)] hover:shadow-[0_6px_15px_rgba(148,163,184,0.3)]">
                  <X className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)]"/>
                </button>
              </div>
              
              <div className="text-sm text-slate-700 space-y-4">
                {activeModal === 'timeline' ? (
                  <div className="border-l-2 border-emerald-300 pl-4 ml-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 text-sm">2019-2020</strong><br/>
                      Initial activity detected on MarketAlpha.<br/>
                      <span className="text-slate-500">Infrastructure: SRV-NGINX-SSH-99X8</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 text-sm">2021-2022</strong><br/>
                      Migration to DreadForum. New PGP generated.<br/>
                      <span className="text-slate-500">Infrastructure remains identical.</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 text-sm">2023-Present</strong><br/>
                      Rebranded identity detected. Active malware distribution.<br/>
                      <span className="text-emerald-600">Confidence: 99% (Infrastructure Match)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <h4 className="text-slate-800 mb-8 font-semibold text-sm">Transaction Graph (Mock)</h4>
                    <div className="flex justify-between items-center bg-white/50 p-6 border border-white/50 rounded-3xl shadow-sm">
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs shadow-sm font-semibold">Wallet</div>
                      <div className="text-slate-400 text-xs font-medium">→ 4.5 BTC →</div>
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-xs shadow-sm font-bold">Mixer</div>
                      <div className="text-slate-400 text-xs font-medium">→ 4.4 BTC →</div>
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs shadow-sm font-semibold">Exchange</div>
                    </div>
                    <p className="mt-8 text-slate-500 text-xs">Ledger integration active. Tracing heuristic: High-risk mixing service.</p>
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
