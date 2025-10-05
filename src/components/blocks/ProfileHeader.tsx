import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Spacer from '../ui/Spacer';

type Props = {
  name: string;
  title?: string;
  avatarUrl?: string;
};

export default function ProfileHeader({ name, title = 'Developer', avatarUrl }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: avatarUrl ?? 'https://i.pravatar.cc/120' }}
        style={styles.avatar}
      />
      <Spacer horizontal size={12} />
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ddd' },
  name: { fontSize: 18, fontWeight: '700' },
  title: { marginTop: 2, color: '#666' },
});
