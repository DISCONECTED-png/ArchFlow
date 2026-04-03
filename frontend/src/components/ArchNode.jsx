import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { getNodeStyle } from '../nodeConfig';

export default function ArchNode({ data, selected }) {
  const style = getNodeStyle(data.type);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        background: 'rgba(12, 18, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        border: `1.5px solid ${selected ? style.color : style.border}`,
        borderRadius: '16px',
        padding: '16px 20px',
        minWidth: '180px',
        maxWidth: '220px',
        boxShadow: selected
          ? `0 0 30px ${style.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Top Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: style.color,
          border: '2px solid #080C14',
          width: 10,
          height: 10,
          top: -5,
        }}
      />

      {/* Node Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '8px', background: `${style.color}15`, border: `1px solid ${style.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: style.color }}>
          {style.icon}
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: "'Fira Code', monospace",
            color: style.color,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          {data.type}
        </span>
      </div>

      {/* Node Content */}
      <div
        style={{
          fontSize: '14px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          color: '#E4EBF5',
          lineHeight: '1.3',
          letterSpacing: '-0.01em',
          marginBottom: data.description ? '6px' : 0,
        }}
      >
        {data.label}
      </div>

      {data.description && (
        <div
          style={{
            fontSize: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#738A9F',
            lineHeight: '1.5',
            fontWeight: 500,
          }}
        >
          {data.description}
        </div>
      )}

      {/* Bottom Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: style.color,
          border: '2px solid #080C14',
          width: 10,
          height: 10,
          bottom: -5,
        }}
      />
    </motion.div>
  );
}