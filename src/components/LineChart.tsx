"use client";

import React from "react";

type Point = { x: number; y: number };

export default function LineChart(props: {
  data: Point[];
  width?: number | string;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  yMin?: number;
  yMax?: number;
  className?: string;
  grid?: boolean;
}) {
  const {
    data,
    width = "100%",
    height = 180,
    stroke = "#87e2a5",
    strokeWidth = 2,
    fill = null,
    yMin,
    yMax,
    className,
    grid = true,
  } = props;

  const padding = { top: 8, right: 8, bottom: 18, left: 8 };
  const wPx = typeof width === "number" ? width : 640; // for internal math only
  const w = wPx - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const n = data.length;
  const xMin = n > 0 ? Math.min(...data.map((d) => d.x)) : 0;
  const xMax = n > 0 ? Math.max(...data.map((d) => d.x)) : 1;
  const yMinAuto = n > 0 ? Math.min(...data.map((d) => d.y)) : 0;
  const yMaxAuto = n > 0 ? Math.max(...data.map((d) => d.y)) : 1;

  const y0 = yMin ?? Math.min(0, yMinAuto);
  const y1 = yMax ?? (yMaxAuto === yMinAuto ? yMaxAuto + 1 : yMaxAuto);

  const scaleX = (x: number) =>
    w === 0 || xMax === xMin ? padding.left : padding.left + ((x - xMin) / (xMax - xMin)) * w;
  const scaleY = (y: number) =>
    h === 0 || y1 === y0 ? padding.top + h : padding.top + (1 - (y - y0) / (y1 - y0)) * h;

  // Path
  let dAttr = "";
  data.forEach((p, i) => {
    const X = scaleX(p.x);
    const Y = scaleY(p.y);
    dAttr += i === 0 ? `M ${X} ${Y}` : ` L ${X} ${Y}`;
  });

  // Optional area fill under the curve
  let areaAttr: string | null = null;
  if (fill && data.length > 1) {
    const first = data[0];
    const last = data[data.length - 1];
    const baselineY = scaleY(0);
    areaAttr = `M ${scaleX(first.x)} ${baselineY}`;
    data.forEach((p) => {
      areaAttr += ` L ${scaleX(p.x)} ${scaleY(p.y)}`;
    });
    areaAttr += ` L ${scaleX(last.x)} ${baselineY} Z`;
  }

  // Grid lines (horizontal)
  const gridLines: JSX.Element[] = [];
  if (grid) {
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const yy = padding.top + (h * i) / steps;
      gridLines.push(
        <line
          key={`g-${i}`}
          x1={padding.left}
          x2={padding.left + w}
          y1={yy}
          y2={yy}
          stroke="#ffffff18"
          strokeWidth={1}
        />
      );
    }
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${typeof width === "number" ? width : wPx} ${height}`} className={className}>
      <rect x={0} y={0} width={typeof width === "number" ? width : wPx} height={height} fill="transparent" />
      {gridLines}
      {fill && areaAttr ? <path d={areaAttr} fill={fill} stroke="none" /> : null}
      <path d={dAttr} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
