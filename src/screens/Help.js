import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';

import NormalHeader from '../components/NormalHeader';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../utils';

const CONTACT_INFO = {
  phone: '872-227-2133',
  phoneDial: 'tel:8722272133',
  website: 'https://serbicorporation.com',
  email: 'info@serbicorporation.com',
};

const FAQ_SECTIONS = [
  {
    category: 'Booking & Inspections',
    icon: 'calendar-outline',
    items: [
      {
        id: 'faq-1',
        question: 'How do I book a pest control specialist?',
        answer:
          'Open the app, select your desired service (such as Bed Bugs, Rodents, Termites, or Ants), choose the severity level (Low, Medium, or High), confirm your property address, and tap "Request Inspection". A certified, licensed technician in your area will be dispatched.',
      },
      {
        id: 'faq-2',
        question: 'How does the inspection fee & treatment quote work?',
        answer:
          'A transparent upfront inspection fee applies to dispatch a licensed specialist to your location to diagnose the infestation. Once the on-site assessment is complete, the specialist provides an itemized estimate for recommended treatments. No treatment begins without your explicit approval.',
      },
      {
        id: 'faq-3',
        question: 'Can I track my assigned technician?',
        answer:
          'Yes! As soon as a specialist accepts your service request, you can view their real-time location and estimated arrival time on the map. You can also communicate directly with them via in-app chat or phone.',
      },
      {
        id: 'faq-4',
        question: 'Can I reschedule or cancel a booking?',
        answer:
          'You can view and manage your active bookings under the Appointments section. To reschedule or cancel an appointment, open the booking details or reach out directly to our 24/7 dispatch hotline at 872-227-2133.',
      },
    ],
  },
  {
    category: 'Technicians & Safety Protocols',
    icon: 'shield-checkmark-outline',
    items: [
      {
        id: 'faq-5',
        question: 'Are Serbi Corporation technicians licensed & insured?',
        answer:
          'Yes, 100%. Every specialist operating through Serbi Corporation is required to maintain active state pest control applicator licenses, general liability insurance, and certified credentials. All licenses are thoroughly vetted by our compliance team.',
      },
      {
        id: 'faq-6',
        question: 'Are treatments safe for pets and children?',
        answer:
          'Our licensed technicians strictly follow EPA-approved guidelines and Integrated Pest Management (IPM) protocols. Your technician will provide specific safety instructions regarding ventilation and any temporary vacating times before treatment begins.',
      },
      {
        id: 'faq-7',
        question: 'What types of pests do you treat?',
        answer:
          'We cover comprehensive residential and commercial pest management including Bed Bugs, Termites, Rodents (Rats & Mice), Cockroaches, Ants, Spiders, Fleas, Ticks, Stinging Insects (Bees & Wasps), and general preventative perimeter sprays.',
      },
    ],
  },
  {
    category: 'Payments & Account Management',
    icon: 'card-outline',
    items: [
      {
        id: 'faq-8',
        question: 'What payment methods are supported?',
        answer:
          'All payments are processed securely through Stripe. We accept all major credit and debit cards (Visa, MasterCard, American Express, Discover). Your payment credentials are tokenized and encrypted with bank-grade 256-bit SSL.',
      },
      {
        id: 'faq-9',
        question: 'How do technician payouts work?',
        answer:
          'Independent specialists receive payouts directly to their linked bank accounts via Stripe Connect. Payouts are transferred automatically once services are verified and completed.',
      },
      {
        id: 'faq-10',
        question: 'How can I delete my account and associated data?',
        answer:
          'You can request account deletion anytime directly in Settings > Delete Account, or submit an official deletion request via email to info@serbicorporation.com. In compliance with privacy standards, all personal data will be permanently purged.',
      },
    ],
  },
];

