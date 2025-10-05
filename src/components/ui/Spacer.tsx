import React from 'react';
import { View } from 'react-native';

type Props = { size?: number; horizontal?: boolean };
export default function Spacer({ size = 12, horizontal }: Props) {
  return <View style={horizontal ? { width: size } : { height: size }} />;
}
