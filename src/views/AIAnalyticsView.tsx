import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  Target,
  BarChart3,
  Activity,
  Lightbulb,
  Search,
  Filter,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MetricChart } from '../components/charts/MetricChart';
import { useAppStore } from '../store';

// Mock data generators
const generateForecastData = () => {
  const data = [];
  const now = Date.now();
  
  // Historical data (last 7 days)
  for (let i = 7; i >= 0; i--) {
    const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    const baseValue = 60 + Math.sin(i / 2) * 20 + Math.random() * 10;
    
    data.push({
      timestamp,
      value: baseValue,
      baseline: 65,
      upperBound: 85,
      lowerBound: 45,
    });
  }
  
  // Forecast data (next 7 days)
  for (let i = 1; i <= 7; i++) {
    const timestamp = new Date(now + i * 24 * 60 * 60 * 1000).toISOString();
    const trend = i * 2; // Gradual increase
    const baseValue = 70 + trend + Math.sin(i / 2) * 15;
    const confidence = Math.max(0.9 - i * 0.1, 0.3); // Decreasing confidence
    
    data.push({
      timestamp,
      value: baseValue,
      baseline: 65,
      upperBound: baseValue + (20 * (1 - confidence)),
      lowerBound: baseValue - (15 * (1 - confidence)),
      forecast: true,
    });
  }
  
  return data;
};

const generateAnomalyData = () => {
  const data = [];
  const now = Date.now();
  
  for (let i = 48; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
    const baseValue = 40 + Math.sin(i / 6) * 15 + Math.random() * 8;
    const isAnomaly = Math.random() < 0.08; // 8% chance of anomaly
    
    data.push({
      timestamp,
      value: isAnomaly ? baseValue + 30 + Math.random() * 20 : baseValue,
      baseline: 45,
      upperBound: 65,
      lowerBound: 25,
      anomaly: isAnomaly,
    });
  }
  
  return data;
};

export const AIAnalyticsView: React.FC = () => {
  const { anomalies, forecasts } = useAppStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('cpu_utilization');

  const aiInsights = [
    {
      id: '1',
      type: 'forecast',
      title: 'WAN Link Capacity Alert',
      description: 'Primary WAN link will reach 85% utilization within 5 days based on current growth trend.',
      confidence: 0.92,
      impact: 'high',
      recommendation: 'Consider upgrading bandwidth or implementing traffic shaping policies.',
      icon: TrendingUp,
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Unusual Traffic Pattern Detected',
      description: 'Router-01 showing 340% increase in internal traffic to subnet 10.0.50.0/24.',
      confidence: 0.87,
      impact: 'medium',
      recommendation: 'Investigate potential lateral movement or data exfiltration.',
      icon: AlertCircle,
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Load Balancing Opportunity',
      description: 'Uneven traffic distribution across core switches could be optimized.',
      confidence: 0.94,
      impact: 'low',
      recommendation: 'Adjust ECMP weights to balance load more evenly.',
      icon: Target,
    },
    {
      id: '4',
      type: 'prediction',
      title: 'Memory Saturation Predicted',
      description: 'Server cluster memory usage trend indicates 90% utilization by next week.',
      confidence: 0.89,
      impact: 'high',
      recommendation: 'Schedule memory upgrade or migrate workloads.',
      icon: Lightbulb,
    },
  ];

  const modelPerformance = [
    { model: 'Anomaly Detection (Isolation Forest)', accuracy: 94.2, precision: 91.8, recall: 96.5 },
    { model: 'Traffic Forecasting (LSTM)', accuracy: 87.3, mse: 0.023, mae: 0.156 },
    { model: 'Capacity Planning (Prophet)', accuracy: 89.7, mape: 8.2, coverage: 92.1 },
    { model: 'Root Cause Analysis (XGBoost)', accuracy: 78.9, f1: 0.821, auc: 0.876 },
  ];

  const forecastData = generateForecastData();
  const anomalyData = generateAnomalyData();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Models
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    4
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    All operational
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Anomalies Detected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {anomalies.length}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Last 24h
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Forecast Accuracy
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    89.7%
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    +2.3% this week
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Insights Generated
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {aiInsights.length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Today
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                      <Icon className={`w-5 h-5 ${getImpactColor(insight.impact)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {insight.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {insight.description}
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                            💡 {insight.recommendation}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getImpactVariant(insight.impact)} size="sm">
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="info" size="sm">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Capacity Forecasting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Capacity Forecasting
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                  >
                    <option value="cpu_utilization">CPU Utilization</option>
                    <option value="bandwidth">Bandwidth Usage</option>
                    <option value="memory">Memory Usage</option>
                    <option value="disk_io">Disk I/O</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart
                data={forecastData}
                title=""
                unit="%"
                color="#3B82F6"
                showBaseline
                showBounds
                type="area"
                height={300}
              />
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Prediction:</strong> Based on current trends, this metric will reach 85% utilization in approximately 5 days. Consider capacity planning actions.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Anomaly Detection */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Anomaly Detection
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MetricChart
                data={anomalyData}
                title=""
                unit="%"
                color="#EF4444"
                showBaseline
                showBounds
                height={300}
              />
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Detected:</strong> {anomalyData.filter(d => d.anomaly).length} anomalies in the selected timeframe. Red dots indicate values outside normal behavior patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Model Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ML Model Performance
              </span>
              <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
                Retrain Models
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">Model</th>
                    <th className="text-left py-3 px-4 font-medium">Accuracy</th>
                    <th className="text-left py-3 px-4 font-medium">Precision/MSE</th>
                    <th className="text-left py-3 px-4 font-medium">Recall/MAE</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPerformance.map((model, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {model.model.split(' (')[0]}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {model.model.split(' (')[1]?.replace(')', '')}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.accuracy}%</span>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {'precision' in model ? `${model.precision}%` : model.mse?.toFixed(3)}
                      </td>
                      <td className="py-3 px-4">
                        {'recall' in model ? `${model.recall}%` : model.mae?.toFixed(3)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={model.accuracy > 90 ? 'success' : model.accuracy > 80 ? 'warning' : 'danger'} 
                          size="sm"
                        >
                          {model.accuracy > 90 ? 'Excellent' : model.accuracy > 80 ? 'Good' : 'Needs Review'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ask me anything about your network... (e.g., 'Show top talkers for Site A last 24h')"
                    className="pl-10 pr-4 py-3 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button>
                  Ask AI
                </Button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Suggested Questions:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Why did latency spike at 10:30?',
                    'Show bandwidth trends for core routers',
                    'Which devices need attention?',
                    'Predict next capacity bottleneck',
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="ghost"
                      size="sm"
                      className="text-xs bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};