import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Filter, Search, RefreshCw, Layers, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TopologyMap } from '../components/charts/TopologyMap';
import { useAppStore } from '../store';

export const TopologyView: React.FC = () => {
  const { devices, selectedDevice, setSelectedDevice } = useAppStore();
  const [viewMode, setViewMode] = useState<'physical' | 'logical' | 'layer2' | 'layer3'>('physical');
  const [showFilters, setShowFilters] = useState(false);

  // Create topology data from devices
  const topologyNodes = devices.map((device, index) => ({
    id: device.id,
    type: 'device' as const,
    label: device.hostname.split('.')[0],
    deviceRole: device.role,
    status: device.status,
    metrics: {
      cpu: device.metrics.cpuUtilization,
      memory: device.metrics.memoryUtilization,
      utilization: Math.random() * 100, // Mock interface utilization
    },
  }));

  // Generate mock edges based on device relationships
  const topologyEdges = [];
  const coreDevices = devices.filter(d => d.role === 'router' || d.role === 'switch').slice(0, 3);
  const accessDevices = devices.filter(d => d.role !== 'router' && d.role !== 'switch');

  // Core interconnections
  for (let i = 0; i < coreDevices.length - 1; i++) {
    topologyEdges.push({
      id: `core-${i}-${i+1}`,
      source: coreDevices[i].id,
      target: coreDevices[i + 1].id,
      type: 'physical' as const,
      status: Math.random() > 0.1 ? 'up' as const : 'down' as const,
      bandwidth: 10000, // 10Gbps
      utilization: Math.random() * 100,
      protocol: 'ethernet' as const,
    });
  }

  // Access device connections to core
  accessDevices.forEach((device, index) => {
    const coreDevice = coreDevices[index % coreDevices.length];
    if (coreDevice) {
      topologyEdges.push({
        id: `access-${device.id}`,
        source: coreDevice.id,
        target: device.id,
        type: 'physical' as const,
        status: device.status === 'up' ? 'up' as const : 'down' as const,
        bandwidth: device.role === 'server' ? 1000 : 100,
        utilization: Math.random() * 100,
        protocol: 'ethernet' as const,
      });
    }
  });

  const viewModes = [
    { id: 'physical', label: 'Physical', description: 'Physical network connections' },
    { id: 'logical', label: 'Logical', description: 'Logical network topology' },
    { id: 'layer2', label: 'Layer 2', description: 'Switch and VLAN topology' },
    { id: 'layer3', label: 'Layer 3', description: 'Router and subnet topology' },
  ];

  const stats = [
    { label: 'Total Nodes', value: topologyNodes.length },
    { label: 'Active Links', value: topologyEdges.filter(e => e.status === 'up').length },
    { label: 'Failed Links', value: topologyEdges.filter(e => e.status !== 'up').length },
    { label: 'Network Health', value: `${Math.round((topologyEdges.filter(e => e.status === 'up').length / topologyEdges.length) * 100)}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-500" />
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topology..."
              className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device Type
                  </label>
                  <select className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                    <option value="">All Types</option>
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="firewall">Firewall</option>
                    <option value="server">Server</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                    <option value="">All Status</option>
                    <option value="up">Online</option>
                    <option value="down">Offline</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <select className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                    <option value="">All Locations</option>
                    <option value="dc1">DC1</option>
                    <option value="dc2">DC2</option>
                    <option value="office">Office</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Utilization
                  </label>
                  <select className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                    <option value="">Any</option>
                    <option value="high">High (&gt;80%)</option>
                    <option value="medium">Medium (50-80%)</option>
                    <option value="low">Low (&lt;50%)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Topology View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Topology - {viewModes.find(m => m.id === viewMode)?.label}
              </span>
              <Badge variant="info" size="sm">
                {viewModes.find(m => m.id === viewMode)?.description}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TopologyMap
              nodes={topologyNodes}
              edges={topologyEdges}
              onNodeClick={setSelectedDevice}
              height={600}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Device Types
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔀</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Router</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🖧</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Switch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Firewall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🖥️</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Server</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Status Colors
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4" />
                View Layer 2 Details
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <RefreshCw className="w-4 h-4" />
                Auto-discover Devices
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Network className="w-4 h-4" />
                Export Topology
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connection Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Links</span>
                <span className="text-sm font-medium">{topologyEdges.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Links</span>
                <span className="text-sm font-medium text-green-600">
                  {topologyEdges.filter(e => e.status === 'up').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Failed Links</span>
                <span className="text-sm font-medium text-red-600">
                  {topologyEdges.filter(e => e.status === 'down').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</span>
                <span className="text-sm font-medium">
                  {Math.round(topologyEdges.reduce((sum, e) => sum + (e.utilization || 0), 0) / topologyEdges.length)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};