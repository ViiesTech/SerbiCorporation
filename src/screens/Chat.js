import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';

import { AppColors, responsiveFontSize } from '../utils';
import NormalHeader from '../components/NormalHeader';
import {
  useLazyGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
} from '../redux/services';
import {
  connectSocket,
  getSocket,
  emitTyping,
  emitStopTyping,
} from '../services/socket';

const Chat = () => {
  const nav = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialScrolledRef = useRef(false);

  const { user, token } = useSelector(state => state.persistedData);
  const currentUserId = user?._id;

  // Extract other user info from route params
  const otherUserId =
    route?.params?.otherUserId ||
    route?.params?.receiverId ||
    route?.params?.userId ||
    route?.params?.item?._id ||
    route?.params?.item?.id ||
    route?.params?.user?._id;

  const heading =
    route?.params?.name ||
    route?.params?.userName ||
    route?.params?.user?.fullName ||
    route?.params?.item?.username ||
    route?.params?.item?.name ||
    'Chat';

  const [messagesList, setMessagesList] = useState([]);
  const [inputText, setInputText] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const [getMessages] = useLazyGetMessagesQuery();
  const [sendMessageMutation, { isLoading: isSending }] =
    useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const maxLayoutHeightRef = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContainerLayout = e => {
    const { height } = e.nativeEvent.layout;
    if (height > maxLayoutHeightRef.current) {
      maxLayoutHeightRef.current = height;
    }
    setLayoutHeight(height);
  };

  const hasWindowResized =
    Platform.OS === 'android' &&
    layoutHeight > 0 &&
    maxLayoutHeightRef.current - layoutHeight >= keyboardHeight * 0.6;

  const androidInputOffset =
    Platform.OS === 'android' && keyboardHeight > 0 && !hasWindowResized
      ? keyboardHeight
      : 0;

  // 1. Fetch Initial Messages (Cursor Pagination)
  const fetchInitialMessages = useCallback(async () => {
    if (!otherUserId) {
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);
    try {
      const res = await getMessages({
        otherUserId,
        limit: 20,
      }).unwrap();

      if (res?.success && Array.isArray(res?.data)) {
        setMessagesList(res.data);
        setNextCursor(res.nextCursor || null);
        setHasMore(!!res.hasMore);
      }
    } catch (err) {
      console.log('Error fetching initial messages:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, [otherUserId, getMessages]);

  useEffect(() => {
    fetchInitialMessages();
  }, [fetchInitialMessages]);

  // 2. Load Older Messages (Cursor Pagination on scroll up)
  const loadOlderMessages = async () => {
    if (!hasMore || !nextCursor || loadingMore || !otherUserId) return;

    setLoadingMore(true);
    try {
      const res = await getMessages({
        otherUserId,
        limit: 20,
        cursor: nextCursor,
      }).unwrap();

      if (res?.success && Array.isArray(res?.data)) {
        setMessagesList(prev => {
          // Deduplicate by _id
          const existingIds = new Set(prev.map(m => m._id));
          const uniqueNewMessages = res.data.filter(
            m => !existingIds.has(m._id),
          );
          return [...uniqueNewMessages, ...prev];
        });
        setNextCursor(res.nextCursor || null);
        setHasMore(!!res.hasMore);
      }
    } catch (err) {
      console.log('Error loading older messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Socket.IO Listeners (Real-time Message & Typing Indicators)
  useEffect(() => {
    const socket = getSocket() || connectSocket(token, currentUserId);
    if (!socket) return;

    const onNewMessage = message => {
      console.log('Real-time message received:', message);
      // Check if message belongs to this conversation
      const isFromOther =
        String(message?.senderId) === String(otherUserId) &&
        String(message?.receiverId) === String(currentUserId);
      const isToOther =
        String(message?.senderId) === String(currentUserId) &&
        String(message?.receiverId) === String(otherUserId);

      if (isFromOther || isToOther) {
        setMessagesList(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Mark as read immediately if received while in this active chat
        if (isFromOther) {
          markMessagesAsRead({ otherUserId })
            .unwrap()
            .catch(() => {});
        }

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    const onUserTyping = ({ senderId }) => {
      if (String(senderId) === String(otherUserId)) {
        setIsOtherUserTyping(true);
      }
    };

    const onUserStopTyping = ({ senderId }) => {
      if (String(senderId) === String(otherUserId)) {
        setIsOtherUserTyping(false);
      }
    };

    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('userStopTyping', onUserStopTyping);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('userStopTyping', onUserStopTyping);
    };
  }, [token, currentUserId, otherUserId, markMessagesAsRead]);

  // 4. Handle Typing Indicators
  const handleTextChange = text => {
    setInputText(text);

    if (!otherUserId) return;

    emitTyping(otherUserId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(otherUserId);
    }, 2000);
  };

  // 5. Send Message (REST API + append)
  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!otherUserId) {
      return Toast.show(
        'Unable to send message: Receiver not found',
        Toast.SHORT,
      );
    }

    const textToSend = inputText.trim();
    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitStopTyping(otherUserId);

    try {
      const res = await sendMessageMutation({
        receiverId: otherUserId,
        text: textToSend,
      }).unwrap();

      if (res?.success && res.data) {
        setMessagesList(prev => {
          if (prev.some(m => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.log('Error sending message:', err);
      Toast.show(err?.data?.msg || 'Failed to send message', Toast.SHORT);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isSent = String(item.senderId) === String(currentUserId);
    const timeFormatted = moment(item.createdAt).format('h:mm A');

    return (
      <View
        style={[
          styles.messageContainer,
          isSent ? styles.sentContainer : styles.receivedContainer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isSent ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={styles.time}>{timeFormatted}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
      onLayout={handleContainerLayout}
    >
      <NormalHeader heading={heading} onBackPress={() => nav.goBack()} />

      {loadingInitial ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={AppColors.ThemeBlue} />
          <Text style={styles.loaderText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messagesList}
          keyExtractor={item => item._id || String(item.createdAt)}
          renderItem={renderMessageItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          onScroll={event => {
            const { contentOffset } = event.nativeEvent;
            if (contentOffset.y <= 15 && hasMore && !loadingMore) {
              loadOlderMessages();
            }
          }}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (!initialScrolledRef.current && messagesList.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
              initialScrolledRef.current = true;
            }
          }}
          ListHeaderComponent={
            loadingMore ? (
              <View style={styles.loadingMoreBox}>
                <ActivityIndicator size="small" color="#999" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={42}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {!otherUserId ? 'No Conversation Selected' : 'No messages yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {!otherUserId
                  ? 'Please select a conversation from your inbox.'
                  : `Say hello to ${heading} to start the conversation!`}
              </Text>
              {!otherUserId && (
                <TouchableOpacity
                  style={styles.openInboxBtn}
                  onPress={() => nav.navigate('Inbox')}
                >
                  <Text style={styles.openInboxBtnText}>View All Messages</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Typing Indicator */}
      {isOtherUserTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{heading} is typing...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom:
              Platform.OS === 'ios'
                ? Math.max(insets.bottom, 10)
                : androidInputOffset > 0
                ? androidInputOffset + 10
                : Math.max(insets.bottom, 15),
          },
        ]}
      >
        <View style={styles.inputPill}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor="#9E9E9E"
            multiline
            maxLength={1000}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
          activeOpacity={0.7}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={AppColors.ThemeBlue} />
          ) : (
            <Ionicons
              name="send"
              size={responsiveFontSize(2.5)}
              color={inputText.trim() ? AppColors.ThemeBlue : '#B0BEC5'}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.WHITE,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 14,
    color: '#64748B',
  },
  list: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  loadingMoreBox: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '78%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sentBubble: {
    backgroundColor: '#A0CCD9',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 21,
  },
  time: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 3,
    marginHorizontal: 4,
  },
  openInboxBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#A0CCD9',
  },
  openInboxBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F8F9FD',
  },
  typingText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.BLACK,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
