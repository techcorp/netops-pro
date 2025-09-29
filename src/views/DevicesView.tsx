import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Search, Filter, Plus, CreditCard as Edit, Trash2, Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive, Thermometer, Wifi, Router, Shield, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MetricChart } from '../components/charts/MetricChart';
import { useAppStore } from '../store';
import { format } from 'date-fns';

export const DevicesView: React.FC = () => {
  const { devices, selectedDevice, setSelectedDevice } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  const getDeviceIcon = (role: string) => {
    switch (role) {
      case 'router':
        return Router;
      case 'switch':
        return Server;
      case 'firewall':
        return Shield;
      case 'server':
        return Server;
      case 'ap':
        return Wifi;
      case 'printer':
        return Printer;
      default:
        return Server;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'up':
        return 'success';
      case 'down':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return CheckCircle;
      case 'down':
        return AlertTriangle;
      case 'warning':
        return Clock;
      default:
        return Activity;
    }
  };

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.mgmtIp.includes(searchTerm) ||
                         device.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || device.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'up').length,
    offline: devices.filter(d => d.status === 'down').length,
    warning: devices.filter(d => d.status === 'warning').length,
  };

  const roleStats = devices.reduce((acc, device) => {
    acc[device.role] = (acc[device.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate mock time series for selected device
  const generateDeviceMetrics = () => {
    if (!selectedDevice) return [];
    
    const data = [];
    const now = Date.now();
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
      data.push({
        timestamp,
        cpu: selectedDevice.metrics.cpuUtilization + (Math.random() - 0.5) * 20,
        memory: selectedDevice.metrics.memoryUtilization + (Math.random() - 0.5) * 15,
        temperature: selectedDevice.metrics.temperature + (Math.random() - 0.5) * 5,
      });
    }
    
    return data;
  };

  const handleDeviceClick = (device: any) => {
    setSelectedDevice(device);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {deviceStats.total}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {deviceStats.online}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {deviceStats.warning}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Warning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {deviceStats.offline}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="firewall">Firewall</option>
            <option value="server">Server</option>
            <option value="ap">Access Point</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="up">Online</option>
            <option value="down">Offline</option>
            <option value="warning">Warning</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
            Advanced Filters
          </Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Device
          </Button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredDevices.map((device, index) => {
            const Icon = getDeviceIcon(device.role);
            const StatusIcon = getStatusIcon(device.status);
            
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  hover 
                  onClick={() => handleDeviceClick(device)}
                  className="cursor-pointer"
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          device.status === 'up' ? 'bg-green-100 dark:bg-green-900' :
                          device.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-red-100 dark:bg-red-900'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            device.status === 'up' ? 'text-green-600 dark:text-green-400' :
                            device.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div>
                          <Badge variant={getStatusVariant(device.status)} size="sm">
                            {device.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Device Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {device.hostname}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {device.mgmtIp}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {device.location}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(device.metrics.cpuUtilization)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(device.metrics.memoryUtilization)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.round(device.metrics.temperature)}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {device.interfaces.length} IF
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {device.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {device.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" size="sm" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {device.tags.length > 2 && (
                          <Badge variant="secondary" size="sm" className="text-xs">
                            +{device.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Device Details Modal */}
      <AnimatePresence>
        {showDetails && selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    selectedDevice.status === 'up' ? 'bg-green-100 dark:bg-green-900' :
                    selectedDevice.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    'bg-red-100 dark:bg-red-900'
                  }`}>
                    {React.createElement(getDeviceIcon(selectedDevice.role), {
                      className: `w-6 h-6 ${
                        selectedDevice.status === 'up' ? 'text-green-600 dark:text-green-400' :
                        selectedDevice.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedDevice.hostname}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedDevice.mgmtIp} • {selectedDevice.location}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                          <Badge variant={getStatusVariant(selectedDevice.status)}>
                            {selectedDevice.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                          <span className="text-sm font-medium">{selectedDevice.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Model</span>
                          <span className="text-sm font-medium">{selectedDevice.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
                          <span className="text-sm font-medium">
                            {Math.floor(selectedDevice.metrics.uptime / 86400)}d {Math.floor((selectedDevice.metrics.uptime % 86400) / 3600)}h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                          <span className="text-sm font-medium">
                            {format(new Date(selectedDevice.updatedAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Current Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">CPU Usage</span>
                            <span className="text-sm font-medium">{Math.round(selectedDevice.metrics.cpuUtilization)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${selectedDevice.metrics.cpuUtilization}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</span>
                            <span className="text-sm font-medium">{Math.round(selectedDevice.metrics.memoryUtilization)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${selectedDevice.metrics.memoryUtilization}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
                            <span className="text-sm font-medium">{Math.round(selectedDevice.metrics.temperature)}°C</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${(selectedDevice.metrics.temperature / 70) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interfaces */}
                <Card>
                  <CardHeader>
                    <CardTitle>Network Interfaces ({selectedDevice.interfaces.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-3">Interface</th>
                            <th className="text-left py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Speed</th>
                            <th className="text-left py-2 px-3">Utilization</th>
                            <th className="text-left py-2 px-3">Errors</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDevice.interfaces.slice(0, 10).map((iface) => (
                            <tr key={iface.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-2 px-3 font-medium">{iface.name}</td>
                              <td className="py-2 px-3">
                                <Badge 
                                  variant={iface.status === 'up' ? 'success' : 'danger'} 
                                  size="sm"
                                >
                                  {iface.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-3">{iface.speed}Mbps</td>
                              <td className="py-2 px-3">{Math.round(iface.utilization)}%</td>
                              <td className="py-2 px-3">{iface.errors}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No devices message */}
      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No devices found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first network device.'}
            </p>
            <Button icon={<Plus className="w-4 h-4" />}>
              Add Device
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};