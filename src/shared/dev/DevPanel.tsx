// src/shared/dev/DevPanel.tsx
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

export default function DevPanel() {
  const [ts, setTs] = useState<string>("");

  useEffect(() => setTs(new Date().toISOString()), []);

  return (
    <View style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>ADD Dev Panel</Text>
      <Text>platform: {Platform.OS}</Text>
      <Text>ts: {ts}</Text>
      <Text>status: baseline online ✅</Text>
    </View>
  );
}
