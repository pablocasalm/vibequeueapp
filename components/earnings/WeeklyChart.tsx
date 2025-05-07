import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform, Text, Pressable } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import Sizes from '@/constants/Sizes';
import Card from '../ui/Card';

const { width: screenWidth } = Dimensions.get('window');
const BAR_WIDTH = 40;
const BAR_GAP = 16;
const AXIS_LABEL_WIDTH = 40;
const CHART_PADDING = Sizes.spacing.md;
const HORIZONTAL_MARGIN = BAR_GAP;
const LABEL_MAX_WIDTH = BAR_WIDTH + (BAR_GAP * 0.75);

type EventData = {
  id: string;
  name: string;
  amount: number;
};

type WeeklyChartProps = {
  data: EventData[];
  totalEarnings: number;
};

type TooltipProps = {
  x: number;
  y: number;
  event: EventData;
  onPress: () => void;
};

const truncateText = (text: string, maxWidth: number) => {
  const charWidth = 6.5;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '…';
};

const Tooltip = ({ x, y, event, onPress }: TooltipProps) => {
  const tooltipWidth = 140;
  const tooltipHeight = 60;
  const arrowSize = 8;
  
  const adjustedX = Math.max(tooltipWidth / 2, Math.min(x, screenWidth - tooltipWidth / 2));
  
  return (
    <Pressable 
      onPress={onPress}
      style={[
        styles.tooltip,
        {
          left: adjustedX - (tooltipWidth / 2),
          top: y - tooltipHeight - arrowSize - 2,
          width: tooltipWidth,
        }
      ]}
    >
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipTitle} numberOfLines={1}>{event.name}</Text>
        <Text style={styles.tooltipAmount}>${event.amount}</Text>
      </View>
      <View style={[styles.tooltipArrow, {
        left: tooltipWidth / 2 - arrowSize + (x - adjustedX),
      }]} />
    </Pressable>
  );
};

