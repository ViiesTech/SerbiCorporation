import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { pick, types } from '@react-native-documents/picker';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Components & Utils
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import { images } from '../assets/images';
import { colors } from '../assets/colors';
import {
  getCurrentLocation,
  getAddressFromCoordinates,
  getProfileImage,
  getShortFileName,
} from '../utils';
import { IMAGE_URL, MAP_API_KEY } from '../redux/constant';
import { useCreateUpdateProfileMutation } from '../redux/services/index';
import { useLazyGetAllServicesQuery } from '../redux/services/adminApis';

const isLocalFileUri = uri => {
  if (!uri || typeof uri !== 'string') return false;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return false;
  return (
    uri.startsWith('content://') ||
    uri.startsWith('file://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('/')
  );
};

const Profile = ({ route }) => {
  const { user } = route?.params || {};
  const nav = useNavigation();
  const MAP_KEY = MAP_API_KEY;
  const googlePlacesRef = useRef();

  // --- States ---
  const [state, setState] = useState({
    fullName: user?.fullName || '',
    image: user?.profileImage
      ? getProfileImage(user?.profileImage, true)
      : images.userProfile,
    dob: user?.DOB || moment().format('DD-MM-YYYY'),
    phone: user?.phone || '',
    location: {
      name: user?.locationName || '',
      lat: user?.latitude || '',
      long: user?.longitude || '',
    },
    ss: user?.ss || '',
    license: user?.pestControlLicense?.[0]
      ? [{ file: user.pestControlLicense[0], name: 'Current License' }]
      : [],
    workingHours: {
      startTime: user?.workingHours?.startTime || '09:00 AM',
      endTime: user?.workingHours?.endTime || '05:00 PM',
    },
    service:
      user?.service?._id ||
      (typeof user?.service === 'string' ? user?.service : null),
    portfolio: (user?.portfolio || []).map(file =>
      typeof file === 'string'
        ? { path: `${IMAGE_URL}${file}`, filename: file, isRemote: true }
        : file,
    ),
    price: user?.price?.toString() || '',
  });

  const [picker, setPicker] = useState({ visible: false, type: null });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [items, setItems] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');

  // --- API Hooks ---
  const [createUpdateProfile, { isLoading }] = useCreateUpdateProfileMutation();
  const [getAllServices, { data: servicesData }] = useLazyGetAllServicesQuery();

  useEffect(() => {
    getAllServices();
  }, [getAllServices]);

  useEffect(() => {
    if (state.location?.name) {
      googlePlacesRef.current?.setAddressText(state.location.name);
    }
  }, [state.location?.name]);

  useEffect(() => {
    if (servicesData?.data) {
      setItems(
        servicesData.data.map(item => ({ label: item.name, value: item._id })),
      );
    }
  }, [servicesData]);

  // Selected Service Name
  const selectedServiceName = useMemo(() => {
    if (!state.service) return 'Select a service';
    const found = items.find(it => it.value === state.service);
    if (found) return found.label;
    if (user?.service?.name) return user.service.name;
    return 'Select a service';
  }, [state.service, items, user?.service]);

  // Filtered Services in Modal
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return items;
    return items.filter(it =>
      it.label.toLowerCase().includes(serviceSearch.toLowerCase()),
    );
  }, [items, serviceSearch]);

  // --- Handlers ---
  const handleInputChange = (key, value, nestedKey = null) => {
    setState(prev => ({
      ...prev,
      [key]: nestedKey ? { ...prev[key], [nestedKey]: value } : value,
    }));
  };

  const onProfilePress = async () => {
    if (!state.location?.name) {
      Toast.show('Location should not be empty', Toast.SHORT);
      return;
    }

    if (user?.type === 'Technician') {
      if (!state.service) {
        Toast.show('Please select a service', Toast.SHORT);
        return;
      }
      if (!state.price) {
        Toast.show('Please enter pricing', Toast.SHORT);
        return;
      }
      if (!state.ss) {
        Toast.show('Please enter social security number', Toast.SHORT);
        return;
      }
      if (state.license.length === 0) {
        Toast.show('Please upload your license', Toast.SHORT);
        return;
      }
    }

    const data = new FormData();
    data.append('userId', user?._id || '');
    data.append('fullName', state.fullName);
    data.append('phone', state.phone);
    data.append('DOB', state.dob);
    data.append('longitude', String(state.location.long || ''));
    data.append('latitude', String(state.location.lat || ''));
    data.append('locationName', state.location.name);

    if (user?.type === 'Technician') {
      data.append('price', state.price || '0');
      if (state.service) {
        data.append('service', state.service);
      }
      data.append('workingHours', JSON.stringify(state.workingHours));
      data.append('ss', state.ss);

      // License: Only upload if it's a new local file
      if (state.license && state.license.length > 0) {
        const lic = state.license[0];
        const licUri = lic.file || lic.uri;
        if (lic.isNew || isLocalFileUri(licUri)) {
          data.append('license', {
            uri: licUri,
            type: lic.type || 'application/pdf',
            name: lic.name || 'license.pdf',
          });
        }
      }

      // Portfolio: Only upload new local files
      if (state.portfolio && state.portfolio.length > 0) {
        state.portfolio.forEach((file, index) => {
          const uri = file.uri || file.path;
          if (file.isNew || isLocalFileUri(uri)) {
            data.append('portfolio', {
              uri,
              type: file.type || 'image/jpeg',
              name: file.filename || file.name || `portfolio_${index}.jpg`,
            });
          }
        });
      }
    }

    // Profile Image: Only upload if it's a new local file
    if (isLocalFileUri(state.image)) {
      data.append('profileImage', {
        uri: state.image,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    try {
      const res = await createUpdateProfile(data).unwrap();
      Toast.show(res.msg || 'Profile Updated', Toast.SHORT);
      nav.goBack();
    } catch (error) {
      console.error('Update Error:', error);
      Toast.show(error?.data?.msg || 'Failed to update profile', Toast.SHORT);
    }
  };

  const onImageSelect = () => {
    ImageCropPicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        const path =
          Platform.OS === 'ios' && !image.path.startsWith('file://')
            ? `file://${image.path}`
            : image.path;
        handleInputChange('image', path);
      })
      .catch(err => console.log('Picker Error:', err));
  };

  const onSelectFile = async type => {
    try {
      if (type === 'license') {
        const [res] = await pick({
          type: [types.pdf],
        });
        if (res?.uri) {
          handleInputChange('license', [
            {
              file: res.uri,
              uri: res.uri,
              name: res.name || 'license.pdf',
              type: res.type || 'application/pdf',
              isNew: true,
            },
          ]);
        }
      } else {
        const results = await pick({
          type: [types.images],
          allowMultiSelection: true,
        });
        if (results && results.length > 0) {
          const newItems = results.map((item, idx) => ({
            uri: item.uri,
            path: item.uri,
            filename: item.name || `portfolio_${Date.now()}_${idx}.jpg`,
            type: item.type || 'image/jpeg',
            isNew: true,
          }));
          setState(prev => ({
            ...prev,
            portfolio: [...prev.portfolio, ...newItems],
          }));
        }
      }
    } catch (err) {
      if (!err.cancelled) console.log('Document Picker Error:', err);
    }
  };

  const removePortfolioItem = indexToRemove => {
    setState(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const fetchCurrentLocation = async () => {
    try {
      Toast.show('Fetching location...', Toast.SHORT);
      const coords = await getCurrentLocation();
      if (!coords?.latitude || !coords?.longitude) return;
      const { latitude, longitude } = coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      if (address) {
        setState(prev => ({
          ...prev,
          location: { name: address, lat: latitude, long: longitude },
        }));
        googlePlacesRef.current?.setAddressText(address);
        Toast.show('Location Fetched!', Toast.SHORT);
      } else {
        setState(prev => ({
          ...prev,
          location: { ...prev.location, lat: latitude, long: longitude },
        }));
        Toast.show('Location coordinates fetched', Toast.SHORT);
      }
    } catch (error) {
      console.log('Profile location error:', error);
      Toast.show('Location Error', Toast.SHORT);
    }
  };

  const profileSrc =
    typeof state.image === 'string' ? { uri: state.image } : state.image;
  const isTechnician = user?.type === 'Technician';

  return (
    <Container keyboardShouldPersistTaps="handled">
      <NormalHeader heading="Edit Profile" onBackPress={() => nav.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Hero Profile Photo Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <ImageBackground
              source={profileSrc}
              style={styles.avatarImage}
              imageStyle={styles.avatarImageStyle}
            >
              <TouchableOpacity
                onPress={onImageSelect}
                style={styles.avatarEditBadge}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={16} color="#0F172A" />
              </TouchableOpacity>
            </ImageBackground>
          </View>
          <Text style={styles.heroNameText}>
            {state.fullName || 'Your Name'}
          </Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isTechnician
                  ? colors.secondary_button || '#A0CCD9'
                  : colors.primary,
              },
            ]}
          >
            <Ionicons
              name={isTechnician ? 'shield-checkmark' : 'person'}
              size={12}
              color="#0F172A"
            />
            <Text style={styles.typeBadgeText}>
              {isTechnician ? 'Technician Account' : 'Customer Account'}
            </Text>
          </View>
        </View>

        {/* 2. Personal Information Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={18} color="#A0CCD9" />
            <Text style={styles.cardTitle}>Personal Details</Text>
          </View>
          <View style={styles.cardDivider} />

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#64748B"
                style={styles.inputLeadingIcon}
              />
              <TextInput
                value={state.fullName}
                onChangeText={t => handleInputChange('fullName', t)}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                style={styles.modernInput}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={18}
                color="#64748B"
                style={styles.inputLeadingIcon}
              />
              <TextInput
                value={state.phone}
                keyboardType="phone-pad"
                onChangeText={t => handleInputChange('phone', t)}
                placeholder="Enter phone number"
                placeholderTextColor="#94A3B8"
                style={styles.modernInput}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity
              onPress={() => setIsDatePickerVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#64748B"
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  value={state.dob}
                  editable={false}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="#94A3B8"
                  style={styles.modernInput}
                  pointerEvents="none"
                />
                <Ionicons
                  name="calendar-clear-outline"
                  size={18}
                  color="#64748B"
                  style={styles.inputTrailingIcon}
                />
              </View>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              maximumDate={new Date()}
              onConfirm={date => {
                handleInputChange('dob', moment(date).format('DD-MM-YYYY'));
                setIsDatePickerVisible(false);
              }}
              onCancel={() => setIsDatePickerVisible(false)}
            />
          </View>

          {/* Home Address (Google Places Autocomplete) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Home Address</Text>
            <View style={styles.addressWrapper}>
              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="Search or enter address"
                fetchDetails={true}
                keyboardShouldPersistTaps="handled"
                onPress={(data, details = null) => {
                  setState(prev => ({
                    ...prev,
                    location: {
                      name: data.description || details?.formatted_address,
                      lat: details?.geometry?.location?.lat,
                      long: details?.geometry?.location?.lng,
                    },
                  }));
                }}
                query={{
                  key: MAP_KEY,
                  language: 'en',
                  components: 'country:us',
                }}
                styles={autoCompleteStyles}
                renderRightButton={() => (
                  <TouchableOpacity
                    onPress={fetchCurrentLocation}
                    style={styles.gpsLocateBtn}
                    activeOpacity={0.7}
                  >
                    <Icon name="my-location" size={20} color="#A0CCD9" />
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>

        {/* 3. Technician Specific Details Card */}
        {isTechnician && (
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="construct-outline" size={18} color="#A0CCD9" />
              <Text style={styles.cardTitle}>Service & Work Details</Text>
            </View>
            <View style={styles.cardDivider} />

            {/* Which service do you provide? (Custom Modal Picker - No Overlap!) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primary Service Provided</Text>
              <TouchableOpacity
                style={styles.servicePickerBtn}
                onPress={() => setOpenService(true)}
                activeOpacity={0.8}
              >
                <View style={styles.pickerContentLeft}>
                  <View style={styles.serviceIconPill}>
                    <Ionicons name="bug-outline" size={18} color="#A0CCD9" />
                  </View>
                  <Text
                    style={[
                      styles.servicePickerText,
                      !state.service && styles.servicePickerPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedServiceName}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Working Hours */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Working Hours</Text>
              <TouchableOpacity
                onPress={() => setPicker({ visible: true, type: 'start' })}
                activeOpacity={0.8}
              >
                <View style={styles.timeRangeWrapper}>
                  <View style={styles.timeBox}>
                    <Ionicons name="time-outline" size={16} color="#A0CCD9" />
                    <Text style={styles.timeText}>
                      {state.workingHours.startTime || 'Start'}
                    </Text>
                  </View>
                  <Text style={styles.timeDividerText}>to</Text>
                  <View style={styles.timeBox}>
                    <Ionicons name="time-outline" size={16} color="#A0CCD9" />
                    <Text style={styles.timeText}>
                      {state.workingHours.endTime || 'End'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#94A3B8"
                    style={styles.chevronRight}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Standard Pricing */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Standard Price ($ / Service)
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  value={state.price}
                  keyboardType="numeric"
                  onChangeText={t => handleInputChange('price', t)}
                  placeholder="e.g. 35"
                  placeholderTextColor="#94A3B8"
                  style={styles.modernInput}
                />
              </View>
            </View>

            {/* SSN */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                Social Security Number (SSN)
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#64748B"
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  value={state.ss}
                  onChangeText={t => handleInputChange('ss', t)}
                  placeholder="XXX-XX-XXXX"
                  placeholderTextColor="#94A3B8"
                  style={styles.modernInput}
                />
              </View>
            </View>
          </View>
        )}

        {/* 4. Verification & Portfolio Card (Technician) */}
        {isTechnician && (
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#A0CCD9"
              />
              <Text style={styles.cardTitle}>License & Portfolio</Text>
            </View>
            <View style={styles.cardDivider} />

            {/* Pest Control License */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Pest Control License (PDF)</Text>
              <TouchableOpacity
                onPress={() => onSelectFile('license')}
                activeOpacity={0.8}
              >
                {state.license.length > 0 ? (
                  <View style={styles.uploadedDocCard}>
                    <View style={styles.docIconBox}>
                      <Ionicons
                        name="document-text"
                        size={22}
                        color="#EF4444"
                      />
                    </View>
                    <View style={styles.docInfoCol}>
                      <Text numberOfLines={1} style={styles.docFileName}>
                        {state.license[0]?.name || 'License.pdf'}
                      </Text>
                      <View style={styles.docStatusRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color="#10B981"
                        />
                        <Text style={styles.docStatusText}>
                          Ready to upload
                        </Text>
                      </View>
                    </View>
                    <View style={styles.docChangePill}>
                      <Text style={styles.docChangeText}>Change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholderCard}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#A0CCD9"
                    />
                    <Text style={styles.uploadTitleText}>
                      Select License Document
                    </Text>
                    <Text style={styles.uploadSubtitleText}>
                      PDF format required
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Portfolio Upload */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Work Portfolio Photos</Text>
              <TouchableOpacity
                onPress={() => onSelectFile('portfolio')}
                style={styles.uploadPlaceholderCard}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={24} color="#A0CCD9" />
                <Text style={styles.uploadTitleText}>
                  Upload Portfolio Images
                </Text>
                <Text style={styles.uploadSubtitleText}>
                  Tap to browse photos of your completed jobs
                </Text>
              </TouchableOpacity>

              {/* Portfolio Grid */}
              {state.portfolio.length > 0 && (
                <View style={styles.portfolioGrid}>
                  {state.portfolio.map((file, index) => (
                    <View key={index} style={styles.portfolioThumbWrapper}>
                      <ImageBackground
                        source={{ uri: file.path || file.uri }}
                        style={styles.portfolioThumb}
                        imageStyle={styles.portfolioThumbImage}
                      >
                        <TouchableOpacity
                          onPress={() => removePortfolioItem(index)}
                          style={styles.portfolioRemoveBtn}
                          activeOpacity={0.8}
                        >
                          <Feather name="x" size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      </ImageBackground>
                      <Text numberOfLines={1} style={styles.portfolioThumbName}>
                        {getShortFileName(
                          file.filename || file.name || 'Photo',
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 5. Update Profile Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveProfileBtn}
            onPress={onProfilePress}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Text style={styles.saveProfileBtnText}>SAVE PROFILE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Shared Time Picker */}
      <DateTimePickerModal
        isVisible={picker.visible}
        mode="time"
        onConfirm={date => {
          const time = moment(date).format('h:mm A');
          if (picker.type === 'start') {
            handleInputChange('workingHours', time, 'startTime');
            setPicker({ visible: false, type: null });
            setTimeout(() => setPicker({ visible: true, type: 'end' }), 500);
          } else {
            handleInputChange('workingHours', time, 'endTime');
            setPicker({ visible: false, type: null });
          }
        }}
        onCancel={() => setPicker({ visible: false, type: null })}
      />

      {/* Service Selection Bottom Sheet Modal (Fixes Overlapping Bug!) */}
      <Modal
        visible={openService}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOpenService(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpenService(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalDragPill} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Select Your Service</Text>
                <Text style={styles.modalSubtitle}>
                  Choose the primary pest control service you provide
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setOpenService(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {items.length > 5 && (
              <View style={styles.modalSearchWrapper}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" />
                <TextInput
                  value={serviceSearch}
                  onChangeText={setServiceSearch}
                  placeholder="Search service..."
                  placeholderTextColor="#94A3B8"
                  style={styles.modalSearchInput}
                />
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.serviceListScroll}
            >
              {filteredServices.map(item => {
                const isSelected = item.value === state.service;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.serviceItemCard,
                      isSelected && styles.serviceItemCardSelected,
                    ]}
                    onPress={() => {
                      handleInputChange('service', item.value);
                      setOpenService(false);
                      setServiceSearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceItemLeft}>
                      <View
                        style={[
                          styles.serviceItemIconBox,
                          isSelected && styles.serviceItemIconBoxSelected,
                        ]}
                      >
                        <Ionicons
                          name="bug-outline"
                          size={18}
                          color={isSelected ? '#A0CCD9' : '#64748B'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.serviceItemLabel,
                          isSelected && styles.serviceItemLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerCircle} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </Container>
  );
};

export default Profile;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
  },
  avatarImageStyle: {
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarEditBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary_button || '#A0CCD9',
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  heroNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  inputTrailingIcon: {
    marginLeft: 'auto',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A0CCD9',
    marginRight: 10,
  },
  modernInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  addressWrapper: {
    position: 'relative',
  },
  gpsLocateBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  pickerContentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  serviceIconPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  servicePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  servicePickerPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  timeRangeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  timeDividerText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chevronRight: {
    marginLeft: 'auto',
  },
  uploadedDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  docFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docStatusText: {
    fontSize: 11.5,
    color: '#15803D',
    fontWeight: '500',
  },
  docChangePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  uploadPlaceholderCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 6,
  },
  uploadSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  portfolioThumbWrapper: {
    alignItems: 'center',
    width: 68,
  },
  portfolioThumb: {
    width: 68,
    height: 68,
  },
  portfolioThumbImage: {
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  portfolioRemoveBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  portfolioThumbName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  saveProfileBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary_button || '#A0CCD9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  saveProfileBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalDragPill: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  serviceListScroll: {
    paddingBottom: 10,
    gap: 8,
  },
  serviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceItemCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  serviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  serviceItemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceItemIconBoxSelected: {
    backgroundColor: '#E0F2FE',
  },
  serviceItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  serviceItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  serviceItemLabelSelected: {
    fontWeight: '700',
    color: '#0369A1',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#A0CCD9',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A0CCD9',
  },
});

const autoCompleteStyles = {
  container: {
    flex: 0,
  },
  textInput: {
    height: 50,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 45,
    backgroundColor: '#F8FAFC',
  },
  listView: {
    backgroundColor: '#FFFFFF',
    elevation: 8,
    zIndex: 9999,
    position: 'absolute',
    top: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
};
