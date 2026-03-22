// Mock for react-native-svg on web
// Uses standard SVG elements

import React from 'react';

export const Svg = ({ children, width, height, viewBox, style, ...props }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox={viewBox} 
    style={style}
    {...props}
  >
    {children}
  </svg>
);

export const Circle = ({ cx, cy, r, fill, stroke, strokeWidth, ...props }) => (
  <circle 
    cx={cx} 
    cy={cy} 
    r={r} 
    fill={fill} 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  />
);

export const Rect = ({ x, y, width, height, fill, stroke, rx, ry, ...props }) => (
  <rect 
    x={x} 
    y={y} 
    width={width} 
    height={height} 
    fill={fill} 
    stroke={stroke}
    rx={rx}
    ry={ry}
    {...props}
  />
);

export const Path = ({ d, fill, stroke, strokeWidth, ...props }) => (
  <path 
    d={d} 
    fill={fill} 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  />
);

export const Line = ({ x1, y1, x2, y2, stroke, strokeWidth, ...props }) => (
  <line 
    x1={x1} 
    y1={y1} 
    x2={x2} 
    y2={y2} 
    stroke={stroke} 
    strokeWidth={strokeWidth}
    {...props}
  />
);

export const Text = ({ x, y, fill, fontSize, fontFamily, textAnchor, children, ...props }) => (
  <text 
    x={x} 
    y={y} 
    fill={fill} 
    fontSize={fontSize}
    fontFamily={fontFamily}
    textAnchor={textAnchor}
    {...props}
  >
    {children}
  </text>
);

export const G = ({ children, transform, ...props }) => (
  <g transform={transform} {...props}>
    {children}
  </g>
);

export const Defs = ({ children }) => <defs>{children}</defs>;

export const LinearGradient = ({ id, x1, y1, x2, y2, children, ...props }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} {...props}>
    {children}
  </linearGradient>
);

export const RadialGradient = ({ id, cx, cy, r, fx, fy, children, ...props }) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r} fx={fx} fy={fy} {...props}>
    {children}
  </radialGradient>
);

export const Stop = ({ offset, stopColor, stopOpacity, ...props }) => (
  <stop 
    offset={offset} 
    stopColor={stopColor} 
    stopOpacity={stopOpacity}
    {...props}
  />
);

export const ClipPath = ({ id, children }) => (
  <clipPath id={id}>{children}</clipPath>
);

export const Mask = ({ id, children }) => (
  <mask id={id}>{children}</mask>
);

export const Use = ({ href, ...props }) => <use href={href} {...props} />;

export default Svg;