export default function WeeklyChart({ data, totalEarnings }: WeeklyChartProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ event: EventData; x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(screenWidth - (2 * CHART_PADDING));
  
  const chartHeight = 200;
  const labelHeight = 40;
  const topPadding = 60;
  const bottomPadding = 20;
  
  const barsWidth = (data.length * (BAR_WIDTH + BAR_GAP)) - BAR_GAP;
  const totalWidth = barsWidth + (2 * HORIZONTAL_MARGIN) + AXIS_LABEL_WIDTH;
  
  const shouldScroll = totalWidth > containerWidth;
  const chartWidth = Math.max(totalWidth, containerWidth);

  const maxAmount = Math.max(...data.map(item => item.amount), 0);
  const maxScale = Math.ceil(maxAmount / 10) * 10;
  const scale = maxScale > 0 ? (chartHeight - topPadding - bottomPadding) / maxScale : 0;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const handleBarPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleBarSelect = (event: EventData, x: number, y: number) => {
    setSelectedEvent(prev => 
      prev?.event.id === event.id ? null : { event, x, y }
    );
  };

  const handleOutsidePress = () => {
    setSelectedEvent(null);
  };

  const renderGridLines = () => {
    if (!scale || isNaN(scale)) {
      return null;
    }

    const lines = [];
    const values = [0, maxScale / 2, maxScale];

    const yAxisY1 = topPadding;
    const yAxisY2 = chartHeight - bottomPadding;
    
    if (!isNaN(yAxisY1) && !isNaN(yAxisY2)) {
      lines.push(
        <Line
          key="y-axis"
          x1={AXIS_LABEL_WIDTH}
          y1={yAxisY1}
          x2={AXIS_LABEL_WIDTH}
          y2={yAxisY2}
          stroke={Colors.dark.border}
          strokeWidth={1}
        />
      );
    }

    const rightBoundaryY1 = topPadding;
    const rightBoundaryY2 = chartHeight - bottomPadding;
    
    if (!isNaN(rightBoundaryY1) && !isNaN(rightBoundaryY2)) {
      lines.push(
        <Line
          key="right-boundary"
          x1={chartWidth - HORIZONTAL_MARGIN}
          y1={rightBoundaryY1}
          x2={chartWidth - HORIZONTAL_MARGIN}
          y2={rightBoundaryY2}
          stroke={Colors.dark.border}
          strokeWidth={1}
        />
      );
    }

    values.forEach((value, i) => {
      const y = chartHeight - bottomPadding - ((value / maxScale) * (chartHeight - topPadding - bottomPadding));

      if (!isNaN(y)) {
        lines.push(
          <React.Fragment key={`grid-${i}`}>
            <Line
              x1={AXIS_LABEL_WIDTH}
              y1={y}
              x2={chartWidth - HORIZONTAL_MARGIN}
              y2={y}
              stroke={Colors.dark.border}
              strokeWidth={1}
              strokeDasharray={i === 0 || i === values.length - 1 ? "" : "4,4"}
            />
            <SvgText
              x={AXIS_LABEL_WIDTH - 12}
              y={y + 4}
              fill={Colors.dark.secondaryText}
              fontSize={Sizes.fontSize.sm}
              fontWeight="600"
              textAnchor="end"
            >
              {Math.round(value)}
            </SvgText>
          </React.Fragment>
        );
      }
    });
    
    return lines;
  };

  const renderBar = (item: EventData, index: number) => {
    const barHeight = Math.max(item.amount * scale, 0);
    const x = AXIS_LABEL_WIDTH + HORIZONTAL_MARGIN + (index * (BAR_WIDTH + BAR_GAP));
    const y = chartHeight - bottomPadding - barHeight;   
    
    if (isNaN(y)) {
      return null;
    }

    const displayName = truncateText(item.name, LABEL_MAX_WIDTH);

    const isSelected = selectedEvent?.event.id === item.id;
    const barColor = isSelected ? Colors.dark.primary : (selectedEvent ? '#3A3A3A' : Colors.dark.primary);
    const barOpacity = selectedEvent ? (isSelected ? 1 : 0.6) : 0.9;

    const barProps = Platform.select({
      web: {
        onClick: () => handleBarSelect(item, x + (BAR_WIDTH / 2), y)
      },
      default: {
        onPress: () => handleBarSelect(item, x + (BAR_WIDTH / 2), y)
      }
    });

    return (
      <G key={item.id}>
        <Rect
          x={x}
          y={y}
          width={BAR_WIDTH}
          height={barHeight > 0 ? barHeight : 1}
          fill={barColor}
          rx={4}
          opacity={barOpacity}
          {...barProps}
        />
        <SvgText
          x={x + (BAR_WIDTH / 2)}
          y={chartHeight - bottomPadding + 25}
          fill={Colors.dark.secondaryText}
          fontSize={Sizes.fontSize.sm}
          fontWeight="600"
          textAnchor="middle"
          opacity={selectedEvent && !isSelected ? 0.6 : 1}
        >
          {displayName}
        </SvgText>
      </G>
    );
  };

  return (
    <View onLayout={(event) => {
      setContainerWidth(event.nativeEvent.layout.width - (2 * CHART_PADDING));
    }}>
      <Card>
        <View style={[styles.headerContainer, { marginBottom: Sizes.spacing.sm }]}>
          <Text style={styles.headerTitle}>Event Earnings</Text>
          <Text style={styles.totalAmount}>${totalEarnings}</Text>
        </View>
        
        <Animated.View style={[styles.chartContainer, animatedStyle]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={shouldScroll}
            contentContainerStyle={[
              styles.scrollContent,
              { minWidth: shouldScroll ? undefined : '100%' }
            ]}
            onScroll={handleOutsidePress}
            scrollEventThrottle={16}
          >
            <Pressable onPress={handleOutsidePress}>
              <View>
                <Svg width={chartWidth} height={chartHeight + labelHeight}>
                  {renderGridLines()}
                  {data.map((item, index) => renderBar(item, index))}
                </Svg>

                {selectedEvent && (
                  <Tooltip
                    x={selectedEvent.x}
                    y={selectedEvent.y}
                    event={selectedEvent.event}
                    onPress={() => handleBarPress(selectedEvent.event.id)}
                  />
                )}
              </View>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
  },
  totalAmount: {
    color: Colors.dark.primary,
    fontSize: Sizes.fontSize.xl,
    fontWeight: '700',
  },
  chartContainer: {
    marginTop: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.uiElement,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  tooltipContent: {
    padding: 10,
  },
  tooltipTitle: {
    color: Colors.dark.text,
    fontSize: Sizes.fontSize.md,
    fontWeight: '600',
  },
  tooltipAmount: {
    color: Colors.dark.primary,
    fontSize: Sizes.fontSize.lg,
    fontWeight: '600',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.dark.cardBackground,
  },
});