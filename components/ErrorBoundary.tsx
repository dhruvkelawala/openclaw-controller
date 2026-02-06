import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-black items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-500/20 rounded-3xl items-center justify-center mb-6">
            <Text className="text-4xl">⚠️</Text>
          </View>
          <Text className="text-white text-xl font-bold mb-3 text-center">
            Something went wrong
          </Text>
          <Text className="text-zinc-400 text-base text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-white rounded-xl py-4 px-8"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
