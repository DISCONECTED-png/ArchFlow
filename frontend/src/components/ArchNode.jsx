import { Handle, Position } from '@xyflow/react';
import { getNodeStyle } from '../nodeConfig';
import React from 'react';

export default function ArchNode({ data, selected }) {
  const style = getNodeStyle(data.type);

  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: '12px',
        padding: '14px 18px',
        minWidth: '160px',
        maxWidth: '200px',
        boxShadow: selected
          ? `${style.glow}, 0 0 0 2px ${style.border}`
          : style.glow,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: style.border,
          border: 'none',
          width: 8,
          height: 8,
          top: -4,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '18px', color: style.color }}>{style.icon}</span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: "'Space Mono', monospace",
            color: style.color,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: 0.7,
          }}
        >
          {data.type}
        </span>
      </div>

      <div
        style={{
          fontSize: '13px',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          color: '#F1F5F9',
          lineHeight: '1.3',
          marginBottom: data.description ? '6px' : 0,
        }}
      >
        {data.label}
      </div>

      {data.description && (
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'DM Sans', sans-serif",
            color: '#64748B',
            lineHeight: '1.4',
          }}
        >
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: style.border,
          border: 'none',
          width: 8,
          height: 8,
          bottom: -4,
        }}
      />
    </div>
  );
}
