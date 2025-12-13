import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface TimerProps {
    duration: number; // in seconds
    remaining: number; // in seconds
    size?: number;
}

const { width } = Dimensions.get('window');

export const Timer = ({ duration, remaining, size = width * 0.7 }: TimerProps) => {
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Prevent division by zero
    const progress = duration > 0 ? remaining / duration : 0;
    const strokeDashoffset = circumference - (progress * circumference);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    stroke={Colors.light.input}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <Circle
                    stroke={Colors.light.primary}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={styles.textContainer}>
                <Text style={styles.timeText}>{formattedTime}</Text>
                <Text style={styles.subText}>FOCUS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 56,
        fontWeight: '300',
        color: Colors.light.text,
        fontVariant: ['tabular-nums'],
    },
    subText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 8,
        letterSpacing: 2,
        fontWeight: '600',
    },
});
