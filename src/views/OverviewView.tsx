import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Server, 
  TrendingUp, 
  Shield, 
  Wifi,
  Clock,
  Users,
  Network,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MetricChart } from '../components/charts/MetricChart';
import { TopologyMap } from '../components/charts/TopologyMap';
import { useAppStore } from '../store';

// Generate mock time series data
const generateTimeSeriesData = (hours: number = 24, anomalies: boolean = false) => {
  const data = [];
  const now = Date.now();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
    const baseValue = 30 + Math.sin(i / 4) * 20 + Math.random() * 10;
    const isAnomaly = anomalies && Math.random() < 0.05;
    
    data.push({
      timestamp,
      value: isAnomaly ? baseValue + 40 + Math.random() * 20 : baseValue,
      baseline: 50,
      upperBound: 70,
      lowerBound: 30,
      anomaly: isAnomaly,
    });
  }
  
  return data;
};

export const OverviewView: React.FC = () => {
  const { devices, alerts, anomalies, currentTenant } = useAppStore();

  const upDevices = devices.filter(d => d.status === 'up').length;
  const downDevices = devices.filter(d => d.status === 'down').length;
  const warningDevices = devices.filter(d => d.status === 'warning').length;
  
  const activeAlerts = alerts.filter(a => a.state === 'firing');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  
  const avgCpuUtilization = devices.reduce((sum, d) => sum + d.metrics.cpuUtilization, 0) / devices.length;
  const avgMemoryUtilization = devices.reduce((sum, d) => sum + d.metrics.memoryUtilization, 0) / devices.length;

  // Mock topology data
  const topologyNodes = devices.slice(0, 10).map((device, index) => ({
    id: device.id,
    type: 'device' as const,
    label: device.hostname.split('.')[0],
    deviceRole: device.role,
    status: device.status,
    metrics: {
      cpu: device.metrics.cpuUtilization,
      memory: device.metrics.memoryUtilization,
      utilization: Math.random() * 100,
    },
    position: {
      x: 200 + (index % 4) * 150,
      y: 200 + Math.floor(index / 4) * 150,
    },
  }));

  const topologyEdges = topologyNodes.slice(1).map((node, index) => ({
    id: `edge-${index}`,
    source: topologyNodes[0].id,
    target: node.id,
    type: 'physical' as const,
    status: Math.random() > 0.1 ? 'up' as const : 'down' as const,
    bandwidth: 1000,
    utilization: Math.random() * 100,
    protocol: 'ethernet' as const,
  }));

  // Mock metric data
  const cpuData = generateTimeSeriesData(24, true);
  const trafficData = generateTimeSeriesData(24).map(d => ({
    ...d,
    value: d.value * 1000000, // Convert to bytes for traffic
  }));
  const latencyData = generateTimeSeriesData(24).map(d => ({
    ...d,
    value: d.value / 10, // Convert to milliseconds
  }));

  const stats = [
    {
      title: 'Total Devices',
      value: devices.length,
      change: '+12%',
      trend: 'up',
      icon: Server,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts.length,
      change: criticalAlerts.length > 0 ? `${criticalAlerts.length} critical` : 'No critical',
      trend: criticalAlerts.length > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: criticalAlerts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Network Health',
      value: `${Math.round((upDevices / devices.length) * 100)}%`,
      change: `${upDevices}/${devices.length} online`,
      trend: upDevices > devices.length * 0.9 ? 'up' : 'down',
      icon: Activity,
      color: upDevices > devices.length * 0.9 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Avg CPU Usage',
      value: `${Math.round(avgCpuUtilization)}%`,
      change: avgCpuUtilization > 80 ? 'High' : 'Normal',
      trend: avgCpuUtilization > 80 ? 'down' : 'up',
      icon: TrendingUp,
      color: avgCpuUtilization > 80 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
    },
  ];

  const recentAlerts = activeAlerts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Utilization Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>CPU Utilization Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart
                data={cpuData}
                title=""
                unit="%"
                color="#3B82F6"
                showBaseline
                height={250}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Network Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart
                data={trafficData}
                title=""
                unit="bps"
                color="#10B981"
                type="area"
                height={250}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Network Topology and Recent Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Network Topology */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Topology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TopologyMap
                nodes={topologyNodes}
                edges={topologyEdges}
                height={400}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts and Anomalies */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Recent Alerts
                  </span>
                  {activeAlerts.length > 0 && (
                    <Badge variant="warning" size="sm">
                      {activeAlerts.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.length > 0 ? (
                    recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {alert.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(alert.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge 
                          variant={alert.severity === 'critical' ? 'danger' : 'warning'} 
                          size="sm"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Anomalies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Anomalies
                  </span>
                  {anomalies.length > 0 && (
                    <Badge variant="info" size="sm">
                      {anomalies.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.slice(0, 4).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        anomaly.severity === 'high' ? 'bg-purple-600' :
                        anomaly.severity === 'medium' ? 'bg-purple-400' :
                        'bg-purple-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {anomaly.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Score: {Math.round(anomaly.score)} | Confidence: {Math.round(anomaly.confidence * 100)}%
                        </p>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {anomaly.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Device Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Device Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {upDevices}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {warningDevices}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {downDevices}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Offline</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {Math.round((upDevices / devices.length) * 100)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Health</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};