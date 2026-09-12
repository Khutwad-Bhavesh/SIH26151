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
        "[ALERT] ACTOR MIGRATION: AlphaFox → DarkFox (99% Conf)",
        "[FINANCE] SUSPICIOUS TX: 4.5 BTC to Mixer",
        "[INFRA] INFRA CHANGE: New Onion Service Detected",
        "[KEY] PGP ROTATION: ShadowBroker updated keys",
        "[ALERT] ALIAS CORRELATION: FoxX matches DarkFox",
        "[RISK] HIGH RISK: ZeroDay.exe payload seen in MarketA"
    ];
    
    setInterval(() => {
        if (Math.random() > 0.4) {
            const alertText = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
            const div = document.createElement("div");
            div.style.color = alertText.includes("[ALERT]") || alertText.includes("[RISK]") ? "var(--secondary-neon)" : (alertText.includes("[FINANCE]") ? "#FFB300" : "var(--primary-neon)");
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
            <div style="border-left: 2px solid var(--signal); padding-left: 15px; margin-left: 10px;">
                <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--signal);"></div>
                    <strong style="color: var(--signal);">2019-2020</strong><br>
                    Initial activity detected on MarketAlpha.<br>
                    <span style="color: var(--fog);">Infrastructure: SRV-NGINX-SSH-99X8</span>
                </div>
                <div style="position: relative; margin-bottom: 20px;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--signal);"></div>
                    <strong style="color: var(--signal);">2021-2022</strong><br>
                    Migration to DreadForum. New PGP generated.<br>
                    <span style="color: var(--fog);">Infrastructure remains identical.</span>
                </div>
                <div style="position: relative;">
                    <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--signal);"></div>
                    <strong style="color: var(--signal);">2023-Present</strong><br>
                    Rebranded identity detected. Active malware distribution.<br>
                    <span style="color: var(--fog);">Confidence: 99% (Infrastructure Match)</span>
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
                <h4 style="color: var(--signal); margin-bottom: 20px;">TRANSACTION GRAPH (MOCK)</h4>
                <div style="display: flex; justify-content: space-around; align-items: center; background: rgba(0,0,0,0.3); padding: 30px; border-radius: 8px;">
                    <div style="border: 1px solid var(--line); padding: 10px; border-radius: 4px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">WALLET</div>
                    <div style="color: var(--fog);">→ 4.5 BTC →</div>
                    <div style="border: 1px solid var(--signal); padding: 10px; border-radius: 4px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: var(--signal);">MIXER</div>
                    <div style="color: var(--fog);">→ 4.4 BTC →</div>
                    <div style="border: 1px solid var(--line); padding: 10px; border-radius: 4px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">EXCH.</div>
                </div>
                <p style="margin-top: 20px; color: var(--fog);">Ledger integration active. Tracing heuristic: High-risk mixing service.</p>
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
                        'background-color': '#E8A33D', // Gold theme
                        'label': 'data(id)',
                        'color': '#FFFFFF',
                        'font-size': '11px',
                        'font-weight': '500',
                        'font-family': 'IBM Plex Mono',
                        'text-valign': 'bottom',
                        'text-margin-y': '8px',
                        'text-background-color': '#0D1013',
                        'text-background-opacity': 0.85,
                        'text-background-padding': '4px',
                        'text-background-shape': 'roundrectangle',
                        'border-color': '#FFFFFF',
                        'border-width': 1.5,
                        'width': 24,
                        'height': 24,
                        'shape': 'hexagon',
                        'shadow-blur': 15,
                        'shadow-color': '#E8A33D',
                        'shadow-opacity': 0.8
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'data(weight)',
                        'line-color': '#E8A33D',
                        'curve-style': 'bezier',
                        'opacity': 0.25
                    }
                },
                {
                    selector: '.highlighted',
                    style: {
                        'background-color': '#00E5FF', // Neon Cyan
                        'border-color': '#FFFFFF',
                        'border-width': 3,
                        'shadow-color': '#00E5FF',
                        'shadow-blur': 25,
                        'shadow-opacity': 1
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
            
            const conf = weight * 10;
            badge.textContent = conf >= 80 ? 'CRITICAL MATCH' : (conf >= 50 ? 'HIGH CONFIDENCE' : 'POSSIBLE LINK');
            badge.style.background = conf >= 80 ? 'var(--signal)' : 'var(--line)';
            badge.style.color = conf >= 80 ? 'var(--ink)' : 'var(--fog)';
            evidenceWeight.style.color = "var(--signal)";

            // Render Reasons
            document.querySelector('.dossier-section:nth-child(3) h4').textContent = "CORROBORATING EVIDENCE";
            const rawReason = edge.data('reason');
            if (rawReason && rawReason.includes(' | ')) {
                const reasonsList = rawReason.split(' | ').map(r => `<li>${r}</li>`).join('');
                evidenceReason.innerHTML = `<ul>${reasonsList}</ul>`;
            } else if (rawReason) {
                evidenceReason.innerHTML = `<ul><li>${rawReason}</li></ul>`;
            } else {
                evidenceReason.innerHTML = '';
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
            badge.style.color = "var(--signal)";
            badge.style.borderColor = "var(--signal)";
            
            // Show PGP Key
            document.querySelector('.dossier-section:nth-child(2) h4').textContent = "PRIMARY PGP KEY";
            document.querySelector('.score-display').innerHTML = `<span class="weight-value" style="font-size: 14px; word-break: break-all; color: var(--signal);">${data.pgp}</span>`;
            
            // Show Identifiers
            document.querySelector('.dossier-section:nth-child(3) h4').textContent = "KNOWN IDENTIFIERS";
            evidenceReason.innerHTML = `<ul style="font-size: 13px; color: var(--paper);">
                <li style="margin-bottom: 8px;"><strong>BTC:</strong> <span style="font-family: 'IBM Plex Mono', monospace;">${data.btc}</span></li>
                <li style="margin-bottom: 8px;"><strong>Infra ID:</strong> <span style="font-family: 'IBM Plex Mono', monospace; color: var(--signal);">${data.infra}</span></li>
                <li style="margin-bottom: 8px;"><strong>Risk Level:</strong> <span style="font-weight: 500; color: ${data.risk === 'Critical' ? 'var(--signal)' : 'inherit'};">${data.risk}</span></li>
                <li style="margin-bottom: 8px;"><strong>Malware:</strong> ${data.malware}</li>
                <li style="margin-bottom: 8px;"><strong>Domains:</strong> ${data.domains}</li>
                <li><strong>GPU Hash:</strong> <span style="font-family: 'IBM Plex Mono', monospace;">${data.gpu}</span></li>
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
        const jsonStr = JSON.stringify(cy.json().elements, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.href = url;
        downloadAnchorNode.download = "ATLAS_Intelligence_Report.json";
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
        const csvContent = headers + "\n" + rows;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.href = url;
        downloadAnchorNode.download = "ATLAS_Node_Report.csv";
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById("btn-export-pdf").addEventListener("click", () => {
        if (!evidencePanel.classList.contains("show")) {
            alert("No dossier selected. Please click on a target node first to generate a report.");
            return;
        }
        // Create a normalized clone for html2canvas to render reliably
        const clone = evidencePanel.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.top = "0";
        clone.style.left = "0";
        clone.style.zIndex = "-9999"; // Hide behind everything
        clone.style.width = "400px";
        clone.style.background = "#0D1013"; // Force solid background
        clone.style.border = "1px solid #E8A33D"; // Add a nice gold border for the report
        clone.style.transform = "none";
        clone.style.transition = "none";
        clone.style.opacity = "1";
        
        // Remove interactive elements from the clone
        const cloneActions = clone.querySelector('#dossier-actions');
        if (cloneActions) cloneActions.remove();
        const cloneClose = clone.querySelector('.btn-close');
        if (cloneClose) cloneClose.remove();
        
        // Convert text area to a printable div
        const originalNotes = document.getElementById('analyst-notes');
        const cloneNotes = clone.querySelector('#analyst-notes');
        if (cloneNotes && originalNotes) {
            const newDiv = document.createElement('div');
            newDiv.style.border = "1px solid var(--line)";
            newDiv.style.padding = "10px";
            newDiv.style.marginTop = "5px";
            newDiv.style.fontSize = "12px";
            newDiv.style.whiteSpace = "pre-wrap";
            newDiv.style.color = "var(--paper)";
            newDiv.textContent = originalNotes.value || "No analyst notes provided.";
            cloneNotes.parentNode.replaceChild(newDiv, cloneNotes);
        }
        
        // Append to DOM so html2canvas can calculate its geometry
        document.body.appendChild(clone);
        
        const opt = {
          margin:       0.2,
          filename:     'ATLAS_Executive_Report.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            // Clean up the clone after PDF is generated
            clone.remove();
        });
    });
});
