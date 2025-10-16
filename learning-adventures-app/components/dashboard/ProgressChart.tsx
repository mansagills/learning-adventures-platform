'use client';

import { cn } from '@/lib/utils';

interface ProgressChartProps {
  data: {
    label: string;
    value: number;
    max?: number;
    color?: string;
  }[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
}

export default function ProgressChart({
  data,
  type = 'bar',
  height = 200,
  showLabels = true,
  showValues = true
}: ProgressChartProps) {
  if (type === 'bar') {
    return <BarChart data={data} height={height} showLabels={showLabels} showValues={showValues} />;
  }

  // Add other chart types as needed
  return <BarChart data={data} height={height} showLabels={showLabels} showValues={showValues} />;
}

// Bar Chart Component
function BarChart({
  data,
  height,
  showLabels,
  showValues
}: Omit<ProgressChartProps, 'type'> & { data: NonNullable<ProgressChartProps['data']> }) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = item.max
          ? (item.value / item.max) * 100
          : (item.value / maxValue) * 100;

        const barColor = item.color || 'bg-brand-500';

        return (
          <div key={index} className="space-y-2">
            {showLabels && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-800">{item.label}</span>
                {showValues && (
                  <span className="text-ink-600">
                    {item.value}{item.max ? `/${item.max}` : ''}
                  </span>
                )}
              </div>
            )}

            <div className="relative w-full bg-gray-200 rounded-full overflow-hidden" style={{ height: '12px' }}>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  barColor
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple Donut Chart for category breakdown
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 200,
  centerLabel,
  centerValue
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const radius = size / 2;
  const strokeWidth = size / 8;
  const innerRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * innerRadius;

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const segmentLength = (percentage / 100) * circumference;
            const offset = cumulativePercentage * circumference / 100;

            cumulativePercentage += percentage;

            return (
              <circle
                key={index}
                cx={radius}
                cy={radius}
                r={innerRadius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Center text */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <div className="text-3xl font-bold text-ink-800">{centerValue}</div>
            )}
            {centerLabel && (
              <div className="text-sm text-ink-600 mt-1">{centerLabel}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="ml-8 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-ink-800">
              {item.label} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