const Help = () => {
  const nav = useNavigation();
  const [expandedId, setExpandedId] = useState('faq-1');

  const toggleFaq = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleOpenPhone = async () => {
    try {
      const supported = await Linking.canOpenURL(CONTACT_INFO.phoneDial);
      if (supported) {
        await Linking.openURL(CONTACT_INFO.phoneDial);
      } else {
        Toast.show(`Call us: ${CONTACT_INFO.phone}`, Toast.LONG);
      }
    } catch {
      Toast.show(`Call us: ${CONTACT_INFO.phone}`, Toast.LONG);
    }
  };

  const handleOpenEmail = async () => {
    const url = `mailto:${CONTACT_INFO.email}?subject=Serbi%20Customer%20Support%20Request`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.show(`Email: ${CONTACT_INFO.email}`, Toast.LONG);
      }
    } catch {
      Toast.show(`Email: ${CONTACT_INFO.email}`, Toast.LONG);
    }
  };

  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL(CONTACT_INFO.website);
    } catch {
      Toast.show(`Visit: ${CONTACT_INFO.website}`, Toast.LONG);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <NormalHeader heading="HELP & SUPPORT" onBackPress={() => nav.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero Support Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="headset" size={32} color="#0D9488" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Serbi Corporation Client & Specialist Care
          </Text>
          <Text style={styles.heroDesc}>
            Need assistance with a pest inspection, technician dispatch, or
            pricing? Our team is available 24/7 to ensure your home and property
            are protected.
          </Text>

          <View style={styles.availabilityPill}>
            <View style={styles.activeDot} />
            <Text style={styles.availabilityText}>
              24/7 Dispatch Hotline Active
            </Text>
          </View>
        </View>

        {/* 2. Direct Contact Channels */}
        <View style={styles.contactCard}>
          <Text style={styles.contactCardTitle}>DIRECT SUPPORT CHANNELS</Text>
          <Text style={styles.contactCardSubtitle}>
            Tap below to connect instantly with a dispatch agent:
          </Text>

          <View style={styles.contactButtonsGroup}>
            {/* Phone Support */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactItem}
              onPress={handleOpenPhone}
            >
              <View style={[styles.contactIconBox, styles.phoneIconBg]}>
                <Ionicons name="call" size={18} color="#0284C7" />
              </View>
              <View style={styles.contactTextBox}>
                <Text style={styles.contactLabel}>Phone Support (24/7)</Text>
                <Text style={styles.contactValue}>{CONTACT_INFO.phone}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.contactDivider} />

            {/* Email Support */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactItem}
              onPress={handleOpenEmail}
            >
              <View style={[styles.contactIconBox, styles.emailIconBg]}>
                <Ionicons name="mail" size={18} color="#16A34A" />
              </View>
              <View style={styles.contactTextBox}>
                <Text style={styles.contactLabel}>Email Assistance</Text>
                <Text style={styles.contactValue}>{CONTACT_INFO.email}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.contactDivider} />

            {/* Website Support */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactItem}
              onPress={handleOpenWebsite}
            >
              <View style={[styles.contactIconBox, styles.websiteIconBg]}>
                <Ionicons name="globe-outline" size={18} color="#9333EA" />
              </View>
              <View style={styles.contactTextBox}>
                <Text style={styles.contactLabel}>Web Portal & Booking</Text>
                <Text style={styles.contactValue} numberOfLines={1}>
                  {CONTACT_INFO.website}
                </Text>
              </View>
              <Feather name="external-link" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Emergency Dispatch Banner */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeaderRow}>
            <View style={styles.emergencyIconBox}>
              <Ionicons name="flash" size={18} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Urgent Infestation?</Text>
              <Text style={styles.emergencySub}>
                Immediate priority dispatch available for critical pest
                concerns.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emergencyCallBtn}
            onPress={handleOpenPhone}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={styles.emergencyBtnText}>
              CALL DISPATCH: {CONTACT_INFO.phone}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Trust & Service Highlights */}
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
            <Text style={styles.highlightTitle}>Licensed</Text>
            <Text style={styles.highlightSub}>Vetted Specialists</Text>
          </View>
          <View style={styles.highlightBadge}>
            <Ionicons name="time" size={18} color="#0284C7" />
            <Text style={styles.highlightTitle}>24/7 Care</Text>
            <Text style={styles.highlightSub}>Rapid Response</Text>
          </View>
          <View style={styles.highlightBadge}>
            <Ionicons name="card" size={18} color="#7C3AED" />
            <Text style={styles.highlightTitle}>Stripe Secure</Text>
            <Text style={styles.highlightSub}>Protected Payments</Text>
          </View>
        </View>

        {/* 5. Frequently Asked Questions (Accordion) */}
        <View style={styles.faqHeaderSection}>
          <Text style={styles.faqSectionHeading}>
            FREQUENTLY ASKED QUESTIONS
          </Text>
          <Text style={styles.faqSectionSub}>
            Find instant answers to common questions about services & bookings:
          </Text>
        </View>

        {FAQ_SECTIONS.map((section, sIdx) => (
          <View key={`sec-${sIdx}`} style={styles.faqCategoryCard}>
            <View style={styles.faqCategoryHeader}>
              <View style={styles.categoryIconCircle}>
                <Ionicons name={section.icon} size={16} color="#0D9488" />
              </View>
              <Text style={styles.categoryTitle}>{section.category}</Text>
            </View>

            {section.items.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const isLast = idx === section.items.length - 1;

              return (
                <View key={item.id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.faqQuestionRow}
                    onPress={() => toggleFaq(item.id)}
                  >
                    <Text
                      style={[
                        styles.faqQuestionText,
                        isExpanded && styles.faqQuestionTextActive,
                      ]}
                    >
                      {item.question}
                    </Text>
                    <View
                      style={[
                        styles.faqToggleBadge,
                        isExpanded && styles.faqToggleBadgeActive,
                      ]}
                    >
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={isExpanded ? '#0D9488' : '#64748B'}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}

                  {!isLast && <View style={styles.faqDivider} />}
                </View>
              );
            })}
          </View>
        ))}

        {/* 6. Footer Information */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerBrand}>Serbi Corporation</Text>
          <Text style={styles.footerTagline}>
            Professional On-Demand Pest Control & Protection Platform
          </Text>
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} Serbi Corporation. All Rights Reserved.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Help;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingTop: responsiveHeight(1.5),
    paddingBottom: responsiveHeight(4),
  },

  // 1. Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: responsiveWidth(5),
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(1.5),
    borderWidth: 3,
    borderColor: '#F0FDFA',
  },
  heroTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 3,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: responsiveFontSize(1.35),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: responsiveHeight(1.2),
    paddingHorizontal: responsiveWidth(2),
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: responsiveHeight(1.5),
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  availabilityText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#15803D',
  },

  // 2. Contact Card
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: responsiveWidth(4.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: responsiveHeight(2),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contactCardTitle: {
    fontSize: responsiveFontSize(1.35),
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  contactCardSubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginBottom: responsiveHeight(1.5),
    lineHeight: 18,
  },
  contactButtonsGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1.4),
    paddingHorizontal: responsiveWidth(3.5),
    gap: 12,
  },
  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIconBg: {
    backgroundColor: '#E0F2FE',
  },
  emailIconBg: {
    backgroundColor: '#DCFCE7',
  },
  websiteIconBg: {
    backgroundColor: '#FAF5FF',
  },
  contactTextBox: {
    flex: 1,
  },
  contactLabel: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: responsiveFontSize(1.45),
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: responsiveWidth(3.5),
  },

  // 3. Emergency Card
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: responsiveWidth(4.5),
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: responsiveHeight(2),
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: responsiveHeight(1.4),
  },
  emergencyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '800',
    color: '#991B1B',
  },
  emergencySub: {
    fontSize: responsiveFontSize(1.25),
    color: '#B91C1C',
    lineHeight: 17,
    marginTop: 2,
  },
  emergencyCallBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveHeight(1.3),
    borderRadius: 12,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: responsiveFontSize(1.35),
    letterSpacing: 0.4,
  },

  // 4. Highlights
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(2.5),
    gap: 8,
  },
  highlightBadge: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  highlightTitle: {
    fontSize: responsiveFontSize(1.35),
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 5,
    textAlign: 'center',
  },
  highlightSub: {
    fontSize: responsiveFontSize(1.1),
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },

  // 5. FAQ Section
  faqHeaderSection: {
    marginBottom: responsiveHeight(1.4),
    paddingHorizontal: 4,
  },
  faqSectionHeading: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.8,
  },
  faqSectionSub: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginTop: 2,
  },
  faqCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: responsiveWidth(4.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: responsiveHeight(2),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  faqCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: responsiveHeight(1.2),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: responsiveHeight(1),
  },
  categoryIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '800',
    color: '#0F172A',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveHeight(1.2),
    gap: 10,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#334155',
    lineHeight: 20,
  },
  faqQuestionTextActive: {
    fontWeight: '700',
    color: '#0D9488',
  },
  faqToggleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqToggleBadgeActive: {
    backgroundColor: '#CCFBF1',
  },
  faqAnswerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: responsiveHeight(1),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqAnswerText: {
    fontSize: responsiveFontSize(1.35),
    color: '#475569',
    lineHeight: 20,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // 6. Footer
  footerContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(1.5),
    paddingVertical: responsiveHeight(1.5),
  },
  footerBrand: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: responsiveFontSize(1.15),
    color: '#94A3B8',
  },
  bottomSpacer: {
    height: responsiveHeight(2),
  },
});
