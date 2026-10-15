import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';

import NormalHeader from '../components/NormalHeader';
import {
  AppColors,
  getProfileImage,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';
import { colors } from '../assets/colors';
import { useLazyGetInboxQuery } from '../redux/services';
import { getSocket, connectSocket } from '../services/socket';

const formatMessageTime = dateString => {
  if (!dateString) return '';
  const msgDate = moment(dateString);
  const now = moment();

  if (now.isSame(msgDate, 'day')) {
    return msgDate.format('h:mm A');
  } else if (now.diff(msgDate, 'days') === 1) {
    return 'Yesterday';
  } else if (now.diff(msgDate, 'days') < 7) {
    return msgDate.format('dddd');
  } else {
    return msgDate.format('MM/DD/YY');
  }
};

const Inbox = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();
  const { user, token } = useSelector(state => state.persistedData);
  const currentUserId = user?._id;

  const [getInboxQuery, { isFetching }] = useLazyGetInboxQuery();

  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Inbox Data
  const fetchInbox = useCallback(
    async (pageToFetch = 1, isRefresh = false) => {
      try {
        if (pageToFetch === 1 && !isRefresh) {
          setLoadingInitial(true);
        }

        const res = await getInboxQuery({
          page: pageToFetch,
          limit: 20,
        }).unwrap();

        if (res?.success && Array.isArray(res?.data)) {
          if (pageToFetch === 1) {
            setConversations(res.data);
          } else {
            setConversations(prev => {
              const existingIds = new Set(prev.map(c => c.conversationId));
              const uniqueNew = res.data.filter(
                c => !existingIds.has(c.conversationId),
              );
              return [...prev, ...uniqueNew];
            });
          }

          setPage(pageToFetch);
          setHasMore(!!res?.pagination?.hasMore);
        }
      } catch (err) {
        console.log('Error fetching inbox:', err);
      } finally {
        setLoadingInitial(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [getInboxQuery],
  );

  // Initial & Focus Refresh
  useEffect(() => {
    if (isFocused) {
      fetchInbox(1, true);
    }
  }, [isFocused, fetchInbox]);

  // 2. Real-Time Socket Listener
  useEffect(() => {
    const socket = getSocket() || connectSocket(token, currentUserId);
    if (!socket) return;

    const onNewMessage = message => {
      console.log('Inbox received real-time message:', message);

      setConversations(prev => {
        const otherId =
          String(message.senderId) === String(currentUserId)
            ? String(message.receiverId)
            : String(message.senderId);

        const convIndex = prev.findIndex(
          c => String(c.otherUser?._id) === otherId,
        );

        if (convIndex > -1) {
          const updatedConv = {
            ...prev[convIndex],
            lastMessage: message,
            unreadCount:
              String(message.senderId) !== String(currentUserId)
                ? (prev[convIndex].unreadCount || 0) + 1
                : prev[convIndex].unreadCount,
          };

          const remaining = prev.filter((_, idx) => idx !== convIndex);
          return [updatedConv, ...remaining];
        } else {
          // If conversation is brand new, refresh inbox to get populated user details
          fetchInbox(1, true);
          return prev;
        }
      });
    };

    socket.on('newMessage', onNewMessage);

    return () => {
      socket.off('newMessage', onNewMessage);
    };
  }, [token, currentUserId, fetchInbox]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInbox(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !isFetching) {
      setLoadingMore(true);
      fetchInbox(page + 1);
    }
  };

  // 3. Search Filter
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      c =>
        c.otherUser?.fullName?.toLowerCase().includes(q) ||
        c.otherUser?.name?.toLowerCase().includes(q) ||
        c.lastMessage?.text?.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const renderConversationItem = ({ item }) => {
    const otherUser = item.otherUser || {};
    const lastMessage = item.lastMessage || {};
    const isUnread = item.unreadCount > 0;
    const isSentByMe = String(lastMessage.senderId) === String(currentUserId);
    const userRole = otherUser.type || 'Technician';

    const avatarUri = otherUser.profileImage
      ? getProfileImage(otherUser.profileImage, true)
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[styles.convCard, isUnread && styles.convCardUnread]}
        onPress={() =>
          nav.navigate('Chat', {
            otherUserId: otherUser._id,
            name: otherUser.fullName || otherUser.name || 'User',
            userName: otherUser.fullName || otherUser.name,
            userImage: otherUser.profileImage,
            user: otherUser,
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#64748B" />
            </View>
          )}
          <View style={styles.onlineBadge} />
        </View>

        {/* Conversation Details */}
        <View style={styles.convDetails}>
          <View style={styles.convTopRow}>
            <View style={styles.nameGroup}>
              <Text style={styles.userNameText} numberOfLines={1}>
                {otherUser.fullName || otherUser.name || 'Technician'}
              </Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{userRole}</Text>
              </View>
            </View>

            <Text style={[styles.timeText, isUnread && styles.timeTextUnread]}>
              {formatMessageTime(lastMessage.createdAt)}
            </Text>
          </View>

          <View style={styles.convBottomRow}>
            <Text
              style={[
                styles.lastMessageText,
                isUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {isSentByMe && (
                <Text style={styles.sentPrefix}>
                  {lastMessage.isRead ? '✓✓ ' : '✓ '}You:{' '}
                </Text>
              )}
              {lastMessage.text || 'No message content'}
            </Text>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NormalHeader heading="Messages" onBackPress={() => nav.goBack()} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      {loadingInitial ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.secondary_button} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item =>
            item.conversationId || item.otherUser?._id || String(Math.random())
          }
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.secondary_button]}
              tintColor={colors.secondary_button}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator
                  size="small"
                  color={colors.secondary_button}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconHalo}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={40}
                    color="#A0CCD9"
                  />
                </View>
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matching chats' : 'No Conversations Yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try searching with a different name or keyword.'
                  : 'Start a conversation with a technician to receive real-time updates and quotes.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Inbox;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4.5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  convCardUnread: {
    backgroundColor: 'rgba(160, 204, 217, 0.06)',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  roleTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeTextUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  convBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13.5,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  sentPrefix: {
    color: '#A0CCD9',
    fontWeight: '700',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A0CCD9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: responsiveHeight(15),
  },
  emptyIconHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(160, 204, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(160, 204, 217, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
