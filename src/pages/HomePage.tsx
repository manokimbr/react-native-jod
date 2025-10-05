// src/pages/HomePage.tsx
import React from 'react';
import { Text } from 'react-native';
import DevPanel from '../shared/dev/DevPanel';
import GlobalStatePanel from '../shared/dev/GlobalStatePanel';
import DebugGlobalStateButton from '../shared/dev/debugGlobalStateButton';

export default function HomePage() {
  return (
    <>
      <Text style={{ fontSize: 14, color: '#444' }}>
        Open up App.tsx to start working on your app!
      </Text>
      <DevPanel />
      <GlobalStatePanel />

      <DebugGlobalStateButton
        label="Dev Mode"
        variant="outline"
        onToggled={(v) => console.log('Toggled dev mode to', v)}
      />
    </>
  );
}
