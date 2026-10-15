import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Animated,
  Text,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-simple-toast';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Container from '../../../components/Container';
import HomeHeader from '../../../components/HomeHeader';
import Drawer from '../../../components/Drawer';
import Loader from '../../../components/Loader';

import {
  AppColors,
  DEFAULT_REGION,
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import { colors } from '../../../assets/colors';
import { images } from '../../../assets/images';
import { firstTimeVisit } from '../../../redux/slices';
import {
  useLazyAllPropertyTypesQuery,
  useLazyAllServicesQuery,
} from '../../../redux/services/adminApis';

const iconMap = {
  Rats: images.rat,
  Termites: images.other,
  Spiders: images.spider,
  Roaches: images.roaches,
  Mice: images.mice,
  Mouse: images.rat,
  Gnats: images.gnats,
  Flies: images.flies,
  'Drain Flies': images.drainFlies,
  Bees: images.bee,
  'Bed Bugs': images.bedBug,
  Ants: images.ant,
  Other: images.ant,
};

const severityOptions = [
  {
    value: 'Low',
    label: 'Low',
    desc: 'Minor issue',
    icon: 'shield-checkmark',
    activeBg: '#ECFDF5',
    activeBorder: '#10B981',
    activeColor: '#059669',
  },
  {
    value: 'Medium',
    label: 'Medium',
    desc: 'Visible pests',
    icon: 'alert-circle',
    activeBg: '#FFFBEB',
    activeBorder: '#F59E0B',
    activeColor: '#D97706',
  },
  {
    value: 'High',
    label: 'High',
    desc: 'Infestation',
    icon: 'flame',
    activeBg: '#FEF2F2',
    activeBorder: '#EF4444',
    activeColor: '#DC2626',
  },
];

const UserHome = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const { firstVisit, user } = useSelector(state => state.persistedData);

  const mapRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // Data States
  const [servicesData, setServicesData] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [propertyItems, setPropertyItems] = useState([]);

  // Form States
  const [propertyValue, setPropertyValue] = useState(null);
  const [openProperty, setOpenProperty] = useState(false);
  const [residentialValue, setResidentialValue] = useState(null);
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [severityValue, setSeverityValue] = useState(null);
  const [areaValue, setAreaValue] = useState('');
  const [note, setNote] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  const [getServices, { isLoading: serviceLoader }] = useLazyAllServicesQuery();
  const [getPropertyTypes, { isLoading: typeLoader }] =
    useLazyAllPropertyTypesQuery();

  const services = useMemo(
    () =>
      servicesData.map(item => ({
        id: item._id,
        title: item.name,
        icon: iconMap[item.name] || images.ant,
      })),
    [servicesData],
  );

  const fetchInitialData = useCallback(async () => {
    try {
      const [serviceRes, propertyRes] = await Promise.all([
        getServices().unwrap(),
        getPropertyTypes().unwrap(),
      ]);

      setServicesData(serviceRes?.data || []);
      setPropertyItems(
        propertyRes?.data?.map(item => ({
          label: item.propertyType,
          value: item.propertyType,
        })) || [],
      );

      if (user?.location?.coordinates) {
        const region = {
          latitude: user.location.coordinates[1],
          longitude: user.location.coordinates[0],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setCoordinates(region);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  }, [getServices, getPropertyTypes, user]);

  useEffect(() => {
    fetchInitialData();
    const timer = setTimeout(() => dispatch(firstTimeVisit(false)), 5000);
    return () => clearTimeout(timer);
  }, [fetchInitialData, dispatch]);

  useEffect(() => {
    if (!serviceLoader && !typeLoader && !firstVisit) {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
      scaleAnim.setValue(0.97);

      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      return () => clearTimeout(animationTimer);
    }
  }, [serviceLoader, typeLoader, firstVisit, fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (coordinates && mapReady) {
      mapRef.current?.animateToRegion(coordinates, 1000);
    }
  }, [coordinates, mapReady]);

  const validateAndSubmit = () => {
    if (!selectedServiceId) {
      Toast.show('Please select a pest service', Toast.SHORT);
      return;
    }

    const fields = [
      { condition: !propertyValue, msg: 'Select property type' },
      {
        condition: propertyValue === 'Residential' && !residentialValue,
        msg: 'Select residential type',
      },
      { condition: !areaValue.trim(), msg: 'Enter area to be treated' },
      { condition: !severityValue, msg: 'Select issue severity' },
      { condition: !note.trim(), msg: 'Enter specific instructions' },
    ];

    const error = fields.find(f => f.condition);
    if (error) return Toast.show(error.msg, Toast.SHORT);

    nav.navigate('Services', {
      service: selectedServiceId,
      lat: coordinates?.latitude,
      long: coordinates?.longitude,
      requestData: {
        propertyType: propertyValue,
        residential: residentialValue,
        area: areaValue,
        severity: severityValue,
        note,
      },
    });
  };

  if (firstVisit) return null;

  return (
    <Container
      extraStyle={styles.safeAreaBg}
      style={styles.screenBg}
      contentStyle={styles.containerPadding}
    >
      <HomeHeader
        menuIconOnPress={() => setDrawerOpen(true)}
        chatIconOnPress={() => nav.navigate('Inbox')}
        notificationOnPress={() => nav.navigate('Notifications')}
      />

      {serviceLoader || typeLoader ? (
        <View style={styles.loaderCenter}>
          <Loader />
        </View>
      ) : (
        <>
          <Drawer
            isVisible={drawerOpen}
            onBackdropPress={() => setDrawerOpen(false)}
            closeIconOnPress={() => setDrawerOpen(false)}
          />

          {/* Floating Map Card */}
          <View style={styles.mapCard}>
            <MapView
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={DEFAULT_REGION}
              onMapReady={() => setMapReady(true)}
            >
              {coordinates && (
                <Marker coordinate={coordinates}>
                  <Image source={images.pin_marker} style={styles.markerIcon} />
                </Marker>
              )}
            </MapView>

            {/* Map Top Floating Badge */}
            <View style={styles.mapBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.mapBadgeText}>Live Coverage Area</Text>
            </View>
          </View>

          {/* Services Section */}
          <Animated.View
            style={[
              styles.sectionWrapper,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Pest Services</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose the type of pest to treat
                </Text>
              </View>
              {selectedServiceId && (
                <View style={styles.selectedCountPill}>
                  <Text style={styles.selectedCountText}>1 Selected</Text>
                </View>
              )}
            </View>

            <FlatList
              data={services}
              horizontal
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedServiceId === item.id;
                return (
                  <ServiceCard
                    item={item}
                    isSelected={isSelected}
                    onPress={() => setSelectedServiceId(item.id)}
                  />
                );
              }}
              contentContainerStyle={styles.servicesListContainer}
            />
          </Animated.View>

          {/* Request Form Section */}
          <Animated.View
            style={[
              styles.formSectionWrapper,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.formCard}>
              {/* Form Card Header */}
              <View style={styles.formCardHeader}>
                <View style={styles.formHeaderIcon}>
                  <Feather name="clipboard" size={20} color="#0F172A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formTitle}>Request Treatment</Text>
                  <Text style={styles.formSubtitle}>
                    Fill in details for accurate pricing & dispatch
                  </Text>
                </View>
              </View>

              <View style={styles.formDivider} />

              {/* Field 1: Property Type */}
              <View style={[styles.fieldGroup, styles.zIndex3]}>
                <View style={styles.labelRow}>
                  <Feather name="home" size={16} color="#A0CCD9" />
                  <Text style={styles.fieldLabel}>Property Type</Text>
                </View>
                <DropDownPicker
                  open={openProperty}
                  value={propertyValue}
                  items={propertyItems}
                  placeholder="Select Property Type"
                  setOpen={setOpenProperty}
                  setValue={callback => {
                    const val = callback();
                    setPropertyValue(val);
                    if (val === 'Residential') setResidentialOpen(true);
                  }}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.placeholderText}
                />
              </View>

              {/* Field 2: Residential Type (Conditional) */}
              {propertyValue === 'Residential' && (
                <View style={[styles.fieldGroup, styles.zIndex2]}>
                  <View style={styles.labelRow}>
                    <Feather name="grid" size={16} color="#A0CCD9" />
                    <Text style={styles.fieldLabel}>Residential Unit Type</Text>
                  </View>
                  <DropDownPicker
                    open={residentialOpen}
                    value={residentialValue}
                    items={[
                      { label: 'Single Family Home', value: 'Single Family' },
                      {
                        label: 'Multi Units / Apartment',
                        value: 'Multi Units',
                      },
                    ]}
                    placeholder="Select Residential Type"
                    setOpen={setResidentialOpen}
                    setValue={setResidentialValue}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.placeholderText}
                  />
                </View>
              )}

              {/* Field 3: Area To Be Treated */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Feather name="map-pin" size={16} color="#A0CCD9" />
                  <Text style={styles.fieldLabel}>Area To Be Treated</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="e.g. Backyard, Kitchen, Attic, Entire Home"
                    placeholderTextColor="#94A3B8"
                    value={areaValue}
                    onChangeText={setAreaValue}
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Field 4: Infestation Severity (Interactive Pills) */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Feather name="activity" size={16} color="#A0CCD9" />
                  <Text style={styles.fieldLabel}>Infestation Severity</Text>
                </View>
                <View style={styles.severityRow}>
                  {severityOptions.map(option => {
                    const isSelected = severityValue === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.8}
                        onPress={() => setSeverityValue(option.value)}
                        style={[
                          styles.severityCard,
                          isSelected && {
                            backgroundColor: option.activeBg,
                            borderColor: option.activeBorder,
                            borderWidth: 1.5,
                          },
                        ]}
                      >
                        <View style={styles.severityIconRow}>
                          <Ionicons
                            name={option.icon}
                            size={16}
                            color={isSelected ? option.activeColor : '#94A3B8'}
                          />
                          {isSelected && (
                            <View
                              style={[
                                styles.severitySelectedDot,
                                { backgroundColor: option.activeColor },
                              ]}
                            />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.severityLabel,
                            isSelected && {
                              color: option.activeColor,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.severityDesc}>{option.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Field 5: Special Instructions */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Feather name="file-text" size={16} color="#A0CCD9" />
                  <Text style={styles.fieldLabel}>Special Instructions</Text>
                </View>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    placeholder="Describe specific pest activity, pets, gate access or preferred time..."
                    placeholderTextColor="#94A3B8"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    textAlignVertical="top"
                    style={styles.textArea}
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={validateAndSubmit}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Find Technicians</Text>
                <View style={styles.submitBtnIconWrapper}>
                  <Feather name="arrow-right" size={18} color="#0F172A" />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}
    </Container>
  );
};

const ServiceCard = ({ item, isSelected, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.93,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <Animated.View
        style={[
          styles.serviceCard,
          isSelected && styles.serviceCardActive,
          { transform: [{ scale }] },
        ]}
      >
        {isSelected && (
          <View style={styles.activeCheckmarkBadge}>
            <Ionicons name="checkmark" size={12} color="#0F172A" />
          </View>
        )}
        <View
          style={[
            styles.serviceIconContainer,
            isSelected && styles.serviceIconContainerActive,
          ]}
        >
          <Image source={item.icon} style={styles.serviceIcon} />
        </View>
        <Text
          style={[styles.serviceTitle, isSelected && styles.serviceTitleActive]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeAreaBg: {
    backgroundColor: '#FFFFFF',
  },
  screenBg: {
    backgroundColor: '#F8FAFC',
  },
  containerPadding: {
    paddingBottom: responsiveHeight(6),
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  mapCard: {
    height: responsiveHeight(24),
    marginHorizontal: responsiveWidth(4.5),
    marginTop: 14,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  markerIcon: {
    height: 42,
    width: 42,
    resizeMode: 'contain',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  mapBadgeText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionWrapper: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4.5),
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: responsiveFontSize(1.3),
    color: '#64748B',
    marginTop: 2,
  },
  selectedCountPill: {
    backgroundColor: 'rgba(160, 204, 217, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedCountText: {
    fontSize: responsiveFontSize(1.2),
    fontWeight: '700',
    color: '#0F172A',
  },
  servicesListContainer: {
    paddingHorizontal: responsiveWidth(4.5),
    paddingVertical: 4,
    gap: 12,
  },
  serviceCard: {
    width: responsiveWidth(28),
    height: 114,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardActive: {
    borderColor: '#A0CCD9',
    backgroundColor: '#F3FAFC',
    shadowColor: '#A0CCD9',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  activeCheckmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#A0CCD9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIconContainerActive: {
    backgroundColor: 'rgba(160, 204, 217, 0.25)',
  },
  serviceIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  serviceTitle: {
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  serviceTitleActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  formSectionWrapper: {
    paddingHorizontal: responsiveWidth(4.5),
    marginTop: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#A0CCD9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: responsiveFontSize(2.0),
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: responsiveFontSize(1.2),
    color: '#64748B',
    marginTop: 1,
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },
  fieldLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '700',
    color: '#1E293B',
  },
  dropdown: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownText: {
    fontSize: responsiveFontSize(1.4),
    color: '#0F172A',
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: responsiveFontSize(1.4),
    color: '#94A3B8',
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: responsiveFontSize(1.4),
    color: '#0F172A',
    paddingVertical: 0,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  severityIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    marginBottom: 4,
  },
  severitySelectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  severityLabel: {
    fontSize: responsiveFontSize(1.4),
    fontWeight: '600',
    color: '#334155',
  },
  severityDesc: {
    fontSize: responsiveFontSize(1.0),
    color: '#94A3B8',
    marginTop: 1,
  },
  textAreaContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textArea: {
    fontSize: responsiveFontSize(1.4),
    color: '#0F172A',
    minHeight: 75,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A0CCD9',
    borderRadius: 16,
    height: 52,
    marginTop: 6,
    gap: 10,
    shadowColor: '#A0CCD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  submitBtnIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zIndex3: {
    zIndex: 3000,
  },
  zIndex2: {
    zIndex: 2000,
  },
});

export default UserHome;
