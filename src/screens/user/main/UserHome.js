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
  const { firstVisit } = useSelector(state => state.persistedData);

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
      setSelectedServiceId(services[0].id);
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
      console.log('Init Error:', err);
    }

    const location = await getCurrentLocation();
    let region = {
      latitude: location?.latitude,
      longitude: location?.longitude,
      latitudeDelta: 5,
      longitudeDelta: 5,
    };
    // console.log('Location:-', region);
    setCoordinates(location);
  };

  if (firstVisit) {
    return null;
  }

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
                <Image source={images.pin_marker} />
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
                        borderColor: colors.social_color1,
                        borderRadius: 15,
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
                  keyboardType={'numeric'}
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
                      borderRadius: 100,
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

// import { useEffect, useRef, useState } from 'react';
// import { View, Image, TouchableOpacity, FlatList } from 'react-native';
// import Container from '../../../components/Container';
// import HomeHeader from './../../../components/HomeHeader';
// import Drawer from './../../../components/Drawer';
// import {
//   AppColors,
//   DEFAULT_REGION,
//   getCurrentLocation,
//   responsiveHeight,
//   responsiveWidth,
// } from '../../../utils';
// import AppTextInput from './../../../components/AppTextInput';
// import { images } from '../../../assets/images';
// import LineBreak from '../../../components/LineBreak';
// import icons from '../../../assets/icons';
// import AppText from '../../../components/AppText';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import SVGIcon from '../../../components/SVGIcon';
// import Button from '../../../components/Button';
// import { useDispatch, useSelector } from 'react-redux';
// import { firstTimeVisit } from '../../../redux/slices';
// import { colors } from '../../../assets/colors';
// import {
//   useLazyAllPropertyTypesQuery,
//   useLazyAllServicesQuery,
//   useLazyGetAllServicesQuery,
// } from '../../../redux/services/adminApis';
// import Loader from '../../../components/Loader';
// import DropDownPicker from 'react-native-dropdown-picker';
// import Toast from 'react-native-simple-toast';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// // const prefService = [
// //   // { id: 1, icon: icons.pest_one, title: 'Pest Control' },
// //   { id: 1, icon: icons.termites, title: 'Termites' },
// //   { id: 2, icon: icons.spiders, title: 'Spiders' },
// //   { id: 3, icon: icons.roaches, title: 'Roaches' },
// //   { id: 4, icon: icons.mice, title: 'Mice' },
// //   { id: 5, icon: icons.mouse, title: 'Mouse' },
// //   { id: 6, icon: icons.gnats, title: 'Gnats' },
// //   { id: 7, icon: icons.flies, title: 'Flies' },
// //   { id: 8, icon: icons.drain_flies, title: 'Drain Flies' },
// //   { id: 9, icon: icons.bee, title: 'Bee' },
// //   { id: 10, icon: icons.bed_bug, title: 'Bed Bug' },
// //   { id: 11, icon: icons.ants, title: 'Ants' },
// // ];

// const iconMap = {
//   Rats: images.rat,
//   Termites: images.other,
//   Spiders: images.spider,
//   Roaches: images.roaches,
//   Mice: images.mice,
//   Mouse: images.rat,
//   Gnats: images.gnats,
//   Flies: images.flies,
//   'Drain Flies': images.drainFlies,
//   Bees: images.bee,
//   'Bed Bugs': images.bedBug,
//   Ants: images.ant,
//   Other: images.ant,
// };
// // const iconMap = {
// //   Rats: icons.mouse,
// //   Termites: icons.termites,
// //   Spiders: icons.spiders,
// //   Roaches: icons.roaches,
// //   Mice: icons.mice,
// //   Mouse: icons.mouse,
// //   Gnats: icons.gnats,
// //   Flies: icons.flies,
// //   'Drain Flies': icons.drain_flies,
// //   Bees: icons.bee,
// //   'Bed Bugs': icons.bed_bug,
// //   Ants: icons.ants,
// //   Other: icons.termites,
// // };

