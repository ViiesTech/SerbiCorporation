import { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, FlatList } from 'react-native';
import Container from '../../../components/Container';
import HomeHeader from './../../../components/HomeHeader';
import Drawer from './../../../components/Drawer';
import {
  AppColors,
  getCurrentLocation,
  responsiveHeight,
  responsiveWidth,
} from '../../../utils';
import AppTextInput from './../../../components/AppTextInput';
import { images } from '../../../assets/images';
import LineBreak from '../../../components/LineBreak';
import icons from '../../../assets/icons';
import AppText from '../../../components/AppText';
import { useNavigation } from '@react-navigation/native';
import SVGIcon from '../../../components/SVGIcon';
import Button from '../../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { firstTimeVisit } from '../../../redux/slices';
import { colors } from '../../../assets/colors';
import { useLazyGetAllServicesQuery } from '../../../redux/services/adminApis';
import Loader from '../../../components/Loader';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-simple-toast';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// const prefService = [
//   // { id: 1, icon: icons.pest_one, title: 'Pest Control' },
//   { id: 1, icon: icons.termites, title: 'Termites' },
//   { id: 2, icon: icons.spiders, title: 'Spiders' },
//   { id: 3, icon: icons.roaches, title: 'Roaches' },
//   { id: 4, icon: icons.mice, title: 'Mice' },
//   { id: 5, icon: icons.mouse, title: 'Mouse' },
//   { id: 6, icon: icons.gnats, title: 'Gnats' },
//   { id: 7, icon: icons.flies, title: 'Flies' },
//   { id: 8, icon: icons.drain_flies, title: 'Drain Flies' },
//   { id: 9, icon: icons.bee, title: 'Bee' },
//   { id: 10, icon: icons.bed_bug, title: 'Bed Bug' },
//   { id: 11, icon: icons.ants, title: 'Ants' },
// ];

const iconMap = {
  Rats: icons.mouse,
  Termites: icons.termites,
  Spiders: icons.spiders,
  Roaches: icons.roaches,
  Mice: icons.mice,
  Mouse: icons.mouse,
  Gnats: icons.gnats,
  Flies: icons.flies,
  'Drain Flies': icons.drain_flies,
  Bees: icons.bee,
  'Bed Bugs': icons.bed_bug,
  Ants: icons.ants,
  Other: icons.termites,
};

