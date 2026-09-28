import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to mock the backend API during development
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.startsWith('/api/graph')) {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const targetQuery = url.searchParams.get('target')
        const targetNameResolved = targetQuery ? targetQuery : 'DarkFox'
        
        const mockResult = {
          status: "success",
          data: {
            nodes: [
              { data: { id: 'target', label: targetNameResolved, cluster: 'Core Identity', risk: 'Critical', btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', pgp: '0x94B73A...', malware: 'FoxRAT_v2' } },
              { data: { id: 'market', label: 'BreachForums', cluster: 'Infrastructure', risk: 'High', btc: 'N/A', pgp: 'N/A', malware: 'N/A' } },
              { data: { id: 'btc1', label: 'Mixer (Wasabi)', cluster: 'Finance', risk: 'Medium', btc: 'bc1q9m4...', pgp: 'N/A', malware: 'N/A' } },
              { data: { id: 'vpn1', label: 'Mullvad Exit (SE)', cluster: 'Network', risk: 'Low', btc: 'N/A', pgp: 'N/A', malware: 'N/A' } },
              { data: { id: 'dread', label: 'Dread Forum', cluster: 'Infrastructure', risk: 'High', btc: 'N/A', pgp: 'N/A', malware: 'N/A' } },
              { data: { id: 'alias2', label: 'FoxX (Telegram)', cluster: 'Alias', risk: 'High', btc: 'N/A', pgp: 'N/A', malware: 'N/A' } },
              { data: { id: 'server', label: 'Bulletproof Host (RU)', cluster: 'Infrastructure', risk: 'Critical', btc: 'N/A', pgp: 'N/A', malware: 'N/A' } },
            ],
            edges: [
              { data: { id: 'e1', source: 'target', target: 'market', weight: 8.5, reason: 'Forum Admin Rights' } },
              { data: { id: 'e2', source: 'target', target: 'btc1', weight: 9.2, reason: 'Known Payout Address' } },
              { data: { id: 'e3', source: 'target', target: 'vpn1', weight: 4.1, reason: 'Historical IP Correlation' } },
              { data: { id: 'e4', source: 'target', target: 'alias2', weight: 9.9, reason: 'Stylometric Match (99%)' } },
              { data: { id: 'e5', source: 'alias2', target: 'dread', weight: 7.5, reason: 'Active Vendor Profile' } },
              { data: { id: 'e6', source: 'market', target: 'server', weight: 8.8, reason: 'Shared ASN' } },
              { data: { id: 'e7', source: 'dread', target: 'server', weight: 3.2, reason: 'DNS Overlap' } },
            ]
          }
        }
        
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(mockResult))
        return
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mockApiPlugin(),
  ],
  build: {
    outDir: '../frontend',
    emptyOutDir: false
  }
})