// const UserHome = () => {
//   const [openDrawer, setOpenDrawer] = useState(false);
//   const [coordinates, setCoordinates] = useState({});
//   const [servicesData, setServicesData] = useState([]);
//   const { firstVisit } = useSelector(state => state.persistedData);
//   const [allServices, { isLoading: serviceLoader }] = useLazyAllServicesQuery();
//   const [allPropertyTypes, { isLoading: typeLoader }] =
//     useLazyAllPropertyTypesQuery();
//   const [selectedService, setSelectedService] = useState(null);
//   const [residentialOpen, setResidentialOpen] = useState(false);
//   const [residentialValue, setResidentialValue] = useState('');
//   const [residentialItems, setResidentialItems] = useState([
//     {
//       label: 'Single Family',
//       value: 'Single Family',
//     },
//     {
//       label: 'Multi Units',
//       value: 'Multi Units',
//     },
//   ]);
//   const [openProperty, setOpenProperty] = useState(false);
//   const [propertyItems, setPropertyItems] = useState([]);

//   const [areaOpen, setAreaOpen] = useState(false);
//   const [areaItems, setAreaItems] = useState([
//     { label: 'Kitchen', value: 'Kitchen' },
//   ]);
//   const [severityOpen, setSeverityOpen] = useState(false);
//   const [severityItems, setSeverityItems] = useState([
//     { label: 'Low', value: 'Low' },
//     { label: 'Medium', value: 'Medium' },
//     { label: 'High', value: 'High' },
//   ]);
//   const [propertyValue, setPropertyValue] = useState('');
//   const [severityValue, setSeverityValue] = useState('');
//   const [areaValue, setAreaValue] = useState('');
//   const [note, setNote] = useState('');
//   const [mapReady, setMapReady] = useState(false);
//   const mapRef = useRef(null);

//   const nav = useNavigation();
//   const dispatch = useDispatch();
//   const { user } = useSelector(state => state.persistedData);
//   const isFocused = useIsFocused();

//   // console.log('user:-', user);

//   useEffect(() => {
//     if (coordinates?.latitude && coordinates?.longitude && mapReady) {
//       const region = {
//         latitude: coordinates?.latitude,
//         longitude: coordinates?.longitude,
//         latitudeDelta: 0.1,
//         longitudeDelta: 0.1,
//       };

//       mapRef.current?.animateToRegion(region, 2000);
//     }
//   }, [mapReady, coordinates]);

//   useEffect(() => {
//     getUserLocation();
//     _getAllServices();
//     _getAllPropertyTypes();
//   }, []);

//   useEffect(() => {
//     setTimeout(() => {
//       dispatch(firstTimeVisit(false));
//     }, 5000);
//   }, [firstVisit]);

//   useEffect(() => {
//     if (servicesData?.length > 0) {
//       setSelectedService({ id: servicesData?.[0]?._id });
//     }
//   }, [servicesData]);

//   const _getAllServices = async () => {
//     await allServices()
//       ?.unwrap()
//       .then(res => setServicesData(res?.data))
//       .catch(err => console.log('err:---------->', err));
//   };

//   const _getAllPropertyTypes = async () => {
//     await allPropertyTypes()
//       ?.unwrap()
//       .then(res => {
//         console.log('res in property types:-', res);
//         const types = res?.data?.map(item => ({
//           label: item.propertyType,
//           value: item.propertyType,
//           id: item._id,
//         }));
//         setPropertyItems(types);
//       })
//       .catch(err => console.log('err:---------->', err));
//   };

//   const showLoginMessage = () => {
//     return (
//       <View
//         style={{
//           justifyContent: 'center',
//           alignItems: 'center',
//           flex: 1,
//           backgroundColor: colors.white,
//         }}
//       >
//         <Image
//           resizeMode="cover"
//           style={{ height: responsiveHeight(13), width: responsiveHeight(13) }}
//           source={images.success}
//         />
//         <LineBreak val={2} />
//         <AppText title={'Action Success'} />
//         <LineBreak val={2} />
//         <AppText fontWeight={'bold'} size={2.8} title={'LOGIN SUCCESS'} />
//       </View>
//     );
//   };

