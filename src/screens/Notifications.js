/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Toast from 'react-native-simple-toast';

import NormalHeader from '../components/NormalHeader';
import {
  getProfileImage,
  responsiveFontSize,
  responsiveWidth,
} from '../utils';
import {
  useLazyGetNotificationsQuery,
  useReadNotificationMutation,
} from '../redux/services';
import { handleNotificationClick } from '../config/Firebase';

const getStatusBadgeStyle = status => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'accepted':
    case 'confirm':
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    case 'on the way':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'arrived':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'paid':
      return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    case 'rejected':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    case 'discussing':
      return { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

const Notifications = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();
  const { token } = useSelector(state => state.persistedData);

  const [getNotificationsQuery, { isFetching }] =
    useLazyGetNotificationsQuery();
  const [readNotificationMutation] = useReadNotificationMutation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (pageToFetch = 1, isRefresh = false) => {
      if (!token) {
        console.log('[Notifications] No auth token found, skipping fetch');
        setLoadingInitial(false);
        return;
      }

      try {
        if (pageToFetch === 1 && !isRefresh) {
          setLoadingInitial(true);
        }

        console.log('[Notifications] Calling getNotifications API for page:', pageToFetch);
        const res = await getNotificationsQuery({
          page: pageToFetch,
          limit: 20,
        }).unwrap();

        console.log('[Notifications] getNotifications API Response:', res);

        if (res?.success && Array.isArray(res?.data)) {
          if (pageToFetch === 1) {
            setNotifications(res.data);
          } else {
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n._id));
              const uniqueNew = res.data.filter(n => !existingIds.has(n._id));
              return [...prev, ...uniqueNew];
            });
          }

          if (typeof res?.unreadCount === 'number') {
            setUnreadCount(res.unreadCount);
          } else {
            const count = res.data.filter(n => !n.isRead).length;
            setUnreadCount(count);
          }

          setPage(pageToFetch);
          setHasMore(!!res?.pagination?.hasMore);
        }
      } catch (err) {
        console.log('[Notifications] getNotifications API error:', err);
      } finally {
        setLoadingInitial(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [token, getNotificationsQuery],
  );

  useEffect(() => {
    if (isFocused) {
      fetchNotifications(1);
    }
  }, [isFocused, fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1, true);
  };

  const onEndReached = () => {
    if (!loadingInitial && !loadingMore && !isFetching && hasMore) {
      setLoadingMore(true);
      fetchNotifications(page + 1);
    }
  };

  // Mark single notification as read
  const handleItemPress = async item => {
    if (!item.isRead) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n._id === item._id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      try {
        await readNotificationMutation({ notificationId: item._id }).unwrap();
      } catch (e) {
        console.log('[Notifications] Mark read error:', e);
      }
    }

    // Trigger deep linking logic matching Section 5 of guide
    const payloadData = item.data || {};
    const notificationPayload = {
      ...payloadData,
      type: payloadData.type || item.type,
      senderId:
        payloadData.senderId ||
        item.senderId?._id ||
        (typeof item.senderId === 'string' ? item.senderId : undefined),
      formId: payloadData.formId,
      status: payloadData.status,
    };

    handleNotificationClick({ data: notificationPayload });
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 && !notifications.some(n => !n.isRead)) {
      Toast.show('All notifications already read', Toast.SHORT);
      return;
    }

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await readNotificationMutation({}).unwrap();
      Toast.show('Marked all as read', Toast.SHORT);
    } catch (e) {
      console.log('[Notifications] Mark all read error:', e);
      Toast.show('Could not mark all as read', Toast.SHORT);
    }
  };

  // Filtered notifications
  const displayedNotifications = useMemo(() => {
    if (selectedFilter === 'UNREAD') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, selectedFilter]);

  const renderItem = ({ item }) => {
    const isUnread = !item.isRead;
    const sender = item.senderId || {};
    const senderName = sender.fullName || sender.name || 'System';
    const profileImg = sender.profileImage
      ? getProfileImage(sender.profileImage, true)
      : null;

    const formattedTime = item.createdAt
      ? moment(item.createdAt).fromNow()
      : '';

    const statusBadge = item.data?.status
      ? getStatusBadgeStyle(item.data.status)
      : null;

    const isRequest = item.type === 'request';
    const isChat = item.type === 'chat';

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleItemPress(item)}
        style={[styles.card, isUnread && styles.unreadCard]}
      >
        {/* Left Indicator bar */}
        {isUnread && <View style={styles.unreadAccentBar} />}

        {/* Sender Avatar / Icon */}
        <View style={styles.avatarWrapper}>
          {profileImg ? (
            <Image source={{ uri: profileImg }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.iconAvatar,
                isRequest
                  ? styles.iconAvatarRequest
                  : isChat
                  ? styles.iconAvatarChat
                  : styles.iconAvatarDefault,
              ]}
            >
              <Feather
                name={
                  isRequest
                    ? 'calendar'
                    : isChat
                    ? 'message-circle'
                    : 'bell'
                }
                size={18}
                color={
                  isRequest
                    ? '#059669'
                    : isChat
                    ? '#2563EB'
                    : '#D97706'
                }
              />
            </View>
          )}

          {/* Type mini badge overlay */}
          <View
            style={[
              styles.typeBadge,
              isRequest
                ? { backgroundColor: '#10B981' }
                : isChat
                ? { backgroundColor: '#3B82F6' }
                : { backgroundColor: '#F59E0B' },
            ]}
          >
            <Feather
              name={
                isRequest
                  ? 'clipboard'
                  : isChat
                  ? 'message-square'
                  : 'bell'
              }
              size={9}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.titleText, isUnread && styles.unreadTitleText]}
              numberOfLines={1}
            >
              {item.title || (isChat ? `Message from ${senderName}` : 'Notification')}
            </Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>

          {/* Notification Body */}
          <Text
            style={[styles.bodyText, isUnread && styles.unreadBodyText]}
            numberOfLines={2}
          >
            {item.body || ''}
          </Text>

          {/* Optional Footer Details (Status Pill / Sender Tag) */}
          <View style={styles.footerRow}>
            {statusBadge && item.data?.status && (
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: statusBadge.bg,
                    borderColor: statusBadge.border,
                  },
                ]}
              >
                <Text
                  style={[styles.statusPillText, { color: statusBadge.text }]}
                >
                  {item.data.status}
                </Text>
              </View>
            )}

            {sender.fullName && !isChat && (
              <Text style={styles.senderSubText} numberOfLines={1}>
                by {sender.fullName}
              </Text>
            )}

            {isUnread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NormalHeader
        heading="Notifications"
        onBackPress={() => nav.goBack()}
        rightIcon={
          unreadCount > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAllAsRead}
              style={styles.markReadBtn}
            >
              <Feather name="check-circle" size={14} color="#2C6E80" />
              <Text style={styles.markReadText}>Mark read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedFilter('ALL')}
          style={[
            styles.filterTab,
            selectedFilter === 'ALL' && styles.filterTabActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'ALL' && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
          {notifications.length > 0 && (
            <View
              style={[
                styles.badgeCount,
                selectedFilter === 'ALL' && styles.badgeCountActive,
              ]}
            >
              <Text
                style={[
                  styles.badgeCountText,
                  selectedFilter === 'ALL' && styles.badgeCountTextActive,
                ]}
              >
                {notifications.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedFilter('UNREAD')}
          style={[
            styles.filterTab,
            selectedFilter === 'UNREAD' && styles.filterTabActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'UNREAD' && styles.filterTabTextActive,
            ]}
          >
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadgeCount}>
              <Text style={styles.unreadBadgeCountText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* List Container */}
      {loadingInitial ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2C6E80" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : displayedNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="bell-off" size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedFilter === 'UNREAD'
              ? 'No Unread Notifications'
              : 'No Notifications Yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === 'UNREAD'
              ? 'You have caught up with all your updates.'
              : 'New updates regarding your bookings, appointments, and messages will appear here.'}
          </Text>
          {selectedFilter === 'UNREAD' && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedFilter('ALL')}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllBtnText}>View All Notifications</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedNotifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2C6E80']}
              tintColor="#2C6E80"
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#2C6E80" />
              </View>
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: responsiveWidth(4.5),
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterTabActive: {
    backgroundColor: '#2C6E80',
  },
  filterTabText: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  badgeCount: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeCountText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    color: '#475569',
  },
  badgeCountTextActive: {
    color: '#FFFFFF',
  },
  unreadBadgeCount: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  unreadBadgeCountText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  markReadText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#2C6E80',
  },
  listContent: {
    paddingHorizontal: responsiveWidth(3.5),
    paddingTop: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A0CCD9',
    shadowColor: '#2C6E80',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2C6E80',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
    marginLeft: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
  },
  iconAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAvatarRequest: {
    backgroundColor: '#D1FAE5',
  },
  iconAvatarChat: {
    backgroundColor: '#DBEAFE',
  },
  iconAvatarDefault: {
    backgroundColor: '#FEF3C7',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  unreadTitleText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  timeText: {
    fontSize: responsiveFontSize(1.1),
    color: '#94A3B8',
    fontWeight: '500',
  },
  bodyText: {
    fontSize: responsiveFontSize(1.35),
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  unreadBodyText: {
    color: '#334155',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: responsiveFontSize(1.1),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  senderSubText: {
    fontSize: responsiveFontSize(1.1),
    color: '#94A3B8',
    marginLeft: 6,
    flexShrink: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C6E80',
    marginLeft: 'auto',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: responsiveFontSize(1.4),
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(10),
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize(1.35),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  viewAllBtn: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#2C6E80',
  },
  viewAllBtnText: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
