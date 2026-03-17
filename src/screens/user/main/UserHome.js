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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-simple-toast';

import Container from '../../../components/Container';
import HomeHeader from '../../../components/HomeHeader';
import Drawer from '../../../components/Drawer';
import LineBreak from '../../../components/LineBreak';
import AppText from '../../../components/AppText';
import AppTextInput from '../../../components/AppTextInput';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';

import {
  AppColors,
  DEFAULT_REGION,
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
  const [severityOpen, setSeverityOpen] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [note, setNote] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
        })),
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
      // Explicit reset before starting
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);

      const animationTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100); // 100ms delay to ensure layout is ready

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
      Toast.show('Select a service', Toast.SHORT);
      return;
    }

    const fields = [
      { condition: !propertyValue, msg: 'Select property type' },
      {
        condition: propertyValue === 'Residential' && !residentialValue,
        msg: 'Select residential type',
      },
      { condition: !areaValue.trim(), msg: 'Enter area' },
      { condition: !severityValue, msg: 'Select severity' },
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

  const FormLabel = ({ title }) => (
    <>
      <AppText
        title={title}
        color={AppColors.BLACK}
        size={1.6}
        fontWeight="bold"
      />
      <LineBreak val={0.5} />
    </>
  );

  console.log('selectedServiceId:-', selectedServiceId);
  return (
    <Container contentStyle={styles.containerPadding}>
      <HomeHeader menuIconOnPress={() => setDrawerOpen(true)} />

      {serviceLoader || typeLoader ? (
        <Loader />
      ) : (
        <>
          <Drawer
            isVisible={drawerOpen}
            onBackdropPress={() => setDrawerOpen(false)}
          />

          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            ref={mapRef}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            onMapReady={() => setMapReady(true)}
          >
            {coordinates && (
              <Marker coordinate={coordinates}>
                <Image source={images.pin_marker} style={styles.markerIcon} />
              </Marker>
            )}
          </MapView>

          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <LineBreak val={2} />
            <AppText
              title="Which services do you need?"
              fontWeight="bold"
              size={2}
              textTransform="uppercase"
            />
            <LineBreak val={1.5} />
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
              contentContainerStyle={styles.flatListGap}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.formSection,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <AppText
              title="Request Form"
              color={AppColors.BLACK}
              size={2.3}
              textTransform="uppercase"
              fontWeight="bold"
            />
            <LineBreak val={1} />

            <View style={styles.formContainer}>
              <FormLabel title="Property Type" />
              <View style={styles.zIndex3}>
                <DropDownPicker
                  open={openProperty}
                  value={propertyValue}
                  items={propertyItems}
                  placeholder="Select"
                  setOpen={setOpenProperty}
                  setValue={callback => {
                    setPropertyValue(callback());
                    if (callback() === 'Residential') setResidentialOpen(true);
                  }}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
              </View>

              {propertyValue === 'Residential' && (
                <>
                  <FormLabel title="Residential Type" />
                  <View style={styles.zIndex2}>
                    <DropDownPicker
                      open={residentialOpen}
                      value={residentialValue}
                      items={[
                        { label: 'Single Family', value: 'Single Family' },
                        { label: 'Multi Units', value: 'Multi Units' },
                      ]}
                      placeholder="Select"
                      setOpen={setResidentialOpen}
                      setValue={setResidentialValue}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownContainer}
                    />
                  </View>
                </>
              )}

              <FormLabel title="Area To Be Treated" />
              <AppTextInput
                inputPlaceHolder="Area (e.g. Backyard)"
                value={areaValue}
                onChangeText={setAreaValue}
                borderRadius={100}
                inputWidth={80}
              />

              <FormLabel title="Issue Severity" />
              <View style={styles.zIndex1}>
                <DropDownPicker
                  open={severityOpen}
                  value={severityValue}
                  items={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                  ]}
                  placeholder="Select"
                  setOpen={setSeverityOpen}
                  setValue={setSeverityValue}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                />
              </View>

              <FormLabel title="Special Instructions" />
              <AppTextInput
                inputPlaceHolder="Provide more details..."
                inputHeight={10}
                value={note}
                onChangeText={setNote}
                multiline
                textAlignVertical="top"
                borderRadius={15}
                inputWidth={80}
              />
            </View>

            <LineBreak val={3} />
            <Button
              title="Submit Request"
              onPress={validateAndSubmit}
              textTransform="uppercase"
              color={AppColors.PRIMARY}
              width={90}
            />
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
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <Animated.View
        style={[
          styles.serviceCard,
          isSelected && styles.serviceCardActive,
          { transform: [{ scale }] },
        ]}
      >
        <Image source={item.icon} style={styles.serviceIcon} />
        <AppText
          title={item.title}
          color={isSelected ? AppColors.PRIMARY : AppColors.BLACK}
          size={1.1}
          fontWeight="bold"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerPadding: { paddingBottom: responsiveHeight(5) },
  map: { height: responsiveHeight(40), width: responsiveWidth(100) },
  markerIcon: { height: 40, width: 40, resizeMode: 'contain' },
  section: { paddingHorizontal: responsiveWidth(4) },
  flatListGap: { gap: 12, paddingRight: 20 },
  serviceCard: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    width: responsiveWidth(32),
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: AppColors.WHITE,
  },
  serviceCardActive: {
    borderWidth: 2,
    borderColor: AppColors.PRIMARY,
    elevation: 3,
  },
  serviceIcon: {
    width: 45,
    height: 45,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  formSection: { paddingHorizontal: responsiveWidth(4), marginTop: 20 },
  formContainer: {
    backgroundColor: AppColors.WHITE,
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 3,
  },
  dropdown: { borderColor: colors.secondary_button, borderRadius: 30 },
  dropdownContainer: { borderColor: colors.secondary_button, borderRadius: 15 },
  zIndex3: { zIndex: 3000 },
  zIndex2: { zIndex: 2000 },
  zIndex1: { zIndex: 1000 },
});

export default UserHome;
