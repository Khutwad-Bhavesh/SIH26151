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
                            // Assign solid colors for nodes
                            const colors = ['#00E5FF', '#FFB300', '#00E676', '#FFFFFF'];
                            return colors[ele.data('cluster') % colors.length];
                        },
                        'border-width': 1,
                        'border-color': '#000000',
                        'label': 'data(id)',
                        'color': '#FFFFFF',
                        'font-family': "'Fira Code', monospace",
                        'font-size': '10px',
                        'text-valign': 'top',
                        'text-halign': 'center',
                        'text-margin-y': -8,
                        'text-outline-color': '#000000',
                        'text-outline-width': 2,
                        'width': 20,
                        'height': 20,
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'mapData(weight, 1, 10, 1, 4)',
                        'line-color': '#333333',
                        'curve-style': 'bezier',
                        'opacity': 1.0,
                        'line-style': 'solid'
                    }
                },
                {
                    selector: 'edge.highlighted',
                    style: {
                        'line-color': '#00E5FF',
                        'width': 2
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

            // Populate Dossier Header
            document.querySelector('#evidence-panel h3').textContent = "LINK ANALYSIS";
            targetLink.textContent = `${source} ↔ ${target}`;
            
            // Restore Score HTML structure
            document.querySelector('.dossier-section:nth-child(2) h4').textContent = "FUSION SCORE";
            document.querySelector('.score-display').innerHTML = `<span id="evidence-weight" class="weight-value">${weight.toFixed(2)}</span><span class="weight-label">/ 10.0</span>`;
            
            const evidenceWeight = document.getElementById("evidence-weight");
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
            document.querySelector('.dossier-section:nth-child(3) h4').textContent = "CORROBORATING EVIDENCE";
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

        cy.on('tap', 'node', function(evt){
            const node = evt.target;
            const data = node.data();
            
            // Populate Dossier for Node
            document.querySelector('#evidence-panel h3').textContent = "TARGET PROFILE";
            targetLink.textContent = `ID: ${data.label}`;
            
            const badge = document.getElementById("confidence-badge");
            badge.textContent = `CLUSTER ID: ${data.cluster}`;
            badge.style.color = "var(--primary-neon)";
            badge.style.borderColor = "var(--primary-neon)";
            
            // Show PGP Key
            document.querySelector('.dossier-section:nth-child(2) h4').textContent = "PRIMARY PGP KEY";
            document.querySelector('.score-display').innerHTML = `<span class="weight-value" style="font-size: 14px; word-break: break-all; color: var(--primary-neon);">${data.pgp}</span>`;
            
            // Show Identifiers
            document.querySelector('.dossier-section:nth-child(3) h4').textContent = "KNOWN IDENTIFIERS";
            evidenceReason.innerHTML = `<ul style="font-size: 13px; color: var(--primary-text);">
                <li style="margin-bottom: 8px;"><strong>BTC:</strong> <span style="font-family: monospace;">${data.btc}</span></li>
                <li><strong>GPU Hash:</strong> <span style="font-family: monospace;">${data.gpu}</span></li>
            </ul>`;
            
            evidencePanel.classList.add("show");
        });
        
        btnCloseDossier.addEventListener("click", () => {
            evidencePanel.classList.remove("show");
            cy.elements().unselect();
        });
        
        cy.on('tap', function(evt){
            if(evt.target === cy){
                evidencePanel.classList.remove("show");
            }
        });
    }
});