//   const getUserLocation = async () => {
//     const { latitude, longitude } = await getCurrentLocation();
//     setCoordinates({ latitude, longitude });
//     // console.log('lat long ===>>', latitude, longitude);
//   };

//   if (firstVisit) {
//     return showLoginMessage();
//   }

//   const services =
//     servicesData?.map(item => ({
//       id: item._id,
//       title: item.name,
//       icon: iconMap[item.name],
//     })) || [];

//   const onRequestFormSubmit = () => {
//     if (!propertyValue) {
//       Toast.show('Please select the property type', Toast.SHORT);
//       return;
//     }

//     if (propertyValue === 'Residential') {
//       if (!residentialValue) {
//         Toast.show('Please select the residential', Toast.SHORT);
//         return;
//       }
//     }

//     if (!areaValue) {
//       Toast.show(
//         'Please select the area which will be going to treat',
//         Toast.SHORT,
//       );
//       return;
//     }

//     if (!severityValue) {
//       Toast.show('Please select the severity', Toast.SHORT);
//       return;
//     }

//     if (!note) {
//       Toast.show('Please give some special instructions or note', Toast.SHORT);
//       return;
//     }

//     nav.navigate('Services', {
//       service: selectedService?.id,
//       lat: coordinates?.latitude,
//       long: coordinates?.longitude,
//       requestData: {
//         propertyType: propertyValue,
//         residential: propertyValue === 'Residential' && residentialValue,
//         area: areaValue,
//         severity: severityValue,
//         note: note,
//       },
//     });
//   };

//   // console.log('servicesData:---------->', servicesData);
//   // console.log('selectedService:---------->', selectedService);
//   console.log('propertyItems:-', propertyItems);

//   return (
//     <Container contentStyle={{ paddingBottom: responsiveHeight(5) }}>
//       <HomeHeader menuIconOnPress={() => setOpenDrawer(true)} />
//       {serviceLoader || typeLoader ? (
//         <Loader />
//       ) : (
//         <>
//           <Drawer
//             isVisible={openDrawer}
//             onBackdropPress={() => setOpenDrawer(false)}
//             closeIconOnPress={() => setOpenDrawer(false)}
//           />

//           {/* <View style={{ paddingHorizontal: responsiveWidth(4) }}>
//         <AppTextInput
//           inputPlaceHolder={'What are you looking for?'}
//           inputWidth={78}
//           placeholderTextColor={AppColors.DARKGRAY}
//           borderRadius={25}
//           rightIcon={
//             <Feather
//               name="search"
//               size={responsiveFontSize(2.5)}
//               color={AppColors.ThemeBlue}
//             />
//           }
//         />
//       </View> */}

//           <LineBreak val={1} />
//           <MapView
//             provider={PROVIDER_GOOGLE}
//             ref={mapRef}
//             style={{
//               height: responsiveHeight(50),
//               width: responsiveWidth(100),
//             }}
//             onMapReady={() => setMapReady(true)}
//             initialRegion={DEFAULT_REGION}
//           >
//             {coordinates?.latitude && coordinates?.longitude && (
//               <Marker title="Current Location" coordinate={coordinates}>
//                 <Image source={images.pin_marker} />
//               </Marker>
//             )}
//           </MapView>

//           {/* <Image source={images.map} style={{ width: responsiveWidth(100) }} /> */}

//           <LineBreak val={2} />

