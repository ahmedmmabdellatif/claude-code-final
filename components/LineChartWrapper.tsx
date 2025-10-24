import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface LineChartWrapperProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  width: number;
  height: number;
}

export default function LineChartWrapper({ data, width, height }: LineChartWrapperProps) {
  if (Platform.OS === 'web') {
    const values = data.datasets[0].data;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * (width - 40);
      const y = height - 60 - ((value - min) / range) * (height - 80);
      return { x, y, value };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const cpX = (prevPoint.x + currentPoint.x) / 2;
      pathD += ` Q ${cpX} ${prevPoint.y}, ${cpX} ${(prevPoint.y + currentPoint.y) / 2}`;
      pathD += ` Q ${cpX} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
    }

    return (
      <View style={[styles.webContainer, { width, height }]}>
        <svg width={width} height={height}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: colors.progress.gradient.start, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: colors.progress.gradient.end, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            style={{ strokeWidth: 3, strokeLinecap: 'round' }}
          />
          
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={colors.accent.primary}
              stroke={colors.bg.surface}
              style={{ strokeWidth: 2 }}
            />
          ))}
        </svg>
        
        <View style={styles.webLabels}>
          {data.labels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.webLabel,
                { left: (index / (data.labels.length - 1)) * (width - 40) - 10 }
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const LineChart = require('react-native-chart-kit').LineChart;
  
  const chartConfig = {
    backgroundColor: colors.bg.surface,
    backgroundGradientFrom: colors.bg.surface,
    backgroundGradientTo: colors.bg.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(88, 204, 2, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(184, 188, 200, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.accent.primary,
    },
  };

  return (
    <LineChart
      data={data}
      width={width}
      height={height}
      chartConfig={chartConfig}
      bezier
      style={styles.nativeChart}
      withInnerLines={false}
      withOuterLines={false}
      withVerticalLabels={true}
      withHorizontalLabels={true}
      fromZero={false}
    />
  );
}

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: spacing.md,
    position: 'relative',
  },
  webLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
  },
  webLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    position: 'absolute',
  },
  nativeChart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
});
