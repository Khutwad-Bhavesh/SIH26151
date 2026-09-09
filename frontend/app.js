document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const bootSequence = document.getElementById("boot-sequence");
    const bootText = document.getElementById("boot-text");
    const mainApp = document.getElementById("main-app");
    const btnRunScan = document.getElementById("btn-run-scan");
    const terminalLog = document.getElementById("terminal-log");
    const overlay = document.getElementById("overlay");
    
    // Metrics
    const metricNodes = document.getElementById("metric-nodes");
    const metricEdges = document.getElementById("metric-edges");
    const metricConfidence = document.getElementById("metric-confidence");
    
    // Dossier Panel
    const evidencePanel = document.getElementById("evidence-panel");
    const btnCloseDossier = document.getElementById("btn-close-dossier");
    const targetLink = document.getElementById("target-link");
    const evidenceReason = document.getElementById("evidence-reason");
    const evidenceWeight = document.getElementById("evidence-weight");

    let cy = null;

    // --- 1. Boot Sequence Animation ---
    const bootLines = [
        "> NTRO KERNEL v4.9.1 BOOTING...",
        "> ESTABLISHING SECURE UPLINK...",
        "> UPLINK ESTABLISHED.",
        "> LOADING OSINT MODULES...",
        "> MODULES LOADED. INITIALIZING UI..."
    ];
    
    let bootIndex = 0;
    
    function typeBootLine() {
        if (bootIndex < bootLines.length) {
            bootText.innerHTML += bootLines[bootIndex] + "<br>";
            bootIndex++;
            setTimeout(typeBootLine, Math.random() * 200 + 100);
        } else {
            setTimeout(() => {
                bootSequence.style.opacity = 0;
                mainApp.style.opacity = 1;
                setTimeout(() => bootSequence.remove(), 500);
            }, 800);
        }
    }
    
    // Start boot sequence
    setTimeout(typeBootLine, 500);

    // --- 2. Clock ---
    setInterval(() => {
        const now = new Date();
        document.getElementById("nav-clock").textContent = now.toISOString().substring(11, 19) + " UTC";
    }, 1000);

    // --- 3. Terminal Logger ---
    function logToTerminal(message, type = "normal") {
        const div = document.createElement("div");
        div.className = `log-line log-${type}`;
        div.textContent = `> ${message}`;
        terminalLog.appendChild(div);
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    // --- 4. Scan Execution ---
    btnRunScan.addEventListener("click", async () => {
        if (btnRunScan.disabled) return;
        
        btnRunScan.disabled = true;
        btnRunScan.querySelector('.btn-text').textContent = "SCAN IN PROGRESS...";
        overlay.style.opacity = 0;
        
        // Clear previous graph
        if (cy) { cy.destroy(); cy = null; }
        evidencePanel.classList.remove("show");

        // Read target input
        const targetInput = document.getElementById("target-input").value.trim();
        const targetName = targetInput ? `[${targetInput}]` : "BROAD NETWORK";

        // Staged delay to simulate heavy processing
        terminalLog.innerHTML = "";
        
        if (targetInput) {
            logToTerminal(`TARGET LOCK: ${targetName}`, "warn");
            logToTerminal(`ISOLATING TARGET FOOTPRINT...`, "normal");
        } else {
            logToTerminal("EXECUTING BROAD NETWORK SWEEP...", "normal");
        }
        
        const scanSteps = [
            { msg: `Extracting Signatures for ${targetName}...`, delay: 800 },
            { msg: `Computing stylometric embeddings...`, delay: 1500 },
            { msg: `Running temporal correlation...`, delay: 2200 },
            { msg: `Fusing confidence signals...`, delay: 2900 }
        ];

        scanSteps.forEach(step => {
            setTimeout(() => logToTerminal(step.msg, "normal"), step.delay);
        });

        // Actually fetch the data after the fake delay
        setTimeout(async () => {
            try {
                logToTerminal("Fetching Graph Data...", "normal");
                const url = targetInput ? `/api/graph?target=${encodeURIComponent(targetInput)}` : "/api/graph";
                const response = await fetch(url);
                const result = await response.json();
                
                if (result.status === "success") {
                    logToTerminal("CLUSTERS DETECTED.", "success");
                    renderGraph(result.data.nodes, result.data.edges);
                    
                    metricNodes.textContent = result.data.nodes.length;
                    metricEdges.textContent = result.data.edges.length;
                    
                    // Calc average confidence
                    if (result.data.edges.length > 0) {
                        const totalWeight = result.data.edges.reduce((sum, e) => sum + e.data.weight, 0);
                        const avg = totalWeight / result.data.edges.length;
                        metricConfidence.textContent = (avg * 10).toFixed(1) + "%";
                    } else {
                        metricConfidence.textContent = "0.0%";
                    }
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error(error);
                let errMsg = error.message;
                if (errMsg.includes("not found")) {
                    logToTerminal(`ERROR: TARGET [${targetInput}] NOT IN DATABASE`, "warn");
                    overlay.style.opacity = 1;
                    overlay.innerHTML = `<div class="waiting-box"><h2>TARGET NOT FOUND</h2><p>No footprint exists for ${targetInput}</p></div>`;
                } else {
                    logToTerminal("SYSTEM ERROR: API OFFLINE", "warn");
                    overlay.style.opacity = 1;
                    overlay.innerHTML = `<div class="waiting-box"><h2>API ERROR</h2><p>Connection Refused</p></div>`;
                }
            } finally {
                btnRunScan.disabled = false;
                btnRunScan.querySelector('.btn-text').textContent = "INITIALIZE OSINT SCAN";
            }
        }, 3500); // Wait 3.5s before rendering
    });

    // --- 5. Graph Rendering ---
    function renderGraph(nodes, edges) {
        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': function(ele) {
                            const palette = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
                            const cid = ele.data('cluster');
                            return (cid !== undefined && cid >= 0) ? palette[cid % palette.length] : '#1e293b';
                        },
                        'border-width': 2,
                        'border-color': 'rgba(255,255,255,0.8)',
                        'label': 'data(label)',
                        'color': '#f8fafc',
                        'font-family': 'JetBrains Mono',
                        'font-size': '14px',
                        'font-weight': 'bold',
                        'text-valign': 'bottom',
                        'text-margin-y': 10,
                        'width': 45,
                        'height': 45,
                        'text-outline-color': '#050810',
                        'text-outline-width': 3
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'mapData(weight, 0, 8, 2, 8)',
                        'line-color': function(ele) {
                            // High confidence = green, low = dim blue
                            return ele.data('weight') > 4 ? 'var(--high-conf)' : 'rgba(0, 240, 255, 0.4)';
                        },
                        'curve-style': 'bezier',
                        'opacity': 0.8,
                        'line-style': 'dashed',
                        'line-dash-pattern': [10, 5],
                        'line-dash-offset': 0
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': 4,
                        'border-color': 'var(--primary-neon)',
                        'shadow-blur': 15,
                        'shadow-color': 'var(--primary-neon)'
                    }
                }
            ],
            layout: {
                name: 'cose',
                padding: 50,
                animate: true,
                animationDuration: 1500,
                nodeRepulsion: 400000,
                idealEdgeLength: 100
            }
        });

        // Edge Marching Ants Animation
        let offset = 0;
        setInterval(() => {
            offset -= 2;
            cy.edges().style('line-dash-offset', offset);
        }, 50);

        // --- 6. Interactivity (Dossier Panel) ---
        cy.on('tap', 'edge', function(evt){
            const edge = evt.target;
            const source = cy.getElementById(edge.data('source')).data('label');
            const target = cy.getElementById(edge.data('target')).data('label');
            const weight = parseFloat(edge.data('weight'));

            // Populate Dossier
            targetLink.textContent = `${source} ↔ ${target}`;
            evidenceWeight.textContent = weight.toFixed(2);
            
            const badge = document.getElementById("confidence-badge");
            if (weight > 6) {
                badge.textContent = "CRITICAL MATCH";
                badge.style.color = "var(--secondary-neon)";
                badge.style.borderColor = "var(--secondary-neon)";
                evidenceWeight.style.color = "var(--secondary-neon)";
            } else if (weight > 3) {
                badge.textContent = "HIGH CONFIDENCE";
                badge.style.color = "var(--high-conf)";
                badge.style.borderColor = "var(--high-conf)";
                evidenceWeight.style.color = "var(--primary-neon)";
            } else {
                badge.textContent = "POSSIBLE LINK";
                badge.style.color = "var(--text-dim)";
                badge.style.borderColor = "var(--text-dim)";
                evidenceWeight.style.color = "var(--primary-neon)";
            }

            // Render Reasons
            const rawReason = edge.data('reason');
            if (rawReason.includes(' | ')) {
                const reasonsList = rawReason.split(' | ').map(r => `<li>${r}</li>`).join('');
                evidenceReason.innerHTML = `<ul>${reasonsList}</ul>`;
            } else {
                evidenceReason.innerHTML = `<ul><li>${rawReason}</li></ul>`;
            }

            // Show Panel
            evidencePanel.classList.add("show");
        });

        btnCloseDossier.addEventListener("click", () => {
            evidencePanel.classList.remove("show");
            cy.elements().unselect();
        });

        cy.on('tap', 'node', function(){
            evidencePanel.classList.remove("show");
        });
        
        cy.on('tap', function(evt){
            if(evt.target === cy){
                evidencePanel.classList.remove("show");
            }
        });
    }
});
