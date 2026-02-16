import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AgentProfile from './pages/AgentProfile';
import Overview from './pages/Overview';
import CreateTask from './pages/CreateTask';
import Leaderboard from './pages/Leaderboard';
import TaskHistory from './pages/TaskHistory';
import GetZen from './pages/GetZen'

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/agents/:agentName" element={<AgentProfile />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/create-task" element={<CreateTask />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/history" element={<TaskHistory />} />
                    <Route path="/get-zen" element={<GetZen />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;