import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function CustomButton({
  title,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
  textStyle,
}) {
  const filled = variant === 'filled';
  const outline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        filled && styles.filled,
        outline && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          filled && styles.filledText,
          outline && styles.outlineText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  filled: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  filledText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});
