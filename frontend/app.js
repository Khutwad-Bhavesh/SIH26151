document.addEventListener("DOMContentLoaded", () => {
    const btnRunScan = document.getElementById("btn-run-scan");
    const statusIndicator = document.getElementById("scan-status");
    const overlay = document.getElementById("overlay");
    const nodeMetric = document.getElementById("metric-nodes");
    const edgeMetric = document.getElementById("metric-edges");
    
    const evidencePanel = document.getElementById("evidence-panel");
    const evidenceReason = document.getElementById("evidence-reason");
    const evidenceWeight = document.getElementById("evidence-weight");

    let cy = null;

    btnRunScan.addEventListener("click", async () => {
        // UI Loading State
        btnRunScan.disabled = true;
        btnRunScan.textContent = "Processing OSINT Data...";
        statusIndicator.textContent = "[!] Fetching Graph from API";
        statusIndicator.style.color = "var(--primary-neon)";
        overlay.style.opacity = 0;

        try {
            // Fetch data from FastAPI Backend (Relative URL for deployment portability)
            const response = await fetch("/api/graph");
            const result = await response.json();
            
            if (result.status === "success") {
                renderGraph(result.data.nodes, result.data.edges);
                statusIndicator.textContent = "Scan Complete: Clusters Detected";
                statusIndicator.style.color = "#4ade80"; // green
                
                nodeMetric.textContent = result.data.nodes.length;
                edgeMetric.textContent = result.data.edges.length;
            } else {
                throw new Error("API Error");
            }
        } catch (error) {
            console.error("Failed to fetch graph data:", error);
            statusIndicator.textContent = "ERR: Backend Offline";
            statusIndicator.style.color = "var(--secondary-neon)";
            overlay.style.opacity = 1;
            overlay.innerHTML = "<h2>Error connecting to backend API.</h2>";
        } finally {
            btnRunScan.disabled = false;
            btnRunScan.textContent = "Execute OSINT Scan";
        }
    });

    function renderGraph(nodes, edges) {
        // Destroy existing graph if it exists
        if (cy) { cy.destroy(); }

        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: { nodes: nodes, edges: edges },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#1e293b',
                        'border-width': 2,
                        'border-color': 'var(--primary-neon)',
                        'label': 'data(label)',
                        'color': '#e2e8f0',
                        'font-family': 'Inter',
                        'font-size': '12px',
                        'text-valign': 'bottom',
                        'text-margin-y': 8,
                        'width': 40,
                        'height': 40,
                        'text-outline-color': '#0b0e14',
                        'text-outline-width': 2
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 'mapData(weight, 0, 8, 1, 6)',
                        'line-color': 'var(--secondary-neon)',
                        'curve-style': 'bezier',
                        'opacity': 0.6
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'background-color': 'var(--primary-neon)',
                        'border-color': '#fff'
                    }
                },
                {
                    selector: 'edge:selected',
                    style: {
                        'line-color': '#fff',
                        'opacity': 1,
                        'width': 4
                    }
                }
            ],
            layout: {
                name: 'cose', // force-directed layout
                padding: 50,
                animate: true,
                animationDuration: 1000
            }
        });

        // Add Interactivity
        cy.on('tap', 'edge', function(evt){
            const edge = evt.target;
            evidencePanel.style.display = 'block';
            
            // Handle fused multi-signal reasons
            const rawReason = edge.data('reason');
            if (rawReason.includes(' | ')) {
                const reasonsList = rawReason.split(' | ').map(r => `<li>${r}</li>`).join('');
                evidenceReason.innerHTML = `<ul>${reasonsList}</ul>`;
            } else {
                evidenceReason.innerHTML = rawReason;
            }
            
            evidenceWeight.textContent = parseFloat(edge.data('weight')).toFixed(2);
        });

        cy.on('tap', 'node', function(evt){
            // Hide evidence panel if node is clicked
            evidencePanel.style.display = 'none';
        });
        
        cy.on('tap', function(evt){
            if(evt.target === cy){
                evidencePanel.style.display = 'none';
            }
        });
    }
});
