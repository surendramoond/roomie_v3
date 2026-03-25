import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../../shared/constants/colors';
import * as chatService from '../services/chatService';
import { STACK_ROUTES } from '../../../shared/constants/navigation';
import { useAuth } from '../../auth/hooks/useAuth';
import { USER_ROLES } from '../../../shared/constants/roles';

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString();

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const isLandlord = user?.role === USER_ROLES.LANDLORD;

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations(user);
      setConversations(response);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const renderItem = ({ item }) => {
    const participantName = isLandlord
      ? item.requesterName || item.requesterIdentifier || 'Student'
      : item.landlordName;

    return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate(STACK_ROUTES.CHAT_ROOM, {
          conversationId: item.id,
          participantName,
        })
      }
    >
      <View style={styles.topRow}>
        <Text style={styles.name}>{participantName}</Text>
        <Text style={styles.date}>{formatDate(item.lastMessageAt)}</Text>
      </View>
      <Text style={styles.listingTitle}>{item.listingTitle}</Text>
      <Text numberOfLines={1} style={styles.preview}>
        {item.lastMessageText}
      </Text>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>
                {isLandlord
                  ? 'Student inquiries for your listings will appear here.'
                  : 'Open a listing and tap Contact Landlord to start one.'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: 12,
  },
  chatItem: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  listingTitle: {
    marginTop: 4,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  preview: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
