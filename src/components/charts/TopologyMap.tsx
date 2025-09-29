import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { TopologyNode, TopologyEdge } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Server, 
  Router, 
  Shield, 
  Wifi, 
  Printer, 
  Globe,
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCw
} from 'lucide-react';

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onNodeClick?: (node: TopologyNode) => void;
  height?: number;
}

const getNodeIcon = (role: string) => {
  switch (role) {
    case 'router':
      return Router;
    case 'switch':
      return Server;
    case 'firewall':
      return Shield;
    case 'ap':
      return Wifi;
    case 'printer':
      return Printer;
    default:
      return Globe;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'up':
      return '#10B981'; // green
    case 'down':
      return '#EF4444'; // red
    case 'warning':
      return '#F59E0B'; // yellow
    default:
      return '#6B7280'; // gray
  }
};

export const TopologyMap: React.FC<TopologyMapProps> = ({
  nodes,
  edges,
  onNodeClick,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height_ = height;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Define arrow marker for directed edges
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'arrowhead')
      .style('fill', '#6B7280');

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height_ / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke-width', (d) => Math.sqrt(d.bandwidth || 1) / 10 + 1)
      .attr('stroke', (d) => getStatusColor(d.status))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create link labels
    const linkLabel = container.append('g')
      .selectAll('text')
      .data(edges)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .text((d) => d.utilization ? `${Math.round(d.utilization)}%` : '');

    // Create node groups
    const nodeGroups = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      });

    // Add node circles
    nodeGroups.append('circle')
      .attr('r', 25)
      .attr('fill', (d) => getStatusColor(d.status))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');

    // Add node icons (as text for simplicity)
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '16px')
      .attr('fill', 'white')
      .text((d) => {
        switch (d.deviceRole) {
          case 'router': return '🔀';
          case 'switch': return '🖧';
          case 'firewall': return '🛡️';
          case 'server': return '🖥️';
          case 'ap': return '📶';
          default: return '🌐';
        }
      });

    // Add node labels
    nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '3em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text((d) => d.label);

    // Add metrics overlay
    nodeGroups.filter(d => d.metrics?.cpu)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '4.5em')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .text((d) => `CPU: ${Math.round(d.metrics?.cpu || 0)}%`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag behavior
    const drag = d3.drag<any, any>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroups.call(drag);

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, height]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      zoom.scaleBy as any, 1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      zoom.scaleBy as any, 1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      zoom.transform as any,
      d3.zoomIdentity
    );
  };

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Topology Map */}
      <svg
        ref={svgRef}
        className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
        style={{ height }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <motion.button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
        
        <motion.button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
        
        <motion.button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Maximize className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      {/* Status Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Status</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Offline</span>
          </div>
        </div>
      </div>

      {/* Zoom Level */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-md text-sm text-gray-600 dark:text-gray-400">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 w-80"
        >
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNode.label}
                </h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <Badge 
                    variant={selectedNode.status === 'up' ? 'success' : 'danger'} 
                    size="sm"
                  >
                    {selectedNode.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedNode.deviceRole || selectedNode.type}
                  </span>
                </div>
                
                {selectedNode.metrics && (
                  <>
                    {selectedNode.metrics.cpu && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">CPU</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(selectedNode.metrics.cpu)}%
                        </span>
                      </div>
                    )}
                    
                    {selectedNode.metrics.memory && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Memory</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(selectedNode.metrics.memory)}%
                        </span>
                      </div>
                    )}
                    
                    {selectedNode.metrics.utilization && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Utilization</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(selectedNode.metrics.utilization)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};