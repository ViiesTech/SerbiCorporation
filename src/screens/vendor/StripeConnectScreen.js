import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-simple-toast';

import Container from '../../components/Container';
import NormalHeader from '../../components/NormalHeader';
import LineBreak from '../../components/LineBreak';
import { colors } from '../../assets/colors';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../utils';
import {
  useLazyGetStripeConnectStatusQuery,
  useCreateStripeOnboardingLinkMutation,
  useLazyGetStripeDashboardLinkQuery,
} from '../../redux/services';

const StripeConnectScreen = ({ navigation }) => {
  const [fetchStatus, { data, isLoading: statusLoading }] =
    useLazyGetStripeConnectStatusQuery();
  const [createOnboardingLink, { isLoading: linkLoading }] =
    useCreateStripeOnboardingLinkMutation();
  const [fetchDashboardLink, { isLoading: dashboardLoading }] =
    useLazyGetStripeDashboardLinkQuery();

  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      await fetchStatus().unwrap();
    } catch (e) {
      console.log('Error fetching Stripe Connect status:', e);
    }
  }, [fetchStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  }, [loadStatus]);

  const stripeConnect = data?.stripeConnect || {};
  const isConnected = !!stripeConnect.isConnected;
  const payoutsEnabled = !!stripeConnect.payoutsEnabled;
  const chargesEnabled = !!stripeConnect.chargesEnabled;
  const detailsSubmitted = !!stripeConnect.detailsSubmitted;

  // Handle Start / Resume Onboarding
  const handleConnectBank = async () => {
    try {
      const res = await createOnboardingLink({
        country: 'US',
        returnUrl: 'https://sarbi.app/stripe-connect/return',
        refreshUrl: 'https://sarbi.app/stripe-connect/refresh',
      }).unwrap();

      if (res?.url) {
        navigation.navigate('StripeOnboardingScreen', {
          onboardingUrl: res.url,
        });
      } else {
        Toast.show(res?.msg || 'Could not generate link', Toast.SHORT);
      }
    } catch (err) {
      console.log('Error generating onboarding link:', err);
      const msg = err?.data?.msg || err?.data?.message || 'Failed to create onboarding session';
      Alert.alert('Connection Error', msg);
    }
  };

  // Handle Open Stripe Express Dashboard
  const handleOpenDashboard = async () => {
    try {
      const res = await fetchDashboardLink().unwrap();
      if (res?.url) {
        const supported = await Linking.canOpenURL(res.url);
        if (supported) {
          await Linking.openURL(res.url);
        } else {
          navigation.navigate('StripeOnboardingScreen', {
            onboardingUrl: res.url,
          });
        }
      } else {
        Toast.show(res?.msg || 'Dashboard link unavailable', Toast.SHORT);
      }
    } catch (err) {
      console.log('Error opening dashboard:', err);
      const msg = err?.data?.msg || err?.data?.message || 'Could not open dashboard';
      Alert.alert('Dashboard Error', msg);
    }
  };

  return (
    <Container scrollEnabled={false} extraStyle={styles.container}>
      <NormalHeader
        heading="Bank & Payouts"
        onBackPress={() => navigation.goBack()}
      />
      <LineBreak val={1} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {statusLoading && !refreshing ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loaderText}>Checking Stripe account...</Text>
          </View>
        ) : (
          <>
            {/* Status Hero Card */}
            {isConnected ? (
              <View style={[styles.statusHero, styles.statusHeroConnected]}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIconBoxSuccess}>
                    <Ionicons
                      name="shield-checkmark"
                      size={28}
                      color="#16A34A"
                    />
                  </View>
                  <View style={styles.heroTextMeta}>
                    <Text style={styles.heroTitle}>Connected & Verified</Text>
                    <Text style={styles.heroSubtitle}>
                      Your bank account is set up for direct job payouts
                    </Text>
                  </View>
                </View>

                {stripeConnect.accountId && (
                  <View style={styles.accountPillRow}>
                    <View style={styles.accountPill}>
                      <Ionicons name="card-outline" size={14} color="#166534" />
                      <Text style={styles.accountPillText}>
                        ID: {stripeConnect.accountId}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleOpenDashboard}
                      disabled={dashboardLoading}
                      style={styles.dashboardPillBtn}
                      activeOpacity={0.7}
                    >
                      {dashboardLoading ? (
                        <ActivityIndicator size="small" color="#166534" />
                      ) : (
                        <>
                          <Ionicons
                            name="open-outline"
                            size={12}
                            color="#166534"
                          />
                          <Text style={styles.dashboardPillText}>
                            Stripe Portal
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : detailsSubmitted ? (
              <View style={[styles.statusHero, styles.statusHeroPending]}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIconBoxPending}>
                    <Ionicons name="time" size={28} color="#D97706" />
                  </View>
                  <View style={styles.heroTextMeta}>
                    <Text style={styles.heroTitle}>Verification Pending</Text>
                    <Text style={styles.heroSubtitle}>
                      Stripe is reviewing your bank and identity details
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.statusHero, styles.statusHeroDisconnected]}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIconBoxDisconnected}>
                    <Ionicons name="wallet-outline" size={28} color="#0F172A" />
                  </View>
                  <View style={styles.heroTextMeta}>
                    <Text style={styles.heroTitle}>Connect Bank Account</Text>
                    <Text style={styles.heroSubtitle}>
                      Link your bank account to receive 90% direct payouts for
                      every job
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <LineBreak val={2} />

            {/* Account Details & Status Checklist */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Account Capabilities</Text>
              <View style={styles.divider} />

              <View style={styles.checkItem}>
                <View style={styles.checkItemLeft}>
                  <View
                    style={[
                      styles.dot,
                      payoutsEnabled ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                  <Text style={styles.checkItemLabel}>Direct Payouts</Text>
                </View>
                <Text
                  style={[
                    styles.checkItemStatus,
                    payoutsEnabled ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  {payoutsEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              <View style={styles.checkItem}>
                <View style={styles.checkItemLeft}>
                  <View
                    style={[
                      styles.dot,
                      chargesEnabled ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                  <Text style={styles.checkItemLabel}>Card Processing</Text>
                </View>
                <Text
                  style={[
                    styles.checkItemStatus,
                    chargesEnabled ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  {chargesEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>

              <View style={styles.checkItem}>
                <View style={styles.checkItemLeft}>
                  <View
                    style={[
                      styles.dot,
                      detailsSubmitted ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                  <Text style={styles.checkItemLabel}>Identity Information</Text>
                </View>
                <Text
                  style={[
                    styles.checkItemStatus,
                    detailsSubmitted ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  {detailsSubmitted ? 'Submitted' : 'Pending'}
                </Text>
              </View>
            </View>

            <LineBreak val={2} />

            {/* Split Commission Breakdown Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="pie-chart-outline" size={18} color="#0F172A" />
                <Text style={styles.cardSectionTitle}>Earnings & Commission</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.splitRow}>
                <View style={styles.splitBox}>
                  <Text style={styles.splitPercentText}>90%</Text>
                  <Text style={styles.splitLabel}>Your Share</Text>
                  <Text style={styles.splitSub}>Direct to Bank</Text>
                </View>

                <View style={styles.splitDivider} />

                <View style={styles.splitBox}>
                  <Text style={styles.splitPercentTextAdmin}>10%</Text>
                  <Text style={styles.splitLabel}>Platform Fee</Text>
                  <Text style={styles.splitSub}>Admin Share</Text>
                </View>
              </View>

              <View style={styles.calloutBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#0284C7"
                />
                <Text style={styles.calloutText}>
                  When a customer pays for an inspection or service, 90% is
                  transferred directly to your connected bank account via Stripe
                  Connect.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {!isConnected && (
              <>
                <LineBreak val={3} />
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleConnectBank}
                  disabled={linkLoading}
                  activeOpacity={0.8}
                >
                  {linkLoading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <>
                      <Feather name="external-link" size={18} color="#000000" />
                      <Text style={styles.primaryBtnText}>
                        {detailsSubmitted
                          ? 'Update Bank Details'
                          : 'Connect Bank Account'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <LineBreak val={1} />

                {/* Security Note */}
                <View style={styles.securityRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={14}
                    color="#64748B"
                  />
                  <Text style={styles.securityText}>
                    Secured by Stripe Connect. Your bank credentials are encrypted.
                  </Text>
                </View>
              </>
            )}

            <LineBreak val={4} />
          </>
        )}
      </ScrollView>
    </Container>
  );
};

export default StripeConnectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingBottom: responsiveHeight(5),
  },
  loaderBox: {
    paddingVertical: responsiveHeight(15),
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
  },
  statusHero: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  statusHeroConnected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusHeroPending: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
  },
  statusHeroDisconnected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconBoxSuccess: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconBoxPending: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconBoxDisconnected: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextMeta: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: responsiveFontSize(1.9),
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    lineHeight: 18,
  },
  accountPillRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dashboardPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dashboardPillText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#166534',
  },
  accountPillText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '600',
    color: '#166534',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#16A34A',
  },
  dotInactive: {
    backgroundColor: '#E2E8F0',
  },
  checkItemLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '500',
    color: '#334155',
  },
  checkItemStatus: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '600',
  },
  statusActive: {
    color: '#16A34A',
  },
  statusInactive: {
    color: '#94A3B8',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  splitBox: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  splitPercentText: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '900',
    color: '#16A34A',
  },
  splitPercentTextAdmin: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '900',
    color: '#64748B',
  },
  splitLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#0F172A',
  },
  splitSub: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
  },
  splitDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E2E8F0',
  },
  calloutBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  calloutText: {
    flex: 1,
    fontSize: responsiveFontSize(1.2),
    color: '#0369A1',
    lineHeight: 17,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#000000',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  securityText: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    textAlign: 'center',
  },
});
