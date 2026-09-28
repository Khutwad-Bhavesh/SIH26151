import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import cytoscape from 'cytoscape'
import { FileJson, FileText, FileDown, Search, X, ShieldAlert, Activity, AlertTriangle, Fingerprint, Network, TerminalSquare, Cpu, Crosshair, Radar, Smartphone, Radio, Moon, Sun } from 'lucide-react'
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
  const [activeModal, setActiveModal] = useState(null) // 'timeline' | 'ledger' | 'swarm' | 'proximity' | null
  
  // Swarm State
  const [swarmActive, setSwarmActive] = useState(false)
  const [swarmLogs, setSwarmLogs] = useState([])

  // Proximity State
  const [proximityActive, setProximityActive] = useState(false)
  const [proximityLogs, setProximityLogs] = useState([])

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false)

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

  const deploySwarm = async () => {
    if (!cyRef.current) return alert("Run an OSINT scan first to initialize the graph.")
    setActiveModal('swarm')
    setSwarmActive(true)
    setSwarmLogs([])
    
    const sequence = [
      { t: 500, msg: "Initializing Active Reconnaissance Swarm...", type: "system" },
      { t: 1500, msg: "Agent [Noob_Coder99] deployed to BreachForums.", type: "system" },
      { t: 3000, msg: "[Noob_Coder99]: 'Hey man, your malware obfuscation is insane! How did you hide the C2?'", type: "bot" },
      { t: 5500, msg: "[Target_Lux]: 'lol it's easy if you know kernel hooks. I route it through a dedicated proxy.'", type: "target" },
      { t: 7500, msg: "[Noob_Coder99]: 'I keep failing at the proxy setup. Can you check my config? [http://paste-bin-canary.local/config]'", type: "bot" },
      { t: 9000, msg: "Awaiting target interaction...", type: "system" },
      { t: 12000, msg: "CANARY LINK CLICKED.", type: "alert" },
      { t: 13000, msg: "Extracting Origin IP...", type: "system" },
      { t: 14500, msg: "IP DE-ANONYMIZED: 194.55.23.11", type: "success" }
    ]

    let cumulativeTime = 0
    sequence.forEach((step) => {
      cumulativeTime += step.t
      setTimeout(() => {
        setSwarmLogs(prev => [...prev, step])
        
        // At the end, inject the node into the graph
        if (step.type === "success" && cyRef.current) {
          const targetNode = cyRef.current.nodes()[0]?.id() || 'target'
          cyRef.current.add({
            group: 'nodes',
            data: { id: 'leaked_ip', label: '194.55.23.11 (Real IP)', cluster: 'Target Infra', risk: 'Critical', btc: 'N/A', pgp: 'N/A', malware: 'N/A' },
            position: { x: cyRef.current.nodes()[0]?.position().x + 100 || 0, y: cyRef.current.nodes()[0]?.position().y + 100 || 0 }
          })
          cyRef.current.add({
            group: 'edges',
            data: { id: 'leak_edge', source: targetNode, target: 'leaked_ip', weight: 1.0, reason: 'Active Recon / Canary Phish' }
          })
          
          // Re-render nodes/edges state
          const calculatedNodes = cyRef.current.nodes().map(n => ({ ...n.data(), position: n.position() }))
          const calculatedEdges = cyRef.current.edges().map(e => ({
            ...e.data(),
            sourcePos: cyRef.current.getElementById(e.data('source')).position(),
            targetPos: cyRef.current.getElementById(e.data('target')).position()
          }))
          setNodes(calculatedNodes)
          setEdges(calculatedEdges)
          
          // Highlight the new node
          const newNode = calculatedNodes.find(n => n.id === 'leaked_ip')
          setSelectedNode(newNode)
          setSwarmActive(false)
        }
      }, cumulativeTime)
    })
  }

  const deployProximity = async () => {
    if (!cyRef.current) return alert("Run an OSINT scan first to initialize the graph.")
    setActiveModal('proximity')
    setProximityActive(true)
    setProximityLogs([])
    
    const sequence = [
      { t: 500, msg: "> Initializing Air-Gap Bridging Protocol...", type: "system" },
      { t: 2000, msg: "> Payload injected via browser cache.", type: "system" },
      { t: 3500, msg: "> Emitting 18kHz ultrasonic beacon from target laptop...", type: "alert" },
      { t: 6000, msg: "> Scanning for local device microphones in 0.5m radius...", type: "system" },
      { t: 8500, msg: "> SUCCESS: Device 'iPhone 15 Pro' detected ultrasonic pulse.", type: "success" },
      { t: 10000, msg: "> Intercepting cellular 5G ping...", type: "system" },
      { t: 12000, msg: "> PHYSICAL LOCATION & IP DE-ANONYMIZED: 45.22.89.12", type: "success" }
    ]

    let cumulativeTime = 0
    sequence.forEach((step) => {
      cumulativeTime += step.t
      setTimeout(() => {
        setProximityLogs(prev => [...prev, step])
        
        // At the end, inject the node into the graph
        if (step.msg.includes('PHYSICAL LOCATION') && cyRef.current) {
          const targetNode = cyRef.current.nodes()[0]?.id() || 'target'
          cyRef.current.add({
            group: 'nodes',
            data: { id: 'smartphone_ip', label: 'iPhone 15 Pro (45.22.89.12)', cluster: 'Physical Device', risk: 'Critical', btc: 'N/A', pgp: 'N/A', malware: 'N/A' },
            position: { x: cyRef.current.nodes()[0]?.position().x - 120 || 0, y: cyRef.current.nodes()[0]?.position().y + 120 || 0 }
          })
          cyRef.current.add({
            group: 'edges',
            data: { id: 'prox_edge', source: targetNode, target: 'smartphone_ip', weight: 1.0, reason: 'Ultrasonic Air-Gap Bridge' }
          })
          
          // Re-render nodes/edges state
          const calculatedNodes = cyRef.current.nodes().map(n => ({ ...n.data(), position: n.position() }))
          const calculatedEdges = cyRef.current.edges().map(e => ({
            ...e.data(),
            sourcePos: cyRef.current.getElementById(e.data('source')).position(),
            targetPos: cyRef.current.getElementById(e.data('target')).position()
          }))
          setNodes(calculatedNodes)
          setEdges(calculatedEdges)
          
          // Highlight the new node
          const newNode = calculatedNodes.find(n => n.id === 'smartphone_ip')
          setSelectedNode(newNode)
          setProximityActive(false)
        }
      }, cumulativeTime)
    })
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
    <div className="w-full h-full relative text-slate-900 overflow-hidden font-sans select-none antialiased" style={{background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6633ee 100%)'}}>
      
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
      <div className="absolute top-6 left-6 bottom-6 w-80 flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl z-40 pointer-events-auto overflow-hidden transition-colors duration-500">
        
        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 p-5">
          {/* LOGO */}
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
              <img src="/source_image.png" alt="A.T.L.A.S." className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <div className="text-slate-800 dark:text-white font-semibold text-base tracking-tight">A.T.L.A.S.</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Intelligence Command</div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-200/60 dark:bg-slate-800" />

          {/* SEARCH BAR */}
          <div className="flex-shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Analysis Controls</div>
            <div className="relative group mb-4">
              <input 
                type="text" 
                placeholder="Enter Target Alias..." 
                value={targetQuery}
                onChange={e => setTargetQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 text-sm px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all border border-slate-200 dark:border-slate-800 shadow-inner"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors">
                <Search className="w-4 h-4 drop-shadow-sm" />
              </button>
            </div>
            
            <button 
              onClick={runScan}
              disabled={isScanning}
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition-all py-3 rounded-2xl text-sm font-semibold flex justify-center items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isScanning ? 'Scanning Network...' : 'Initialize OSINT Scan'}
            </button>
          </div>

          {/* ADVANCED ACTIONS (SWARM & PROXIMITY) */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Offensive Operations</div>
            <button 
              onClick={deploySwarm}
              disabled={swarmActive}
              className="w-full bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 transition-all py-3 rounded-2xl text-sm font-semibold flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Crosshair className="w-4 h-4" />
              Deploy Recon Swarm
            </button>
            <button 
              onClick={deployProximity}
              disabled={proximityActive}
              className="w-full bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 transition-all py-3 rounded-2xl text-sm font-semibold flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Radar className="w-4 h-4" />
              Execute Proximity Payload
            </button>
          </div>

          {/* LIVE THREAT FEED */}
          <div className="flex-shrink-0 bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-3 font-semibold flex items-center gap-2">
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
                    className={alert.text.includes('[ALERT]') || alert.text.includes('[RISK]') ? 'text-red-600 dark:text-red-400 font-medium' : alert.text.includes('[FINANCE]') ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-300'}
                  >
                    {alert.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* BENTO GRID - GLOBAL METRICS */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Identities</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{nodes.length}</div>
            </div>
            <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Correlations</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{edges.length}</div>
            </div>
            <div className="col-span-2 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/50 p-4 rounded-2xl flex flex-col items-center justify-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Average Confidence</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avgConfidence}</div>
            </div>
          </div>

          {/* INFRASTRUCTURE INTEL */}
          <div className="text-sm flex-shrink-0 bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between mb-3">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Tor Misconfigs</span>
              <span className="text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">{misconfigs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">SSL Clearnet Leaks</span>
              <span className="text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">{sslLeaks}</span>
            </div>
          </div>
        </div>

        {/* TERMINAL / LOGGER */}
        <div className="flex-shrink-0 min-h-[140px] max-h-[200px] bg-slate-100/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-5 flex flex-col text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 flex justify-between items-center">
            <span>System Log</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px] bg-white/50 dark:bg-slate-800 px-2 py-1 rounded-full">v4.9.1</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono text-[11px]">
            {terminalLogs.map(log => (
              <div key={log.id} className={`${log.type === 'warn' ? 'text-red-600 dark:text-red-400' : log.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {">"} {log.msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Dossier Panel) */}
      <div className="absolute top-6 right-6 bottom-6 w-[360px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col z-40 shadow-xl pointer-events-auto overflow-hidden transition-colors duration-500">
        <div id="dossier-content" className="p-0 pt-4 flex-1 overflow-y-auto custom-scrollbar">
          
          {selectedNode ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              {/* HEADER INFO */}
              <div className="p-6 border-b border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Fingerprint className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedNode.label.split(' ')[0]}</h2>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STATS GRID */}
              <div className="p-6 grid grid-cols-2 gap-4 border-b border-slate-200/50 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Cluster</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block truncate">{selectedNode.cluster}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Risk</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400 block truncate">{selectedNode.risk}</span>
                </div>
              </div>

              {/* DEEP METADATA */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <TerminalSquare className="w-4 h-4" /> Technical Footprint
                  </h3>
                  <div className="space-y-3 bg-white/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bitcoin Wallets</span>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{selectedNode.btc || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">PGP Fingerprint</span>
                      <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{selectedNode.pgp || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Malware Variants</span>
                      <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/20">{selectedNode.malware || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button onClick={() => setActiveModal('timeline')} className="w-full bg-white/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 py-3 text-sm font-semibold rounded-2xl shadow-sm transition-all">
                    View Timeline
                  </button>
                  <button onClick={() => setActiveModal('ledger')} className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 text-sm font-semibold rounded-2xl shadow-sm transition-all">
                    Trace Crypto Ledger
                  </button>
                </div>
              </div>
            </motion.div>
          ) : selectedEdge ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">Link Analysis</h3>
                <button onClick={() => setSelectedEdge(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium">Connection</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">
                    {selectedEdge.source} <span className="text-emerald-500 mx-2">↔</span> {selectedEdge.target}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-medium">Fusion Score</div>
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {(selectedEdge.weight * 10).toFixed(1)} <span className="text-sm text-slate-500 font-medium">/ 10.0</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">Corroborating Evidence</div>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    {selectedEdge.reason?.split(' | ').map((r, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-emerald-500 mt-1 rounded-full bg-emerald-100 p-0.5"><Activity className="w-3 h-3"/></span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                <Network className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">No Entity Selected</p>
                <p className="text-xs mt-1 max-w-[200px]">Select a node from the neural map to view deep intelligence dossier.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC MODALS OVERLAY */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl w-full max-w-2xl rounded-[2rem] border border-white/50 dark:border-slate-700 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-5 mb-5">
                  <h3 className="text-slate-800 dark:text-white font-semibold text-lg">
                    {activeModal === 'timeline' ? `Timeline: ${selectedNode?.label}` : activeModal === 'ledger' ? `Ledger Trace: ${selectedNode?.label}` : activeModal === 'swarm' ? 'Active Reconnaissance Swarm' : 'Ultrasonic Proximity Bridging'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-full shadow-[0_4px_10px_rgba(148,163,184,0.2)] dark:shadow-none">
                    <X className="w-5 h-5 drop-shadow-[0_2px_8px_rgba(148,163,184,0.4)] dark:drop-shadow-none"/>
                  </button>
                </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-4">
                {activeModal === 'timeline' ? (
                  <div className="border-l-2 border-emerald-300 dark:border-emerald-700 pl-4 ml-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">2019-2020</strong><br/>
                      Initial activity detected on MarketAlpha.<br/>
                      <span className="text-slate-500 dark:text-slate-400">Infrastructure: SRV-NGINX-SSH-99X8</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">2021-2022</strong><br/>
                      Migration to DreadForum. New PGP generated.<br/>
                      <span className="text-slate-500 dark:text-slate-400">Infrastructure remains identical.</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">2023-Present</strong><br/>
                      Rebranded identity detected. Active malware distribution.<br/>
                      <span className="text-emerald-600 dark:text-emerald-400">Confidence: 99% (Infrastructure Match)</span>
                    </div>
                  </div>
                ) : activeModal === 'swarm' ? (
                  <div className="flex flex-col h-[400px]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 shadow-sm">
                        <Cpu className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-lg leading-tight">Swarm Feed Deployed</h4>
                        <div className="text-blue-600 text-xs font-semibold flex items-center gap-1 mt-1">
                          <Activity className="w-3 h-3 animate-pulse" /> Live Forum Interception
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl p-5 overflow-y-auto font-mono text-xs flex flex-col gap-3 shadow-[inset_0_4px_15px_rgba(0,0,0,0.2)] custom-scrollbar">
                      {swarmLogs.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          key={i}
                          className={`p-3 rounded-2xl ${
                            log.type === 'bot' ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50 self-start max-w-[85%] shadow-sm' :
                            log.type === 'target' ? 'bg-slate-800/80 text-slate-300 border border-slate-700 self-end max-w-[85%] shadow-sm' :
                            log.type === 'alert' ? 'bg-red-900/40 text-red-400 border border-red-800/50 text-center w-full font-semibold shadow-[0_0_15px_rgba(220,38,38,0.3)]' :
                            log.type === 'success' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 text-center w-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                            'text-slate-500 text-center text-[10px] tracking-wider uppercase'
                          }`}
                        >
                          {log.msg}
                        </motion.div>
                      ))}
                      {swarmActive && (
                        <div className="text-slate-500 text-center mt-2 flex items-center justify-center gap-2">
                          <Activity className="w-3 h-3 animate-spin" /> Swarm processing...
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeModal === 'proximity' ? (
                  <div className="flex flex-col h-[450px]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200 shadow-sm relative overflow-hidden">
                        <Radar className="w-6 h-6 text-red-600 relative z-10" />
                        <div className="absolute inset-0 bg-red-200/50 animate-ping" />
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-lg leading-tight">Proximity Payload Active</h4>
                        <div className="text-red-600 text-xs font-semibold flex items-center gap-1 mt-1">
                          <Radio className="w-3 h-3 animate-pulse" /> Ultrasonic Beacon Emitting
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center py-6">
                       <div className="relative w-32 h-32 rounded-full border border-red-200/50 flex items-center justify-center">
                          <div className="absolute w-24 h-24 rounded-full border border-red-300/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          <div className="absolute w-16 h-16 rounded-full border border-red-400/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-700" />
                          <Smartphone className="w-8 h-8 text-red-500 relative z-10 drop-shadow-[0_2px_8px_rgba(220,38,38,0.5)]" />
                       </div>
                    </div>

                    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-3xl p-5 overflow-y-auto font-mono text-xs flex flex-col gap-2 shadow-[inset_0_4px_15px_rgba(0,0,0,0.2)] custom-scrollbar">
                      {proximityLogs.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className={`${
                            log.type === 'system' ? 'text-slate-400' :
                            log.type === 'alert' ? 'text-amber-400 font-semibold' :
                            log.type === 'success' ? 'text-emerald-400 font-bold' :
                            'text-slate-500'
                          }`}
                        >
                          {log.msg}
                        </motion.div>
                      ))}
                      {proximityActive && (
                        <div className="text-slate-500 mt-2 flex items-center gap-2">
                          <Activity className="w-3 h-3 animate-spin" /> Awaiting cellular intercept...
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <h4 className="text-slate-800 dark:text-slate-200 mb-8 font-semibold text-sm">Transaction Graph (Mock)</h4>
                    <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/30 p-6 border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-sm">
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs shadow-sm font-semibold dark:text-slate-300">Wallet</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs font-medium">→ 4.5 BTC →</div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-2xl text-xs shadow-sm font-bold">Mixer</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs font-medium">→ 4.4 BTC →</div>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-xs shadow-sm font-semibold dark:text-slate-300">Exchange</div>
                    </div>
                    <p className="mt-8 text-slate-500 dark:text-slate-400 text-xs">Ledger integration active. Tracing heuristic: High-risk mixing service.</p>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
