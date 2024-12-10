import * as d3 from 'd3';
import { Node, Edge } from '../../types';

export const createSimulation = (nodes: Node[], edges: Edge[], width: number, height: number) => {
  const hierarchyLevels = new Map<string, number>();
  
  // Calculate hierarchy levels
  const calculateLevels = (nodeId: string, level: number) => {
    hierarchyLevels.set(nodeId, level);
    const childEdges = edges.filter(e => e.source === nodeId);
    childEdges.forEach(edge => {
      if (!hierarchyLevels.has(edge.target)) {
        calculateLevels(edge.target, level + 1);
      }
    });
  };

  // Start from first-node
  calculateLevels('first-node', 0);

  return d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges)
      .id((d: any) => d.id)
      .distance((d: any) => {
        const sourceLevel = hierarchyLevels.get(d.source.id) || 0;
        const targetLevel = hierarchyLevels.get(d.target.id) || 0;
        return 150 + Math.abs(targetLevel - sourceLevel) * 50;
      })
      .strength(0.5))
    .force('charge', d3.forceManyBody()
      .strength(d => d.id === 'first-node' ? -1000 : -400)
      .distanceMax(500))
    .force('collision', d3.forceCollide()
      .radius(d => d.id === 'first-node' ? 80 : 50)
      .strength(0.8))
    .force('x', d3.forceX().strength((d: any) => {
      const level = hierarchyLevels.get(d.id) || 0;
      return 0.1 + level * 0.05;
    }))
    .force('y', d3.forceY().strength((d: any) => {
      const level = hierarchyLevels.get(d.id) || 0;
      return 0.1 + level * 0.05;
    }))
    .force('radial', d3.forceRadial(
      (d: any) => {
        const level = hierarchyLevels.get(d.id) || 0;
        return 200 + level * 150;
      },
      width / 2,
      height / 2
    ).strength(0.8))
    .velocityDecay(0.6)
    .alphaDecay(0.02);
};