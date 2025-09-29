import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './views/OverviewView';
import { TopologyView } from './views/TopologyView';
import { DevicesView } from './views/DevicesView';
import { AlertsView } from './views/AlertsView';
import { AIAnalyticsView } from './views/AIAnalyticsView';
import { useAppStore } from './store';

// View components mapping
const views = {
  overview: {
    component: OverviewView,
    title: 'Network Overview',
    subtitle: 'Comprehensive network health and performance monitoring',
  },
  topology: {
    component: TopologyView,
    title: 'Network Topology',
    subtitle: 'Visualize and manage your network infrastructure',
  },
  devices: {
    component: DevicesView,
    title: 'Device Management',
    subtitle: 'Monitor and configure network devices',
  },
  interfaces: {
    component: DevicesView, // Reuse devices view for now
    title: 'Interface Monitoring',
    subtitle: 'Track interface performance and utilization',
  },
  alerts: {
    component: AlertsView,
    title: 'Alert Management',
    subtitle: 'Monitor and respond to network alerts',
  },
  monitoring: {
    component: OverviewView, // Reuse overview for now
    title: 'Performance Monitoring',
    subtitle: 'Real-time network performance metrics',
  },
  security: {
    component: AlertsView, // Reuse alerts view for now
    title: 'Security Monitoring',
    subtitle: 'Network security events and compliance',
  },
  'ai-analytics': {
    component: AIAnalyticsView,
    title: 'AI Analytics',
    subtitle: 'Machine learning insights and predictions',
  },
  flows: {
    component: OverviewView, // Placeholder
    title: 'Flow Analysis',
    subtitle: 'Network traffic flow analysis and insights',
  },
  compliance: {
    component: AlertsView, // Placeholder
    title: 'Compliance',
    subtitle: 'Regulatory compliance and reporting',
  },
  users: {
    component: OverviewView, // Placeholder
    title: 'User Management',
    subtitle: 'Manage users and permissions',
  },
  settings: {
    component: OverviewView, // Placeholder
    title: 'Settings',
    subtitle: 'System configuration and preferences',
  },
};

function App() {
  const [currentView, setCurrentView] = useState('overview');
  const { darkMode, initialize, loading } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentViewConfig = views[currentView as keyof typeof views];
  const ViewComponent = currentViewConfig?.component || OverviewView;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading Network Operations Platform...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header 
              title={currentViewConfig?.title || 'Network Overview'}
              subtitle={currentViewConfig?.subtitle}
            />
            
            {/* View Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ViewComponent />
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;