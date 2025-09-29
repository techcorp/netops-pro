import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Globe,
  Clock,
  Filter
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppStore } from '../../store';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { 
    darkMode, 
    toggleDarkMode, 
    alerts, 
    currentTenant,
    selectedTimeRange,
    setSelectedTimeRange 
  } = useAppStore();

  const activeAlerts = alerts.filter(alert => alert.state === 'firing');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  const timeRanges = [
    { label: 'Last 15 minutes', minutes: 15 },
    { label: 'Last hour', minutes: 60 },
    { label: 'Last 4 hours', minutes: 240 },
    { label: 'Last 24 hours', minutes: 1440 },
    { label: 'Last 7 days', minutes: 10080 },
  ];

  const handleTimeRangeChange = (minutes: number, label: string) => {
    setSelectedTimeRange({
      start: new Date(Date.now() - minutes * 60 * 1000),
      end: new Date(),
      label,
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {currentTenant && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentTenant.name}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices, alerts..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeRange.label}
              onChange={(e) => {
                const range = timeRanges.find(r => r.label === e.target.value);
                if (range) {
                  handleTimeRangeChange(range.minutes, range.label);
                }
              }}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filters */}
          <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>

          {/* Alerts notification */}
          <motion.div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={<Bell className="w-5 h-5" />}
              whileHover={{ scale: 1.05 }}
            >
              {activeAlerts.length > 0 && (
                <Badge 
                  variant={criticalAlerts.length > 0 ? 'danger' : 'warning'} 
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center"
                >
                  {activeAlerts.length}
                </Badge>
              )}
            </Button>
          </motion.div>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            icon={darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            whileHover={{ scale: 1.05 }}
          />
        </div>
      </div>

      {/* Time range display */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            {format(selectedTimeRange.start, 'MMM dd, HH:mm')} - {format(selectedTimeRange.end, 'MMM dd, HH:mm')}
          </span>
        </div>
        
        {activeAlerts.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">
              {activeAlerts.length} Active Alerts
            </Badge>
            {criticalAlerts.length > 0 && (
              <Badge variant="danger" size="sm">
                {criticalAlerts.length} Critical
              </Badge>
            )}
          </div>
        )}
      </div>
    </header>
  );
};