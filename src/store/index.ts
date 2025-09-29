import { create } from 'zustand';
import { Device, Alert, Tenant, User, Dashboard, Anomaly, Forecast, TimeRange } from '../types';

// Mock data generators
const generateMockDevices = (tenantId: string): Device[] => {
  const devices: Device[] = [];
  const deviceTypes: Device['role'][] = ['router', 'switch', 'firewall', 'server', 'ap'];
  const locations = ['DC1-Rack-A', 'DC1-Rack-B', 'DC2-Rack-A', 'Office-Floor-1', 'Office-Floor-2'];
  
  for (let i = 1; i <= 25; i++) {
    const device: Device = {
      id: `dev-${tenantId}-${i.toString().padStart(3, '0')}`,
      tenantId,
      hostname: `${deviceTypes[i % deviceTypes.length]}-${i.toString().padStart(2, '0')}.example.com`,
      mgmtIp: `10.0.${Math.floor(i / 10)}.${i % 256}`,
      model: `Model-${deviceTypes[i % deviceTypes.length]}-${Math.floor(Math.random() * 1000)}`,
      role: deviceTypes[i % deviceTypes.length],
      location: locations[i % locations.length],
      tags: [`env:${i % 2 === 0 ? 'prod' : 'dev'}`, `zone:${locations[i % locations.length].split('-')[0]}`],
      status: Math.random() > 0.1 ? 'up' : (Math.random() > 0.5 ? 'warning' : 'down'),
      credsRef: `creds-${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      interfaces: Array.from({ length: Math.floor(Math.random() * 24) + 4 }, (_, j) => ({
        id: `if-${i}-${j}`,
        deviceId: `dev-${tenantId}-${i.toString().padStart(3, '0')}`,
        name: `GigabitEthernet0/${j}`,
        ifIndex: j,
        speed: Math.random() > 0.3 ? 1000 : 10000,
        vlan: Math.floor(Math.random() * 100) + 1,
        description: `Interface ${j} - ${Math.random() > 0.5 ? 'Uplink' : 'Access'}`,
        status: Math.random() > 0.05 ? 'up' : 'down',
        utilization: Math.random() * 100,
        errors: Math.floor(Math.random() * 1000),
        type: 'ethernet' as const,
      })),
      metrics: {
        cpuUtilization: Math.random() * 100,
        memoryUtilization: Math.random() * 100,
        temperature: 20 + Math.random() * 40,
        uptime: Math.floor(Math.random() * 365 * 24 * 60 * 60),
        interfaceStats: {},
      },
    };
    
    // Generate interface stats
    device.interfaces.forEach(iface => {
      device.metrics.interfaceStats[iface.id] = {
        inBytes: Math.floor(Math.random() * 1000000000),
        outBytes: Math.floor(Math.random() * 1000000000),
        inPackets: Math.floor(Math.random() * 10000000),
        outPackets: Math.floor(Math.random() * 10000000),
        inErrors: Math.floor(Math.random() * 1000),
        outErrors: Math.floor(Math.random() * 1000),
        utilization: iface.utilization,
      };
    });
    
    devices.push(device);
  }
  
  return devices;
};

const generateMockAlerts = (tenantId: string): Alert[] => {
  const severities: Alert['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
  const states: Alert['state'][] = ['firing', 'resolved', 'acknowledged'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `alert-${tenantId}-${i}`,
    tenantId,
    ruleId: `rule-${Math.floor(Math.random() * 10)}`,
    state: states[Math.floor(Math.random() * states.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    startedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
    title: `${['High CPU Usage', 'Interface Down', 'Memory Alert', 'Temperature Warning', 'BGP Session Down'][i % 5]} on ${['router-01', 'switch-05', 'firewall-02'][i % 3]}`,
    description: `Alert triggered due to ${['sustained high resource usage', 'network connectivity issue', 'hardware fault', 'configuration change'][i % 4]}`,
    deviceId: `dev-${tenantId}-${(i % 10 + 1).toString().padStart(3, '0')}`,
    tags: [`severity:${severities[Math.floor(Math.random() * severities.length)]}`, 'automated'],
    correlatedAlerts: [],
    runbook: 'https://runbooks.example.com/network-alerts',
    payload: {
      metric: 'cpu.utilization',
      threshold: 85,
      actualValue: 92.5,
      duration: '10m',
    },
  }));
};

const generateMockAnomalies = (tenantId: string): Anomaly[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `anomaly-${tenantId}-${i}`,
    tenantId,
    entityId: `dev-${tenantId}-${(i % 10 + 1).toString().padStart(3, '0')}`,
    metric: ['cpu.utilization', 'memory.utilization', 'interface.utilization', 'latency.ms'][i % 4],
    detectedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
    severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
    score: Math.random() * 100,
    baseline: 20 + Math.random() * 50,
    actualValue: 70 + Math.random() * 30,
    deviation: Math.random() * 20,
    seasonalBaseline: 25 + Math.random() * 45,
    aiModel: 'isolation-forest-v2',
    confidence: 0.7 + Math.random() * 0.3,
    description: `Anomalous behavior detected in ${['CPU usage', 'memory consumption', 'network traffic', 'response time'][i % 4]}`,
  }));
};

interface AppState {
  // Current user and tenant
  currentUser: User | null;
  currentTenant: Tenant | null;
  tenants: Tenant[];
  
  // Data
  devices: Device[];
  alerts: Alert[];
  dashboards: Dashboard[];
  anomalies: Anomaly[];
  forecasts: Forecast[];
  
  // UI State
  selectedTimeRange: TimeRange;
  selectedDevice: Device | null;
  sidebarOpen: boolean;
  darkMode: boolean;
  loading: boolean;
  
  // Actions
  setCurrentUser: (user: User) => void;
  setCurrentTenant: (tenant: Tenant) => void;
  setDevices: (devices: Device[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setSelectedTimeRange: (range: TimeRange) => void;
  setSelectedDevice: (device: Device | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
  
  // Data fetchers (mock)
  fetchDevices: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchAnomalies: () => Promise<void>;
  
  // Initialize app
  initialize: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  currentTenant: null,
  tenants: [],
  devices: [],
  alerts: [],
  dashboards: [],
  anomalies: [],
  forecasts: [],
  selectedTimeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 24 Hours',
  },
  selectedDevice: null,
  sidebarOpen: true,
  darkMode: true,
  loading: false,
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  setDevices: (devices) => set({ devices }),
  setAlerts: (alerts) => set({ alerts }),
  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setLoading: (loading) => set({ loading }),
  
  // Mock data fetchers
  fetchDevices: async () => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const { currentTenant } = get();
    if (currentTenant) {
      const devices = generateMockDevices(currentTenant.id);
      set({ devices, loading: false });
    }
  },
  
  fetchAlerts: async () => {
    const { currentTenant } = get();
    if (currentTenant) {
      const alerts = generateMockAlerts(currentTenant.id);
      set({ alerts });
    }
  },
  
  fetchAnomalies: async () => {
    const { currentTenant } = get();
    if (currentTenant) {
      const anomalies = generateMockAnomalies(currentTenant.id);
      set({ anomalies });
    }
  },
  
  // Initialize the app with mock data
  initialize: () => {
    // Mock tenant and user
    const tenant: Tenant = {
      id: 'tenant-acme-corp',
      name: 'ACME Corporation',
      sites: [
        {
          id: 'site-dc1',
          name: 'Data Center 1',
          subnets: ['10.0.0.0/16', '192.168.1.0/24'],
          location: {
            address: '123 Tech Blvd, San Jose, CA',
            coordinates: [-121.9, 37.3],
          },
          devices: [],
        },
        {
          id: 'site-dc2',
          name: 'Data Center 2',
          subnets: ['10.1.0.0/16'],
          location: {
            address: '456 Innovation Way, Austin, TX',
            coordinates: [-97.7, 30.3],
          },
          devices: [],
        },
      ],
      users: [],
      settings: {
        polling: {
          intervals: {
            metrics: '60s',
            flowsRollup: '30s',
          },
          snmp: {
            version: 'v3',
            retries: 3,
            timeout: 5000,
          },
        },
        retention: {
          highRes: '30d',
          rollups: '13m',
        },
        alerting: {
          defaultRoutes: ['slack-netops', 'pagerduty-noc'],
          escalationRules: [],
        },
      },
    };
    
    const user: User = {
      id: 'user-1',
      email: 'admin@acme.com',
      name: 'Network Admin',
      role: 'admin',
      tenantId: tenant.id,
      permissions: ['read', 'write', 'admin'],
    };
    
    set({
      currentUser: user,
      currentTenant: tenant,
      tenants: [tenant],
    });
    
    // Load initial data
    get().fetchDevices();
    get().fetchAlerts();
    get().fetchAnomalies();
  },
}));