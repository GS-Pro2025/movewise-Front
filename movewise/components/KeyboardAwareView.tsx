import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ScrollView, ViewProps } from 'react-native';

interface KeyboardAwareViewProps extends ViewProps {
  children: React.ReactNode;
}

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({ children, style, ...props }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, style]}
      {...props}
    >
      {/* We're not using ScrollView here to avoid VirtualizedList nesting issues */}
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});