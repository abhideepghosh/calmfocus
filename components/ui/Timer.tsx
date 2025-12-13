import React, { useRef } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface TimerProps {
    duration: number; // Max duration reference (e.g., 60 mins) or just used for calculation
    remaining: number; // Current set time in seconds
    onChange?: (newTime: number) => void;
    size?: number;
    maxSeconds?: number; // Cap for the slider (e.g. 24h)
}

const { width } = Dimensions.get('window');

export const Timer = ({
    duration,
    remaining,
    onChange,
    size = width * 0.7,
    maxSeconds = 24 * 3600, // 24 hours
    colors = Colors.light // Default to light if not provided
}: TimerProps & { colors?: typeof Colors.light }) => {
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    // We map 360 degrees (1 rotation) to 60 minutes (3600 seconds)
    // So 1 degree = 10 seconds.
    const SECONDS_PER_DEGREE = 10;
    const ONE_TURN_SECONDS = 3600;

    // State to track manipulation
    // preciseSeconds tracks the exact drag value, synced with remaining when not dragging (conceptually)
    // But since 'remaining' is prop-driven, we calculate angle from it.

    // We need 'prevAngle' to detect wrapping during drag.
    const prevAngleRef = useRef<number>(0);
    const totalRotationRef = useRef<number>(0);

    // Initialize refs based on current remaining time
    // If remaining = 3700 (1h 1m 40s), 
    // total degrees = 3700 / 10 = 370.
    // current angle component = 370 % 360 = 10.
    // rotations = 1.
    // This needs to be synced when 'remaining' changes externally ONLY if not dragging? 
    // actually we assume parent handles state.

    // Derived visual values
    const visualProgress = (remaining % ONE_TURN_SECONDS) / ONE_TURN_SECONDS;
    const strokeDashoffset = circumference - (visualProgress * circumference);
    const angle = visualProgress * 360;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Initialize refs on start of gesture to match current time
                // This ensures we start adding/subtracting from the current spot
                const currentTotalDegrees = remaining / SECONDS_PER_DEGREE;
                totalRotationRef.current = currentTotalDegrees;
                prevAngleRef.current = (currentTotalDegrees % 360);
            },
            onPanResponderMove: (evt, gestureState) => {
                if (!onChange) return;

                const { locationX, locationY } = evt.nativeEvent;
                const x = locationX - center;
                const y = locationY - center;

                // Calculate absolute angle 0-360
                let angleRad = Math.atan2(y, x);
                let angleDeg = angleRad * (180 / Math.PI);
                angleDeg += 90; // Rotate correction
                if (angleDeg < 0) angleDeg += 360;

                // Determine delta
                let delta = angleDeg - prevAngleRef.current;

                // Detect wrap
                if (delta > 180) {
                    delta -= 360; // We crossed 0 backwards (e.g. 10 -> 350)
                } else if (delta < -180) {
                    delta += 360; // We crossed 0 forwards (e.g. 350 -> 10)
                }

                // Apply delta
                const newTotalDegrees = totalRotationRef.current + delta;

                // Update refs
                totalRotationRef.current = newTotalDegrees;
                prevAngleRef.current = angleDeg;

                // Convert to seconds
                let newSeconds = Math.round(newTotalDegrees * SECONDS_PER_DEGREE);

                // Clamp
                if (newSeconds < 0) newSeconds = 0;
                if (newSeconds > maxSeconds) newSeconds = maxSeconds;

                // Snap (15s)
                newSeconds = Math.round(newSeconds / 15) * 15;

                onChange(newSeconds);
            }
        })
    ).current;

    // Time Formatting
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAngleRad = (angle - 90) * (Math.PI / 180);
    const handleX = center + radius * Math.cos(handleAngleRad);
    const handleY = center + radius * Math.sin(handleAngleRad);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View {...(onChange ? panResponder.panHandlers : {})} style={StyleSheet.absoluteFill} />
            <Svg width={size} height={size} pointerEvents="none">
                {/* Background Circle */}
                <Circle
                    stroke={colors.input}
                    fill="none"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <Circle
                    stroke={colors.primary}
                    fill="none"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                />
                {/* Handle (Knob) */}
                {onChange && (
                    <Circle
                        cx={handleX}
                        cy={handleY}
                        r={strokeWidth}
                        fill={colors.card}
                        stroke={colors.primary}
                        strokeWidth={2}
                        transform={`rotate(${0} ${handleX} ${handleY})`}
                    />
                )}
            </Svg>
            <View style={styles.textContainer} pointerEvents="none">
                <Text style={[styles.timeText, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={1}>
                    {formatTime(remaining)}
                </Text>
                <Text style={[styles.subText, { color: colors.textSecondary }]}>FOCUS</Text>
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
        justifyContent: 'center',
        width: '60%', // Constrain width
        height: '60%',
    },
    timeText: {
        fontSize: 56,
        fontWeight: '300',
        color: Colors.light.text,
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 8,
        letterSpacing: 2,
        fontWeight: '600',
    },
});
