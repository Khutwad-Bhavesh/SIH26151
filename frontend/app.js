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

    // --- 1.5 Live Threat Feed (Mock) ---
    const alertsTicker = document.getElementById("live-alerts-ticker");
    const mockAlerts = [
        "🚨 ACTOR MIGRATION: AlphaFox → DarkFox (99% Conf)",
        "💰 SUSPICIOUS TX: 4.5 BTC to Mixer",
        "🌐 INFRA CHANGE: New Onion Service Detected",
        "🔑 PGP ROTATION: ShadowBroker updated keys",
        "🚨 ALIAS CORRELATION: FoxX matches DarkFox",
        "⚠️ HIGH RISK: ZeroDay.exe payload seen in MarketA"
    ];
    
    setInterval(() => {
        if (Math.random() > 0.4) {
            const alertText = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
            const div = document.createElement("div");
            div.style.color = alertText.includes("🚨") ? "var(--secondary-neon)" : (alertText.includes("💰") ? "#FFB300" : "var(--primary-neon)");
            div.textContent = `[${new Date().toISOString().substring(11, 19)}] ${alertText}`;
            
            alertsTicker.insertBefore(div, alertsTicker.firstChild);
            if (alertsTicker.children.length > 6) {
                alertsTicker.removeChild(alertsTicker.lastChild);
            }
        }
    }, 4500);

    // Modal Elements
    const intelModal = document.getElementById("intel-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");
    const dossierActions = document.getElementById("dossier-actions");

    btnCloseModal.addEventListener("click", () => {
        intelModal.style.opacity = 0;
        setTimeout(() => { intelModal.style.display = "none"; }, 300);
    });

    document.getElementById("btn-view-timeline").addEventListener("click", () => {
        const target = targetLink.textContent.replace("ID: ", "");
        modalTitle.textContent = `TIMELINE INTELLIGENCE: ${target}`;
        modalContent.innerHTML = `
            <div style="border-left: 2px solid var(--primary-neon); padding-left: 15px; margin-left: 10px;">
                <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--primary-neon);"></div>
                    <strong style="color: var(--primary-neon);">2019-2020</strong><br>
                    Initial activity detected on MarketAlpha.<br>
                    <span style="color: var(--text-dim);">Infrastructure: SRV-NGINX-SSH-99X8</span>
                </div>
                <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--secondary-neon);"></div>
                    <strong style="color: var(--secondary-neon);">2021-2022</strong><br>
                    Migration to DreadForum. New PGP generated.<br>
                    <span style="color: var(--text-dim);">Infrastructure remains identical.</span>
                </div>
                <div style="position: relative;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: #FFB300;"></div>
                    <strong style="color: #FFB300;">2023-Present</strong><br>
                    Rebranded identity detected. Active malware distribution.<br>
                    <span style="color: var(--text-dim);">Confidence: 99% (Infrastructure Match)</span>
                </div>
            </div>
        `;
        intelModal.style.display = "flex";
        setTimeout(() => { intelModal.style.opacity = 1; }, 10);
    });

    document.getElementById("btn-trace-ledger").addEventListener("click", () => {
        const target = targetLink.textContent.replace("ID: ", "");
        modalTitle.textContent = `LEDGER TRACE: ${target}`;
        modalContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h4 style="color: #FFB300; margin-bottom: 20px;">TRANSACTION GRAPH (MOCK)</h4>
                <div style="display: flex; justify-content: space-around; align-items: center; background: rgba(0,0,0,0.5); padding: 30px; border-radius: 8px;">
                    <div style="border: 1px solid #FFB300; padding: 10px; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">WALLET</div>
                    <div style="color: var(--primary-neon);">→ 4.5 BTC →</div>
                    <div style="border: 1px solid var(--secondary-neon); padding: 10px; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">MIXER</div>
                    <div style="color: var(--primary-neon);">→ 4.4 BTC →</div>
                    <div style="border: 1px solid #00E676; padding: 10px; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">EXCHANGE</div>
                </div>
                <p style="margin-top: 20px; color: var(--text-dim);">Ledger integration active. Tracing heuristic: High-risk mixing service.</p>
            </div>
        `;
        intelModal.style.display = "flex";
        setTimeout(() => { intelModal.style.opacity = 1; }, 10);
    });

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
                    
                    // Populate Mock Infrastructure Intel
                    document.getElementById("metric-misconfigs").textContent = Math.floor(Math.random() * 5) + 1;
                    document.getElementById("metric-ssl").textContent = Math.floor(Math.random() * 3);
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
            dossierActions.style.display = "none";
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
            dossierActions.style.display = "block";
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
                <li style="margin-bottom: 8px;"><strong>Infra ID:</strong> <span style="font-family: monospace; color: var(--secondary-neon);">${data.infra}</span></li>
                <li style="margin-bottom: 8px;"><strong>Risk Level:</strong> <span style="font-weight: bold; color: ${data.risk === 'Critical' ? 'var(--secondary-neon)' : 'inherit'};">${data.risk}</span></li>
                <li style="margin-bottom: 8px;"><strong>Malware:</strong> ${data.malware}</li>
                <li style="margin-bottom: 8px;"><strong>Domains:</strong> ${data.domains}</li>
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

    // --- 7. Export Functionality ---
    document.getElementById("btn-export-json").addEventListener("click", () => {
        if (!cy) {
            alert("No data to export. Please run a scan first.");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cy.json().elements, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "ATLAS_Intelligence_Report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById("btn-export-csv").addEventListener("click", () => {
        if (!cy) {
            alert("No data to export. Please run a scan first.");
            return;
        }
        const nodes = cy.nodes().map(n => n.data());
        if (nodes.length === 0) return;
        
        const headers = Object.keys(nodes[0]).join(",");
        const rows = nodes.map(n => Object.values(n).map(v => `"${v}"`).join(",")).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", encodeURI(csvContent));
        downloadAnchorNode.setAttribute("download", "ATLAS_Node_Report.csv");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById("btn-export-pdf").addEventListener("click", () => {
        if (!evidencePanel.classList.contains("show")) {
            alert("No dossier selected. Please click on a target node first to generate a report.");
            return;
        }
        
        const printElement = evidencePanel.cloneNode(true);
        // Force dark mode styles to printable styles
        printElement.style.background = "#1a1a2e";
        printElement.style.padding = "20px";
        printElement.style.border = "1px solid #000";
        
        // Remove close button and action buttons for print
        const closeBtn = printElement.querySelector('.btn-close');
        if(closeBtn) closeBtn.remove();
        
        const actionsPane = printElement.querySelector('#dossier-actions');
        if(actionsPane) actionsPane.remove();
        
        // Convert text area to a div for printing
        const notesArea = printElement.querySelector('#analyst-notes');
        if (notesArea) {
            const notesText = notesArea.value;
            const newDiv = document.createElement('div');
            newDiv.style.border = "1px solid #ccc";
            newDiv.style.padding = "10px";
            newDiv.style.marginTop = "5px";
            newDiv.style.fontSize = "12px";
            newDiv.style.whiteSpace = "pre-wrap";
            newDiv.textContent = notesText || "No analyst notes provided.";
            notesArea.parentNode.replaceChild(newDiv, notesArea);
        }
        
        const opt = {
          margin:       0.5,
          filename:     'ATLAS_Executive_Report.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(printElement).save();
    });
});