const UserHome = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [coordinates, setCoordinates] = useState({});
  const { firstVisit } = useSelector(state => state.persistedData);
  const [getAllServices, { data: servicesData, isLoading: serviceLoader }] =
    useLazyGetAllServicesQuery();
  const [selectedService, setSelectedService] = useState(null);
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [residentialValue, setResidentialValue] = useState('');
  const [residentialItems, setResidentialItems] = useState([
    {
      label: 'Single Family',
      value: 'Single Family',
    },
    {
      label: 'Multi Units',
      value: 'Multi Units',
    },
  ]);
  const [openProperty, setOpenProperty] = useState(false);
  const [propertyItems, setPropertyItems] = useState([
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Industrial', value: 'Industrial' },
  ]);
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaItems, setAreaItems] = useState([
    { label: 'Kitchen', value: 'Kitchen' },
  ]);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [severityItems, setSeverityItems] = useState([
    { label: 'Low', value: 'Low' },
    { label: 'High', value: 'High' },
  ]);
  const [propertyValue, setPropertyValue] = useState('');
  const [severityValue, setSeverityValue] = useState('');
  const [areaValue, setAreaValue] = useState('');
  const [note, setNote] = useState('');
  const nav = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.persistedData);

  // console.log('service',user?.profileImage);

  useEffect(() => {
    getUserLocation();
    getAllServices();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      dispatch(firstTimeVisit(false));
    }, 5000);
  }, [firstVisit]);

  useEffect(() => {
    if (servicesData?.data?.length > 0) {
      setSelectedService({ id: servicesData.data[0]._id });
    }
  }, [servicesData]);

  const showLoginMessage = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: colors.white,
        }}
      >
        <Image
          resizeMode="cover"
          style={{ height: responsiveHeight(13), width: responsiveHeight(13) }}
          source={images.success}
        />
        <LineBreak val={2} />
        <AppText title={'Action Success'} />
        <LineBreak val={2} />
        <AppText fontWeight={'bold'} size={2.8} title={'LOGIN SUCCESS'} />
      </View>
    );
  };

  const getUserLocation = async () => {
    const { latitude, longitude } = await getCurrentLocation();
    setCoordinates({ latitude, longitude });
    // console.log('lat long ===>',latitude,longitude)
  };

  if (firstVisit) {
    return showLoginMessage();
  }

  const services =
    servicesData?.data?.map(item => ({
      id: item._id,
      title: item.name,
      icon: iconMap[item.name],
    })) || [];

  const onRequestFormSubmit = async () => {
    if (!propertyValue) {
      Toast.show('Please select the property type', 2000, Toast.SHORT);
      return;
    }

    if (propertyValue === 'Residential') {
      if (!residentialValue) {
        Toast.show('Please select the residential', 2000, Toast.SHORT);
        return;
      }
    }

    if (!areaValue) {
      Toast.show(
        'Please select the area which will be going to treat',
        2000,
        Toast.SHORT,
      );
      return;
    }

    if (!severityValue) {
      Toast.show('Please select the severity', 2000, Toast.SHORT);
      return;
    }

    if (!note) {
      Toast.show(
        'Please give some special instructions or note',
        2000,
        Toast.SHORT,
      );
      return;
    }

    nav.navigate('Services', {
      service: selectedService.id,
      lat: coordinates?.latitude,
      long: coordinates?.longitude,
      requestData: {
        propertyType: propertyValue,
        residential: propertyValue === 'Residential' && residentialValue,
        area: areaValue,
        severity: severityValue,
        note: note,
      },
    });
  };

  return (
    <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
      <HomeHeader menuIconOnPress={() => setOpenDrawer(true)} />
      {serviceLoader ? (
        <Loader />
      ) : (
        <>
          <Drawer
            isVisible={openDrawer}
            onBackdropPress={() => setOpenDrawer(false)}
            closeIconOnPress={() => setOpenDrawer(false)}
          />

          {/* <View style={{ paddingHorizontal: responsiveWidth(4) }}>
        <AppTextInput
          inputPlaceHolder={'What are you looking for?'}
          inputWidth={78}
          placeholderTextColor={AppColors.DARKGRAY}
          borderRadius={25}
          rightIcon={
            <Feather
              name="search"
              size={responsiveFontSize(2.5)}
              color={AppColors.ThemeBlue}
            />
          }
        />
      </View> */}

          {/* <LineBreak val={1} /> */}
          {coordinates?.latitude && coordinates?.longitude && (
            <MapView
              provider={PROVIDER_GOOGLE} 
              style={{
                height: responsiveHeight(50),
                width: responsiveWidth(100),
              }}
              region={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              <Marker
                title="Current Location"
                coordinate={coordinates}
              >
                <Image style={{height: 70,width: 70,borderRadius: 35}} source={images.pin_marker} />
              </Marker>
            </MapView>
          )}

          {/* <Image source={images.map} style={{ width: responsiveWidth(100) }} /> */}

          <LineBreak val={2} />

          <View style={{ paddingHorizontal: responsiveWidth(4) }}>
            <AppText
              title={'Which services do you need?'}
              color={AppColors.BLACK}
              size={2.2}
              textTransform={'uppercase'}
              fontWeight={'bold'}
            />
            <LineBreak val={2} />
            <FlatList
              data={services}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 15 }}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: AppColors.BLACK,
                      paddingVertical: responsiveHeight(1.5),
                      width: responsiveWidth(35),
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 6,
                      backgroundColor:
                        selectedService?.id == item.id
                          ? AppColors.PRIMARY
                          : AppColors.WHITE,
                    }}
                    onPress={() => {
                      setSelectedService({ id: item.id });
                    }}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: AppColors.BLACK,
                        padding: responsiveWidth(2),
                        borderRadius: 100,
                        backgroundColor: AppColors.WHITE,
                      }}
                    >
                      <SVGIcon xml={item.icon} width={50} height={50} />
                    </View>
                    <AppText
                      title={item.title}
                      textColor={
                        selectedService?.id == item.id
                          ? AppColors.WHITE
                          : AppColors.PRIMARY
                      }
                      size={1.2}
                      fontWeight={'bold'}
                      textTransform={'uppercase'}
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
                    }}
                    style={{
                      borderRadius: 100,
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
                {/* <LineBreak val={0.5} />
            <AppTextInput
              inputPlaceHolder={'Home / Residential'}
              borderRadius={40}
              inputWidth={70}
              rightIcon={
                <Feather
                  name="chevron-down"
                  size={responsiveFontSize(2.5)}
                  color={AppColors.BLACK}
                />
              }
            /> */}
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
                      }}
                      style={{
                        borderRadius: 100,
                        borderColor: colors.secondary_button,
                      }}
                      setOpen={setResidentialOpen}
                      setValue={setResidentialValue}
                      setItems={setResidentialItems}
                    />
                  </View>
                  {/* <LineBreak val={0.5} />
            <AppTextInput
              inputPlaceHolder={'Home / Residential'}
              borderRadius={40}
              inputWidth={70}
              rightIcon={
                <Feather
                  name="chevron-down"
                  size={responsiveFontSize(2.5)}
                  color={AppColors.BLACK}
                />
              }
            /> */}
                </View>
              )}
              <AppText
                title={'Area To Be Treated'}
                color={AppColors.BLACK}
                size={1.7}
                fontWeight={'bold'}
              />
              <View style={{ zIndex: 1000 }}>
                <DropDownPicker
                  open={areaOpen}
                  value={areaValue}
                  items={areaItems}
                  dropDownDirection="BOTTOM"
                  placeholder="Select"
                  dropDownContainerStyle={{
                    borderColor: colors.secondary_button,
                  }}
                  style={{
                    borderRadius: 100,
                    borderColor: colors.secondary_button,
                  }}
                  setOpen={setAreaOpen}
                  setValue={setAreaValue}
                  setItems={setAreaItems}
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
                    }}
                    style={{
                      borderRadius: 100,
                      borderColor: colors.secondary_button,
                    }}
                    setOpen={setSeverityOpen}
                    setValue={setSeverityValue}
                    setItems={setSeverityItems}
                  />
                </View>
              </View>
              {/* <View>
            <AppText
              title={'Area Sq ft'}
              color={AppColors.BLACK}
              size={1.7}
              fontWeight={'bold'}
            />
            <LineBreak val={0.5} />
            <AppTextInput inputPlaceHolder={'140 sq ft'} borderRadius={40} />
          </View> */}
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
                />
              </View>
            </View>
          </View>

          <LineBreak val={2} />

          <Button
            onPress={() => onRequestFormSubmit()}
            title={'Submit'}
            textTransform={'uppercase'}
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
