import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from 'recharts';
import { format } from 'date-fns';

interface MetricData {
  timestamp: string;
  value: number;
  baseline?: number;
  upperBound?: number;
  lowerBound?: number;
  anomaly?: boolean;
}

interface MetricChartProps {
  data: MetricData[];
  type?: 'line' | 'area' | 'bar';
  title: string;
  unit?: string;
  color?: string;
  showBaseline?: boolean;
  showBounds?: boolean;
  height?: number;
}

const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#8B5CF6',
  success: '#059669',
};

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  type = 'line',
  title,
  unit = '',
  color = colors.primary,
  showBaseline = false,
  showBounds = false,
  height = 300,
}) => {
  const formatValue = (value: number): string => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'bytes') {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}GB`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}MB`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}KB`;
      return `${value}B`;
    }
    if (unit === 'bps') {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}Gbps`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}Mbps`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}Kbps`;
      return `${value}bps`;
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {format(new Date(label), 'MMM dd, HH:mm:ss')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              className="text-xs"
            />
            <YAxis tickFormatter={formatValue} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            
            {showBounds && (
              <>
                <Area
                  dataKey="upperBound"
                  stackId="bounds"
                  stroke="none"
                  fill={color}
                  fillOpacity={0.1}
                />
                <Area
                  dataKey="lowerBound"
                  stackId="bounds"
                  stroke="none"
                  fill="white"
                  fillOpacity={1}
                />
              </>
            )}
            
            <Area
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 0 }}
              activeDot={{ r: 4, fill: color }}
            />
            
            {showBaseline && (
              <Line
                dataKey="baseline"
                stroke={colors.warning}
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={1}
              />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              className="text-xs"
            />
            <YAxis tickFormatter={formatValue} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              className="text-xs"
            />
            <YAxis tickFormatter={formatValue} className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 0 }}
              activeDot={{ r: 4, fill: color }}
            />
            
            {showBaseline && (
              <Line
                dataKey="baseline"
                stroke={colors.warning}
                strokeDasharray="5 5"
                dot={false}
                strokeWidth={1}
              />
            )}
            
            {/* Highlight anomalies */}
            {data.some(d => d.anomaly) && (
              <Line
                dataKey="value"
                stroke={colors.danger}
                strokeWidth={0}
                dot={(props: any) => {
                  const dataPoint = data[props.index];
                  if (dataPoint?.anomaly) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill={colors.danger}
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h4>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};