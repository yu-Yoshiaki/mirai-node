import { Selection } from "d3";

export const createGradients = (
  defs: Selection<SVGDefsElement, unknown, null, undefined>
) => {
  // Pulsing light effect
  const pulseFilter = defs
    .append("filter")
    .attr("id", "pulseLight")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  pulseFilter
    .append("animate")
    .attr("attributeName", "stdDeviation")
    .attr("values", "2;4;2")
    .attr("dur", "1.5s")
    .attr("repeatCount", "indefinite");

  pulseFilter
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", "2");

  // Edge light animation
  const edgeGradient = defs
    .append("linearGradient")
    .attr("id", "edgeGradient")
    .attr("gradientUnits", "userSpaceOnUse");

  edgeGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#4299E1")
    .attr("stop-opacity", "0.1");

  edgeGradient
    .append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "#4299E1")
    .attr("stop-opacity", "1");

  edgeGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#4299E1")
    .attr("stop-opacity", "0.1");

  edgeGradient
    .append("animate")
    .attr("attributeName", "x1")
    .attr("values", "-100%;100%")
    .attr("dur", "3s")
    .attr("repeatCount", "indefinite");

  edgeGradient
    .append("animate")
    .attr("attributeName", "x2")
    .attr("values", "0%;200%")
    .attr("dur", "3s")
    .attr("repeatCount", "indefinite");

  // Enhanced cosmic glow filter
  const filter = defs
    .append("filter")
    .attr("id", "cosmicGlow")
    .attr("x", "-100%")
    .attr("y", "-100%")
    .attr("width", "300%")
    .attr("height", "300%");

  filter
    .append("feGaussianBlur")
    .attr("class", "blur")
    .attr("stdDeviation", "8")
    .attr("result", "coloredBlur");

  filter
    .append("feGaussianBlur")
    .attr("stdDeviation", "4")
    .attr("result", "innerGlow");

  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "innerGlow");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  // Initial node gradient - White glow
  const initialGradient = defs
    .append("radialGradient")
    .attr("id", "initialGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "25%")
    .attr("fy", "25%");

  initialGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#FFFFFF;stop-opacity:1");

  initialGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#E2E8F0;stop-opacity:0.8");

  // User node gradient - Cosmic purple/blue
  const userGradient = defs
    .append("radialGradient")
    .attr("id", "userGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "25%")
    .attr("fy", "25%");

  userGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#9F2B68;stop-opacity:0.8");

  userGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#483D8B;stop-opacity:0.6");

  // Suggestion node gradient - Ethereal blue
  const suggestionGradient = defs
    .append("radialGradient")
    .attr("id", "suggestionGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .attr("fx", "25%")
    .attr("fy", "25%");

  suggestionGradient
    .append("stop")
    .attr("offset", "0%")
    .attr("style", "stop-color:#4299E1;stop-opacity:0.8");

  suggestionGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("style", "stop-color:#2B6CB0;stop-opacity:0.6");
};
