import React from 'react';

interface AnalogClockProps {
  hour: number;
  minute: number;
  size?: number;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ hour, minute, size = 300 }) => {
  const center = size / 2;
  const radius = size * 0.45;
  
  // Calculate angles
  // Hour hand: 360 degrees / 12 hours = 30 degrees per hour
  // Plus 30 degrees * (minutes / 60) for smooth movement
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
  // Minute hand: 360 degrees / 60 minutes = 6 degrees per minute
  const minuteAngle = minute * 6;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Clock Face */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#FFFDD0"
          stroke="#1a1a1a"
          strokeWidth="4"
        />
        
        {/* Hour Markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = center + (radius - 10) * Math.sin(angle);
          const y1 = center - (radius - 10) * Math.cos(angle);
          const x2 = center + radius * Math.sin(angle);
          const y2 = center - radius * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#1a1a1a"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Minute Markers */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null;
          const angle = (i * 6) * (Math.PI / 180);
          const x1 = center + (radius - 5) * Math.sin(angle);
          const y1 = center - (radius - 5) * Math.cos(angle);
          const x2 = center + radius * Math.sin(angle);
          const y2 = center - radius * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#666"
              strokeWidth="1"
            />
          );
        })}

        {/* Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x = center + (radius - 25) * Math.sin(angle);
          const y = center - (radius - 25) * Math.cos(angle);
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold text-xl fill-gray-800 select-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {num}
            </text>
          );
        })}

        {/* Hour Hand (Blue, Pointed) */}
        <path
          d={`M ${center - 8} ${center + 10} L ${center} ${center - radius * 0.55} L ${center + 8} ${center + 10} Z`}
          fill="#2563eb"
          stroke="#1e40af"
          strokeWidth="1"
          transform={`rotate(${hourAngle} ${center} ${center})`}
        />

        {/* Minute Hand (Red, Pointed) */}
        <path
          d={`M ${center - 5} ${center + 15} L ${center} ${center - radius * 0.85} L ${center + 5} ${center + 15} Z`}
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="1"
          transform={`rotate(${minuteAngle} ${center} ${center})`}
        />

        {/* Center Pin */}
        <circle cx={center} cy={center} r="6" fill="#1a1a1a" />
        <circle cx={center} cy={center} r="2" fill="white" />
      </svg>
    </div>
  );
};
