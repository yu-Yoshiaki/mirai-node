import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Node, Edge, SimulationEdge } from '../types';
import { createGradients } from '../utils/d3/gradients';
import { createSimulation } from '../utils/d3/simulation';
import { createDragHandlers } from '../utils/d3/drag';
import { wrapText } from '../utils/d3/text';

interface NeuralFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
}

export const NeuralFlow: React.FC<NeuralFlowProps> = ({ nodes, edges, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
  const transformRef = useRef<d3.ZoomTransform>();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const currentTransform = transformRef.current;
    
    svg.selectAll('*').remove();
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        container.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    
    const container = svg.append('g');

    const defs = svg.append('defs');
    createGradients(defs);

    const simulation = createSimulation(nodes, edges, width, height);

    const firstNode = nodes.find(n => n.id === 'first-node');
    if (firstNode) {
      firstNode.fx = width / 2;
      firstNode.fy = height / 2;
    }

    // Create ethereal connection lines with pulsing effect
    const links = container.append('g')
      .selectAll<SVGPathElement, SimulationEdge>('path')
      .data(edges as SimulationEdge[])
      .join('path')
      .attr('class', 'link')
      .attr('stroke', 'url(#edgeGradient)')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .style('filter', 'url(#pulseLight)');

    const { dragstarted, dragged, dragended } = createDragHandlers(simulation);

    const nodeGroups = container.append('g')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add text background for better readability
    nodeGroups.append('text')
      .text((d: Node) => d.data.label)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: Node) => d.id === 'first-node' ? '-55px' : '-35px')
      .attr('fill', '#E2E8F0')
      .style('font-size', (d: Node) => d.id === 'first-node' ? '18px' : '14px')
      .style('pointer-events', 'none')
      .style('font-weight', '500')
      .style('text-shadow', '0 0 10px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.9)')
      .call(wrapText, 120);

    // Add cosmic nodes with enhanced glow
    nodeGroups.append('circle')
      .attr('r', (d: Node) => d.id === 'first-node' ? 45 : 25)
      .attr('fill', (d: Node) => {
        if (d.id === 'first-node') {
          return 'url(#initialGradient)';
        }
        return d.data.nodeType === 'user' ? 'url(#userGradient)' : 'url(#suggestionGradient)';
      })
      .attr('stroke', '#1A202C')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('filter', 'url(#cosmicGlow)');

    nodeGroups.on('click', (event: MouseEvent, d: Node) => {
      event.stopPropagation();
      onNodeClick(d.id);
    });

    simulation.on('tick', () => {
      links.attr('d', (d: SimulationEdge) => {
        const dx = (d.target as Node).x! - (d.source as Node).x!;
        const dy = (d.target as Node).y! - (d.source as Node).y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        return `M${(d.source as Node).x},${(d.source as Node).y}A${dr},${dr} 0 0,1 ${(d.target as Node).x},${(d.target as Node).y}`;
      });

      nodeGroups.attr('transform', (d: Node) => `translate(${d.x},${d.y})`);
    });

    const handleResize = () => {
      svg
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight);
      
      simulation
        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .restart();

      if (firstNode) {
        firstNode.fx = window.innerWidth / 2;
        firstNode.fy = window.innerHeight / 2;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    if (currentTransform) {
      svg.call(zoom.transform, currentTransform);
    } else if (nodes.length === 1) {
      const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.8)
        .translate(-width / 2, -height / 2);
      svg.call(zoom.transform, initialTransform);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, [nodes, edges, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-screen"
      style={{ background: '#000000' }}
    />
  );
};
