/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import Container from '../../../components/Container';
import HomeHeader from '../../../components/HomeHeader';
import Drawer from '../../../components/Drawer';
import {
  AppColors,
  DEFAULT_REGION,
  getCurrentLocation,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import LineBreak from '../../../components/LineBreak';
import icons from '../../../assets/icons';
import AppText from '../../../components/AppText';
import AppTextInput from '../../../components/AppTextInput';
import { useNavigation } from '@react-navigation/native';
import Button from '../../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { firstTimeVisit } from '../../../redux/slices';
import { colors } from '../../../assets/colors';
import {
  useLazyAllPropertyTypesQuery,
  useLazyAllServicesQuery,
} from '../../../redux/services/adminApis';
import { images } from '../../../assets/images';
import Loader from '../../../components/Loader';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-simple-toast';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const [propertyItems, setPropertyItems] = useState([]);
  const [propertyValue, setPropertyValue] = useState(null);
  const [openProperty, setOpenProperty] = useState(false);

  const [residentialValue, setResidentialValue] = useState(null);
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [residentialItems, setResidentialItems] = useState([
    { label: 'Single Family', value: 'Single Family' },
    { label: 'Multi Units', value: 'Multi Units' },
  ]);

  const [areaValue, setAreaValue] = useState('');

  const [severityValue, setSeverityValue] = useState(null);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [severityItems, setSeverityItems] = useState([
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ]);

  const [note, setNote] = useState('');

  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  const [getServices, { isLoading: serviceLoader }] = useLazyAllServicesQuery();
  const [getPropertyTypes, { isLoading: typeLoader }] =
    useLazyAllPropertyTypesQuery();

  // Memoized services
  const services = useMemo(() => {
    return servicesData.map(item => ({
      id: item._id,
      title: item.name,
      icon: iconMap[item.name],
    }));
  }, [servicesData]);

  useEffect(() => {
    fetchInitialData();
    const timer = setTimeout(() => {
      dispatch(firstTimeVisit(false));
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services?.[0].id);
    }
  }, [services]);

  useEffect(() => {
    if (coordinates && mapReady) {
      mapRef.current?.animateToRegion(
        {
          ...coordinates,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000,
      );
    }
  }, [coordinates, mapReady]);

  const fetchInitialData = async () => {
    try {
      const serviceRes = await getServices().unwrap();
      setServicesData(serviceRes?.data || []);

      const propertyRes = await getPropertyTypes().unwrap();
      const types = propertyRes?.data?.map(item => ({
        label: item.propertyType,
        value: item.propertyType,
        id: item._id,
      }));
      setPropertyItems(types);
    } catch (err) {
      console.log('err in getServices:-', err);
    }

    // const location = await getCurrentLocation();
    let region = {
      latitude: user?.location?.coordinates[1],
      longitude: user?.location?.coordinates[0],
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    // console.log('Location:-', region);
    setCoordinates(region);
  };

  if (firstVisit) {
    return null;
  }

  // console.log('services:----------', services);
  // console.log('selectedServiceId:----------', selectedServiceId);
  // 37.421998 -122.084
  console.log('user:----------', user);

  const validateAndSubmit = () => {
    if (!propertyValue) return Toast.show('Select property type', Toast.SHORT);
    if (propertyValue === 'Residential' && !residentialValue)
      return Toast.show('Select residential', Toast.SHORT);
    if (!areaValue) return Toast.show('Enter area', Toast.SHORT);
    if (!severityValue) return Toast.show('Select severity', Toast.SHORT);
    if (!note) return Toast.show('Enter note', Toast.SHORT);

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

  return (
    <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
      <HomeHeader menuIconOnPress={() => setDrawerOpen(true)} />

      {serviceLoader || typeLoader ? (
        <Loader />
      ) : (
        <>
          <Drawer
            isVisible={drawerOpen}
            onBackdropPress={() => setDrawerOpen(false)}
          />

          <LineBreak val={1} />

          <MapView
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            ref={mapRef}
            style={styles.map}
            initialRegion={DEFAULT_REGION} // DEFAULT_REGION
            onMapReady={() => setMapReady(true)}
          >
            {coordinates && (
              <Marker coordinate={coordinates}>
                <Image
                  source={images.pin_marker}
                  style={{ height: 40, width: 40 }}
                />
              </Marker>
            )}
          </MapView>

          <LineBreak val={2} />

          <View style={styles.section}>
            <AppText
              title="Which services do you need?"
              fontWeight="bold"
              size={2.2}
              textTransform="uppercase"
            />

            <LineBreak val={2} />

            <FlatList
              data={services}
              horizontal
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 15 }}
              renderItem={({ item }) => {
                const isSelected = selectedServiceId === item.id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardActive,
                    ]}
                    onPress={() => setSelectedServiceId(item.id)}
                  >
                    <Image source={item.icon} style={styles.serviceIcon} />
                    <AppText
                      title={item.title}
                      color={isSelected ? AppColors.PRIMARY : AppColors.BLACK}
                      size={1.2}
                      fontWeight="bold"
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <LineBreak val={2} />

          <View style={{ paddingHorizontal: responsiveWidth(4) }}>
            <AppText
              title={'Request Form'}
              color={AppColors.BLACK}
              size={2.5}
              textTransform={'uppercase'}
              fontWeight={'bold'}
            />

            <LineBreak val={1} />

            <View
              style={{
                backgroundColor: AppColors.WHITE,
                elevation: 5,
                borderRadius: 20,
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveHeight(2),
                gap: responsiveHeight(1),
              }}
            >
              <View>
                <AppText
                  title={'Property Type'}
                  color={AppColors.BLACK}
                  size={1.7}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <View style={{ zIndex: 3000 }}>
                  <DropDownPicker
                    open={openProperty}
                    value={propertyValue}
                    items={propertyItems}
                    dropDownDirection="BOTTOM"
                    placeholder="Select"
                    dropDownContainerStyle={{
                      borderColor: colors.secondary_button,
                      borderRadius: 15,
                    }}
                    style={{
                      borderRadius: openProperty ? 15 : 30,
                      borderColor: colors.secondary_button,
                    }}
                    setOpen={setOpenProperty}
                    setValue={val => {
                      setPropertyValue(val());
                      setResidentialOpen(true);
                    }}
                    setItems={setPropertyItems}
                  />
                </View>
              </View>
              {propertyValue === 'Residential' && (
                <View>
                  <AppText
                    title={'Residential'}
                    color={AppColors.BLACK}
                    size={1.7}
                    fontWeight={'bold'}
                  />
                  <LineBreak val={0.5} />
                  <View style={{ zIndex: 2000 }}>
                    <DropDownPicker
                      open={residentialOpen}
                      value={residentialValue}
                      items={residentialItems}
                      dropDownDirection="BOTTOM"
                      placeholder="Select"
                      dropDownContainerStyle={{
                        borderColor: colors.secondary_button,
                        borderRadius: 15,
                      }}
                      style={{
                        borderRadius: residentialOpen ? 15 : 30,
                        borderColor: colors.secondary_button,
                      }}
                      setOpen={setResidentialOpen}
                      setValue={setResidentialValue}
                      setItems={setResidentialItems}
                    />
                  </View>
                </View>
              )}
              <AppText
                title={'Area To Be Treated'}
                color={AppColors.BLACK}
                size={1.7}
                fontWeight={'bold'}
              />
              <View style={{ zIndex: 1000 }}>
                <AppTextInput
                  inputPlaceHolder={'Area To Be Treated'}
                  value={areaValue}
                  keyboardType={'default'}
                  onChangeText={text => setAreaValue(text)}
                  borderRadius={100}
                  inputWidth={70}
                />
              </View>
              <View>
                <AppText
                  title={'Issue Severity'}
                  color={AppColors.BLACK}
                  size={1.7}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <View style={{ zIndex: 500 }}>
                  <DropDownPicker
                    open={severityOpen}
                    value={severityValue}
                    items={severityItems}
                    dropDownDirection="BOTTOM"
                    placeholder="Select"
                    dropDownContainerStyle={{
                      borderColor: colors.secondary_button,
                      borderRadius: 15,
                    }}
                    style={{
                      borderRadius: severityOpen ? 15 : 30,
                      borderColor: colors.secondary_button,
                    }}
                    setOpen={setSeverityOpen}
                    setValue={setSeverityValue}
                    setItems={setSeverityItems}
                  />
                </View>
              </View>
              <View>
                <AppText
                  title={'Special Instructions or Notes'}
                  color={AppColors.BLACK}
                  size={1.7}
                  fontWeight={'bold'}
                />
                <LineBreak val={0.5} />
                <AppTextInput
                  inputPlaceHolder={'Lore ipsm...'}
                  inputHeight={8}
                  value={note}
                  onChangeText={text => setNote(text)}
                  multiline={true}
                  textAlignVertical={'top'}
                  borderRadius={10}
                  inputWidth={70}
                />
              </View>
            </View>
          </View>

          <LineBreak val={2} />

          <Button
            title="Submit"
            onPress={validateAndSubmit}
            textTransform="uppercase"
            color={AppColors.PRIMARY}
            width={90}
          />

          <LineBreak val={2} />
        </>
      )}
    </Container>
  );
};

export default UserHome;

const styles = StyleSheet.create({
  map: {
    height: responsiveHeight(50),
    width: responsiveWidth(100),
  },
  section: {
    paddingHorizontal: responsiveWidth(4),
  },
  serviceCard: {
    borderWidth: 1,
    borderColor: AppColors.BLACK,
    paddingVertical: responsiveHeight(1.5),
    width: responsiveWidth(35),
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.WHITE,
  },
  serviceCardActive: {
    borderWidth: 2,
    borderColor: AppColors.PRIMARY,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 6,
  },
});
