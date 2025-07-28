'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  success: '#22c55e',
  muted: '#6b7280',
};

const PIE_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.danger,
  COLORS.warning,
  COLORS.info,
];

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  className = '', 
  height = 300 
}) => (
  <div className={`w-full ${className}`} style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  strokeWidth?: number;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  color = COLORS.primary,
  strokeWidth = 2,
}) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis 
      dataKey={xKey} 
      stroke="#6b7280"
      fontSize={12}
    />
    <YAxis 
      stroke="#6b7280"
      fontSize={12}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Line 
      type="monotone" 
      dataKey={yKey} 
      stroke={color} 
      strokeWidth={strokeWidth}
      dot={{ fill: color, strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
    />
  </LineChart>
);

interface MultiLineChartProps {
  data: any[];
  xKey: string;
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  xKey,
  lines,
}) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis 
      dataKey={xKey} 
      stroke="#6b7280"
      fontSize={12}
    />
    <YAxis 
      stroke="#6b7280"
      fontSize={12}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Legend />
    {lines.map((line) => (
      <Line
        key={line.key}
        type="monotone"
        dataKey={line.key}
        stroke={line.color}
        strokeWidth={2}
        name={line.name}
        dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
      />
    ))}
  </LineChart>
);

interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const SimpleAreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKey,
  color = COLORS.primary,
}) => (
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis 
      dataKey={xKey} 
      stroke="#6b7280"
      fontSize={12}
    />
    <YAxis 
      stroke="#6b7280"
      fontSize={12}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Area 
      type="monotone" 
      dataKey={yKey} 
      stroke={color} 
      fill={`${color}20`}
      strokeWidth={2}
    />
  </AreaChart>
);

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  color = COLORS.primary,
}) => (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis 
      dataKey={xKey} 
      stroke="#6b7280"
      fontSize={12}
    />
    <YAxis 
      stroke="#6b7280"
      fontSize={12}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Bar 
      dataKey={yKey} 
      fill={color}
      radius={[4, 4, 0, 0]}
    />
  </BarChart>
);

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  showLabels?: boolean;
}

export const SimplePieChart: React.FC<PieChartProps> = ({
  data,
  showLabels = true,
}) => (
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={showLabels ? ({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%` : false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
      ))}
    </Pie>
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Legend />
  </PieChart>
);

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  centerText?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerText,
}) => (
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={80}
      paddingAngle={5}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
      ))}
    </Pie>
    <Tooltip 
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    />
    <Legend />
    {centerText && (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-semibold">
        {centerText}
      </text>
    )}
  </PieChart>
);

// Stat card component for displaying key metrics
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
          </p>
        )}
      </div>
      {icon && (
        <div className="text-gray-400">
          {icon}
        </div>
      )}
    </div>
  </div>
);
