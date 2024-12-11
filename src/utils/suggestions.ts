import { Node } from "../types";

export const generateSuggestions = (action: string): string[] => {
  const baseTemplates = [
    `${action}を毎日続けよう！`,
    `${action}の回数を5回増やそう！`,
    `${action}の質を高めてみよう！`,
    `友達と一緒に${action}してみよう！`,
    `${action}の記録をつけてみよう！`,
    `${action}のやり方を工夫してみよう！`,
    `${action}を習慣化しよう！`,
    `${action}の目標を設定しよう！`,
    `${action}を楽しむ方法を見つけよう！`,
    `${action}の効果を確認しよう！`,
  ];

  return [...baseTemplates].sort(() => Math.random() - 0.5).slice(0, 5);
};

const getNodeDistance = (node: Node): number => {
  const dx = node.position.x - window.innerWidth / 2;
  const dy = node.position.y - window.innerHeight / 2;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculateAngle = (
  sourceNode: Node,
  existingNodes: Node[],
  isLeft: boolean
): number => {
  const parentDistance = getNodeDistance(sourceNode);
  const sideNodes = existingNodes.filter((node) => {
    const isOnSameSide = node.position.x > window.innerWidth / 2 === !isLeft;
    const distance = getNodeDistance(node);
    return isOnSameSide && Math.abs(distance - parentDistance) < 100;
  });

  const baseAngle = isLeft ? Math.PI : 0;
  const angleRange = Math.PI / 2;
  const minAngle = baseAngle - angleRange / 2;
  const maxAngle = baseAngle + angleRange / 2;

  if (sideNodes.length === 0) {
    return (minAngle + maxAngle) / 2;
  }

  const angles = sideNodes.map((node) => {
    const dx = node.position.x - sourceNode.position.x;
    const dy = node.position.y - sourceNode.position.y;
    return Math.atan2(dy, dx);
  });

  const sortedAngles = [...angles].sort((a, b) => a - b);
  let maxGap = 0;
  let bestAngle = (minAngle + maxAngle) / 2;

  for (let i = 0; i < sortedAngles.length; i++) {
    const angle1 = sortedAngles[i];
    const angle2 = sortedAngles[(i + 1) % sortedAngles.length] || maxAngle;
    const gap = angle2 - angle1;

    if (gap > maxGap) {
      maxGap = gap;
      bestAngle = angle1 + gap / 2;
    }
  }

  return Math.max(minAngle, Math.min(maxAngle, bestAngle));
};

export const calculateSuggestionPosition = (
  sourceX: number,
  sourceY: number,
  index: number,
  total: number,
  nodes: Node[],
  sourceNode: Node
): { x: number; y: number } => {
  const isLeft = sourceX < window.innerWidth / 2;
  const sourceDistance = getNodeDistance(sourceNode);

  // Calculate base radius based on parent's distance from center
  const baseRadius =
    sourceNode.id === "first-node" ? 300 : sourceDistance + 200;

  const radiusVariation = 50;
  const radius = baseRadius + (index * radiusVariation) / total;

  const angle = calculateAngle(sourceNode, nodes, isLeft);
  const angleOffset = (index - total / 2) * 0.2;

  return {
    x: sourceX + radius * Math.cos(angle + angleOffset),
    y: sourceY + radius * Math.sin(angle + angleOffset),
  };
};

export const createNode = (
  id: string,
  label: string,
  position: { x: number; y: number },
  nodeType: "user" | "suggestion"
): Node => ({
  id,
  type: "default",
  position,
  data: { label, nodeType },
});
