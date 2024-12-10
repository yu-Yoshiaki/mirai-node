import { Simulation } from 'd3';
import { Node } from '../../types';

export const createDragHandlers = (simulation: Simulation<Node, undefined>) => {
  const dragstarted = (event: any) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  };

  const dragged = (event: any) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  };

  const dragended = (event: any) => {
    if (!event.active) simulation.alphaTarget(0);
    if (event.subject.id !== 'first-node') {
      event.subject.fx = null;
      event.subject.fy = null;
    }
  };

  return { dragstarted, dragged, dragended };
};