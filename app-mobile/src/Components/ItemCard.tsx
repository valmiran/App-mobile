import { View, Text } from 'react-native';
import type { Item } from '../data/items';

export default function ItemCard({ item }: { item: Item }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Text style={{ fontWeight: '700', marginBottom: 4 }}>{item.title}</Text>
      <Text style={{ color: '#334155', marginBottom: 4 }}>{item.subtitle}</Text>
      <Text style={{ color: '#64748b', fontSize: 12 }}>Data: {item.date}</Text>
    </View>
  );
}
