import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Bell, 
  CheckCircle, 
  Clock,
  X,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Settings,
  Trash2,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppStore } from '../store';
import { Alert } from '../types';
import { format, formatDistanceToNow } from 'date-fns';

export const AlertsView: React.FC = () => {
  const { alerts } = useAppStore();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStateVariant = (state: string) => {
    switch (state) {
      case 'firing':
        return 'danger';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'silenced':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'firing':
        return AlertTriangle;
      case 'acknowledged':
        return Eye;
      case 'resolved':
        return CheckCircle;
      case 'silenced':
        return X;
      default:
        return Bell;
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesState = stateFilter === 'all' || alert.state === stateFilter;
    
    return matchesSearch && matchesSeverity && matchesState;
  });

  const alertStats = {
    total: alerts.length,
    firing: alerts.filter(a => a.state === 'firing').length,
    acknowledged: alerts.filter(a => a.state === 'acknowledged').length,
    resolved: alerts.filter(a => a.state === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.state === 'firing').length,
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  const handleAcknowledge = (alertId: string) => {
    // Mock implementation - in real app, this would call API
    console.log('Acknowledging alert:', alertId);
  };

  const handleResolve = (alertId: string) => {
    // Mock implementation - in real app, this would call API
    console.log('Resolving alert:', alertId);
  };

  const handleSilence = (alertId: string) => {
    // Mock implementation - in real app, this would call API
    console.log('Silencing alert:', alertId);
  };

  return (
    <div className="space-y-6">
      {/* Alert Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alertStats.total}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
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
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {alertStats.firing}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Firing</p>
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
                  <Eye className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {alertStats.acknowledged}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ack'd</p>
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
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {alertStats.resolved}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {alertStats.critical}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
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
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All States</option>
            <option value="firing">Firing</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="silenced">Silenced</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm" icon={<Settings className="w-4 h-4" />}>
            Alert Rules
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert, index) => {
                const StateIcon = getStateIcon(alert.state);
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Indicator */}
                      <div className={`w-1 h-16 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' :
                        alert.severity === 'low' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      
                      {/* Alert Icon */}
                      <div className={`p-2 rounded-lg ${
                        alert.state === 'firing' ? 'bg-red-100 dark:bg-red-900' :
                        alert.state === 'acknowledged' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        alert.state === 'resolved' ? 'bg-green-100 dark:bg-green-900' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <StateIcon className={`w-5 h-5 ${
                          alert.state === 'firing' ? 'text-red-600 dark:text-red-400' :
                          alert.state === 'acknowledged' ? 'text-yellow-600 dark:text-yellow-400' :
                          alert.state === 'resolved' ? 'text-green-600 dark:text-green-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      
                      {/* Alert Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {alert.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {alert.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={getSeverityVariant(alert.severity)} size="sm">
                              {alert.severity}
                            </Badge>
                            <Badge variant={getStateVariant(alert.state)} size="sm">
                              {alert.state}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Alert Details */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(alert.startedAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {alert.deviceId && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>Device: {alert.deviceId.slice(-6)}</span>
                            </div>
                          )}
                          
                          {alert.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Tags: {alert.tags.slice(0, 2).join(', ')}</span>
                              {alert.tags.length > 2 && (
                                <span>+{alert.tags.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          {alert.state === 'firing' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(alert.id);
                                }}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSilence(alert.id);
                                }}
                              >
                                Silence
                              </Button>
                            </>
                          )}
                          
                          {alert.state === 'acknowledged' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolve(alert.id);
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                          
                          {alert.runbook && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(alert.runbook, '_blank');
                              }}
                            >
                              Runbook
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      <AnimatePresence>
        {showDetails && selectedAlert && (
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    selectedAlert.state === 'firing' ? 'bg-red-100 dark:bg-red-900' :
                    selectedAlert.state === 'acknowledged' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    selectedAlert.state === 'resolved' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {React.createElement(getStateIcon(selectedAlert.state), {
                      className: `w-6 h-6 ${
                        selectedAlert.state === 'firing' ? 'text-red-600 dark:text-red-400' :
                        selectedAlert.state === 'acknowledged' ? 'text-yellow-600 dark:text-yellow-400' :
                        selectedAlert.state === 'resolved' ? 'text-green-600 dark:text-green-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Alert Details
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedAlert.id}
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedAlert.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedAlert.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Severity
                    </h4>
                    <Badge variant={getSeverityVariant(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      State
                    </h4>
                    <Badge variant={getStateVariant(selectedAlert.state)}>
                      {selectedAlert.state}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Started At
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(selectedAlert.startedAt), 'PPpp')}
                    </p>
                  </div>
                  {selectedAlert.endedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Ended At
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(selectedAlert.endedAt), 'PPpp')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedAlert.payload && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Alert Data
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {JSON.stringify(selectedAlert.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedAlert.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedAlert.state === 'firing' && (
                    <>
                      <Button
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        icon={<Eye className="w-4 h-4" />}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSilence(selectedAlert.id)}
                        icon={<X className="w-4 h-4" />}
                      >
                        Silence
                      </Button>
                    </>
                  )}
                  
                  {selectedAlert.state === 'acknowledged' && (
                    <Button
                      onClick={() => handleResolve(selectedAlert.id)}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Resolve
                    </Button>
                  )}
                  
                  {selectedAlert.runbook && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedAlert.runbook, '_blank')}
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      View Runbook
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No alerts message */}
      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || severityFilter !== 'all' || stateFilter !== 'all'
                ? 'No alerts match your filters'
                : 'No active alerts'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || severityFilter !== 'all' || stateFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Your network is running smoothly!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};