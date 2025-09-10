/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing, FlatList } from 'react-native'
import { AppColors, responsiveFontSize, responsiveHeight, responsiveWidth } from '../utils';
import NormalHeader from './../components/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import AppTextInput from './../components/AppTextInput';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { KeyboardAvoidingView } from 'react-native';

const messages = [
    {
        id: "1",
        text: "Let me know when reached",
        time: "9:42 am",
        type: "received",
    },
    { id: "2", text: "I'm here", time: "9:43 am", type: "sent" },
];

const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const animateDot = (dot, delay) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(dot, {
                    toValue: 1,
                    duration: 400,
                    delay,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(dot, {
                    toValue: 0.3,
                    duration: 400,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        animateDot(dot1, 0);
        animateDot(dot2, 200);
        animateDot(dot3, 400);
    }, []);

    return (
        <View style={styles.typingContainer}>
            {[dot1, dot2, dot3].map((dot, index) => (
                <Animated.View
                    key={index}
                    style={[styles.dot, { opacity: dot }]}
                />
            ))}
        </View>
    );
};

const Chat = () => {
    const nav = useNavigation();
    const renderItem = ({ item }) => {
        const isSent = item.type === "sent";
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
                <Text style={styles.time}>{item.time}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: AppColors.WHITE }}>
                <NormalHeader heading={'Tony m.'} onBackPress={() => nav.goBack()} />
                <View>
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 10 }}
                    />

                    {/* Typing Indicator */}
                    <TypingIndicator />
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: AppColors.LIGHTESTGRAY, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: responsiveWidth(4), paddingVertical: responsiveHeight(3), }}>
                        <AppTextInput inputPlaceHolder={'Hello where'} containerBg={AppColors.WHITE} inputWidth={70} rightIcon={<Entypo name='attachment' size={responsiveFontSize(2.2)} />} />
                        <FontAwesome name='send' size={responsiveFontSize(2.8)} color={AppColors.PRIMARY} />
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9" },
    messageContainer: { marginVertical: 5 },
    sentContainer: { alignItems: "flex-end" },
    receivedContainer: { alignItems: "flex-start" },
    bubble: {
        padding: 10,
        borderRadius: 15,
        maxWidth: "70%",
    },
    sentBubble: { backgroundColor: "#FFD54F" }, // Yellow
    receivedBubble: { backgroundColor: AppColors.PRIMARY}, // Light Blue
    messageText: { fontSize: 16 },
    time: {
        fontSize: 12,
        color: "gray",
        marginTop: 2,
    },
    typingContainer: {
        flexDirection: "row",
        backgroundColor: "#FFF8E1",
        padding: 10,
        borderRadius: 15,
        alignSelf: "flex-start",
        margin: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFC107",
        marginHorizontal: 3,
        marginVertical: 3,
    },
});