// src/shared/dev/DevPanel.tsx
import { Platform, Text, View } from "react-native";
import { useDevClock } from "../../utils/timestamp/useDevClock";

const MONO = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export default function DevPanel() {
  const { localStr, utcStr, offsetStr, epochMs, sinceMountLabel } = useDevClock(1000);

  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#ccc",
        backgroundColor: "#f9f9f9",
        gap: 6,
        alignSelf: "stretch",     // occupy available width
        maxWidth: 520,            // cap width for readability
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
        ADD Dev Panel
      </Text>

      <KVRow label="platform" value={Platform.OS} />
      <KVRow
        label="local"
        value={`${localStr} (${offsetStr})`}
        monospace
      />
      <KVRow label="utc" value={utcStr} monospace />
      <KVRow label="epoch(ms)" value={String(epochMs)} monospace />
      <KVRow label="uptime" value={sinceMountLabel} monospace />
      <KVRow label="status" value="baseline online ✅" />
    </View>
  );
}

function KVRow({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Fixed-width label column */}
      <Text
        style={{
          width: 110,
          fontWeight: "600",
          color: "#444",
        }}
        numberOfLines={1}
      >
        {label}:
      </Text>

      {/* Stable value column */}
      <View
        style={{
          flex: 1,
          minWidth: 240,           // reserve space so digits don't resize the card
        }}
      >
        <Text
          style={[
            {
              includeFontPadding: false, // avoid Android padding wobble
              // prevent wrapping and truncation jitter
            },
            monospace && {
              fontFamily: MONO,
              fontVariant: Platform.OS === "ios" ? (["tabular-nums"] as any) : undefined,
              letterSpacing: 0.25, // small tracking helps legibility for monospace
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