//           <View style={{ paddingHorizontal: responsiveWidth(4) }}>
//             <AppText
//               title={'Which services do you need?'}
//               color={AppColors.BLACK}
//               size={2.2}
//               textTransform={'uppercase'}
//               fontWeight={'bold'}
//             />
//             <LineBreak val={2} />
//             <FlatList
//               data={services}
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={{ gap: 15 }}
//               renderItem={({ item, index }) => {
//                 return (
//                   <View>
//                     <TouchableOpacity
//                       style={{
//                         borderWidth: 1,
//                         borderColor: AppColors.BLACK,
//                         paddingVertical: responsiveHeight(1.5),
//                         width: responsiveWidth(35),
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         gap: 6,
//                         borderRadius: 6,
//                         backgroundColor:
//                           selectedService?.id == item.id
//                             ? AppColors.PRIMARY
//                             : AppColors.WHITE,
//                       }}
//                       onPress={() => {
//                         setSelectedService({ id: item.id });
//                       }}
//                     >
//                       <View
//                         style={{
//                           borderWidth: 1,
//                           borderColor: AppColors.BLACK,
//                           padding: responsiveWidth(2),
//                           borderRadius: 100,
//                           backgroundColor: AppColors.WHITE,
//                           overflow: 'hidden',
//                         }}
//                       >
//                         {/* <SVGIcon xml={item.icon} width={50} height={50} /> */}
//                         <Image
//                           source={iconMap[item.title]}
//                           style={{ width: 50, height: 50 }}
//                         />
//                       </View>
//                       <AppText
//                         title={item.title}
//                         textColor={
//                           selectedService?.id == item.id
//                             ? AppColors.WHITE
//                             : AppColors.PRIMARY
//                         }
//                         size={1.2}
//                         fontWeight={'bold'}
//                         textTransform={'uppercase'}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 );
//               }}
//             />
//           </View>
//           <LineBreak val={2} />

//           <View style={{ paddingHorizontal: responsiveWidth(4) }}>
//             <AppText
//               title={'Request Form'}
//               color={AppColors.BLACK}
//               size={2.5}
//               textTransform={'uppercase'}
//               fontWeight={'bold'}
//             />

//             <LineBreak val={1} />

