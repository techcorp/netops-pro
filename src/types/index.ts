// Core Types for Network Monitoring Platform

export interface Device {
  id: string;
  tenantId: string;
  hostname: string;
  mgmtIp: string;
  model: string;
  role: 'router' | 'switch' | 'firewall' | 'server' | 'ap' | 'printer' | 'iot';
  location: string;
  tags: string[];
  status: 'up' | 'down' | 'warning' | 'unknown';
  credsRef: string;
  createdAt: string;
  updatedAt: string;
  snmpDetails?: {
    version: 'v2c' | 'v3';
    community?: string;
    username?: string;
    authProtocol?: 'md5' | 'sha';
    privProtocol?: 'des' | 'aes';
  };
  interfaces: NetworkInterface[];
  metrics: DeviceMetrics;
}

export interface NetworkInterface {
  id: string;
  deviceId: string;
  name: string;
  ifIndex: number;
  speed: number;
  vlan?: number;
  description: string;
  status: 'up' | 'down' | 'testing';
  utilization: number;
  errors: number;
  type: 'ethernet' | 'wifi' | 'tunnel' | 'loopback' | 'serial';
}

export interface DeviceMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  temperature: number;
  uptime: number;
  interfaceStats: {
    [interfaceId: string]: {
      inBytes: number;
      outBytes: number;
      inPackets: number;
      outPackets: number;
      inErrors: number;
      outErrors: number;
      utilization: number;
    };
  };
}

export interface Metric {
  ts: string;
  tenantId: string;
  entityType: 'device' | 'interface' | 'site' | 'application';
  entityId: string;
  metric: string;
  value: number;
  tags: Record<string, string>;
}

export interface Flow {
  ts: string;
  tenantId: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  asnSrc?: string;
  asnDst?: string;
  deviceId: string;
  ingressIf: number;
  egressIf: number;
}

export interface Alert {
  id: string;
  tenantId: string;
  ruleId: string;
  state: 'firing' | 'resolved' | 'acknowledged' | 'silenced';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  startedAt: string;
  endedAt?: string;
  title: string;
  description: string;
  deviceId?: string;
  interfaceId?: string;
  tags: string[];
  correlatedAlerts: string[];
  runbook?: string;
  payload: Record<string, any>;
}

export interface Anomaly {
  id: string;
  tenantId: string;
  entityId: string;
  metric: string;
  detectedAt: string;
  severity: 'high' | 'medium' | 'low';
  score: number;
  baseline: number;
  actualValue: number;
  deviation: number;
  seasonalBaseline?: number;
  aiModel: string;
  confidence: number;
  description: string;
}

export interface Forecast {
  entityId: string;
  metric: string;
  horizon: number;
  predictions: {
    timestamp: string;
    value: number;
    upperBound: number;
    lowerBound: number;
    confidence: number;
  }[];
  model: string;
  seasonality: 'daily' | 'weekly' | 'monthly' | 'yearly';
  accuracy: number;
}

export interface Tenant {
  id: string;
  name: string;
  sites: Site[];
  users: User[];
  settings: TenantSettings;
}

export interface Site {
  id: string;
  name: string;
  subnets: string[];
  location: {
    address: string;
    coordinates: [number, number];
  };
  devices: Device[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'noc' | 'secops' | 'readonly' | 'tenant_admin';
  tenantId: string;
  permissions: string[];
}

export interface TenantSettings {
  polling: {
    intervals: {
      metrics: string;
      flowsRollup: string;
    };
    snmp: {
      version: 'v2c' | 'v3';
      retries: number;
      timeout: number;
    };
  };
  retention: {
    highRes: string;
    rollups: string;
  };
  alerting: {
    defaultRoutes: string[];
    escalationRules: any[];
  };
}

export interface Dashboard {
  id: string;
  name: string;
  tenantId: string;
  layout: DashboardWidget[];
  filters: Record<string, any>;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'topology' | 'table' | 'metric' | 'alert_list' | 'device_status';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  queries: WidgetQuery[];
}

export interface WidgetQuery {
  metric: string;
  entityType: string;
  entityId?: string;
  tags?: Record<string, string>;
  aggregation?: 'avg' | 'sum' | 'max' | 'min' | 'count';
  interval?: string;
}

export interface TopologyNode {
  id: string;
  type: 'device' | 'site' | 'cloud';
  label: string;
  deviceRole?: Device['role'];
  status: 'up' | 'down' | 'warning' | 'unknown';
  metrics?: {
    cpu?: number;
    memory?: number;
    utilization?: number;
  };
  position?: {
    x: number;
    y: number;
  };
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: 'physical' | 'logical' | 'wireless';
  status: 'up' | 'down' | 'degraded';
  bandwidth?: number;
  utilization?: number;
  protocol?: 'ethernet' | 'wifi' | 'vpn' | 'bgp' | 'ospf';
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface QueryResult {
  data: any[];
  metadata: {
    count: number;
    executionTime: number;
    cached: boolean;
  };
}