//             <View
//               style={{
//                 backgroundColor: AppColors.WHITE,
//                 elevation: 5,
//                 borderRadius: 20,
//                 paddingHorizontal: responsiveWidth(4),
//                 paddingVertical: responsiveHeight(2),
//                 gap: responsiveHeight(1),
//               }}
//             >
//               <View>
//                 <AppText
//                   title={'Property Type'}
//                   color={AppColors.BLACK}
//                   size={1.7}
//                   fontWeight={'bold'}
//                 />
//                 <LineBreak val={0.5} />
//                 <View style={{ zIndex: 3000 }}>
//                   <DropDownPicker
//                     open={openProperty}
//                     value={propertyValue}
//                     items={propertyItems}
//                     dropDownDirection="BOTTOM"
//                     placeholder="Select"
//                     dropDownContainerStyle={{
//                       borderColor: colors.secondary_button,
//                     }}
//                     style={{
//                       borderRadius: 100,
//                       borderColor: colors.secondary_button,
//                     }}
//                     setOpen={setOpenProperty}
//                     setValue={val => {
//                       setPropertyValue(val());
//                       setResidentialOpen(true);
//                     }}
//                     setItems={setPropertyItems}
//                   />
//                 </View>
//                 {/* <LineBreak val={0.5} />
//             <AppTextInput
//               inputPlaceHolder={'Home / Residential'}
//               borderRadius={40}
//               inputWidth={70}
//               rightIcon={
//                 <Feather
//                   name="chevron-down"
//                   size={responsiveFontSize(2.5)}
//                   color={AppColors.BLACK}
//                 />
//               }
//             /> */}
//               </View>
//               {propertyValue === 'Residential' && (
//                 <View>
//                   <AppText
//                     title={'Residential'}
//                     color={AppColors.BLACK}
//                     size={1.7}
//                     fontWeight={'bold'}
//                   />
//                   <LineBreak val={0.5} />
//                   <View style={{ zIndex: 2000 }}>
//                     <DropDownPicker
//                       open={residentialOpen}
//                       value={residentialValue}
//                       items={residentialItems}
//                       dropDownDirection="BOTTOM"
//                       placeholder="Select"
//                       dropDownContainerStyle={{
//                         borderColor: colors.secondary_button,
//                       }}
//                       style={{
//                         borderRadius: 100,
//                         borderColor: colors.secondary_button,
//                       }}
//                       setOpen={setResidentialOpen}
//                       setValue={setResidentialValue}
//                       setItems={setResidentialItems}
//                     />
//                   </View>
//                   {/* <LineBreak val={0.5} />
//             <AppTextInput
//               inputPlaceHolder={'Home / Residential'}
//               borderRadius={40}
//               inputWidth={70}
//               rightIcon={
//                 <Feather
//                   name="chevron-down"
//                   size={responsiveFontSize(2.5)}
//                   color={AppColors.BLACK}
//                 />
//               }
//             /> */}
//                 </View>
//               )}
//               <AppText
//                 title={'Area To Be Treated'}
//                 color={AppColors.BLACK}
//                 size={1.7}
//                 fontWeight={'bold'}
//               />
//               <View style={{ zIndex: 1000 }}>
//                 {/* <DropDownPicker
//                   open={areaOpen}
//                   value={areaValue}
//                   items={areaItems}
//                   dropDownDirection="BOTTOM"
//                   placeholder="Select"
//                   dropDownContainerStyle={{
//                     borderColor: colors.secondary_button,
//                   }}
//                   style={{
//                     borderRadius: 100,
//                     borderColor: colors.secondary_button,
//                   }}
//                   setOpen={setAreaOpen}
//                   setValue={setAreaValue}
//                   setItems={setAreaItems}
//                 /> */}
//                 <AppTextInput
//                   inputPlaceHolder={'Area To Be Treated'}
//                   value={areaValue}
//                   onChangeText={text => setAreaValue(text)}
//                   borderRadius={30}
//                 />
//               </View>
//               <View>
//                 <AppText
//                   title={'Issue Severity'}
//                   color={AppColors.BLACK}
//                   size={1.7}
//                   fontWeight={'bold'}
//                 />
//                 <LineBreak val={0.5} />
//                 <View style={{ zIndex: 500 }}>
//                   <DropDownPicker
//                     open={severityOpen}
//                     value={severityValue}
//                     items={severityItems}
//                     dropDownDirection="BOTTOM"
//                     placeholder="Select"
//                     dropDownContainerStyle={{
//                       borderColor: colors.secondary_button,
//                     }}
//                     style={{
//                       borderRadius: 100,
//                       borderColor: colors.secondary_button,
//                     }}
//                     setOpen={setSeverityOpen}
//                     setValue={setSeverityValue}
//                     setItems={setSeverityItems}
//                   />
//                 </View>
//               </View>
//               {/* <View>
//             <AppText
//               title={'Area Sq ft'}
//               color={AppColors.BLACK}
//               size={1.7}
//               fontWeight={'bold'}
//             />
//             <LineBreak val={0.5} />
//             <AppTextInput inputPlaceHolder={'140 sq ft'} borderRadius={40} />
//           </View> */}
//               <View>
//                 <AppText
//                   title={'Special Instructions or Notes'}
//                   color={AppColors.BLACK}
//                   size={1.7}
//                   fontWeight={'bold'}
//                 />
//                 <LineBreak val={0.5} />
//                 <AppTextInput
//                   inputPlaceHolder={'Lore ipsm...'}
//                   inputHeight={8}
//                   value={note}
//                   onChangeText={text => setNote(text)}
//                   multiline={true}
//                   textAlignVertical={'top'}
//                   borderRadius={10}
//                 />
//               </View>
//             </View>
//           </View>

//           <LineBreak val={2} />

//           <Button
//             onPress={() => onRequestFormSubmit()}
//             title={'Submit'}
//             textTransform={'uppercase'}
//             color={AppColors.PRIMARY}
//             width={90}
//           />
//           <LineBreak val={2} />
//         </>
//       )}
//     </Container>
//   );
// };

// export default UserHome;
