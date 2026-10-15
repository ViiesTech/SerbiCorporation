import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';

import {
  AppColors,
  DEFAULT_REGION,
  getProfileImage,
  openDialer,
} from '../../../utils';
import Loader from '../../../components/Loader';
import {
  useLazyGetAppointmentDetailQuery,
  useUpdateRequestAppointmentMutation,
  useLazyGetDiscussionFormsQuery,
  useUpdateDiscussionMutation,
  useCreateUpdateProfileMutation,
} from '../../../redux/services/index';
import { MAP_API_KEY } from '../../../redux/constant';
import { colors } from '../../../assets/colors';
import LottieView from 'lottie-react-native';

const Services = ({ route, navigation }) => {
  const { ids } = route?.params || {};
  const { user } = useSelector(state => state.persistedData);

  const isDiscussion = useMemo(
    () => (ids?.type || '').toUpperCase() === 'DISCUSSION',
    [ids?.type],
  );

  // --- State ---
  const [currentStatus, setCurrentStatus] = useState(
    ids?.status || (isDiscussion ? 'Upcoming' : 'Accepted'),
  );
  const [eta, setEta] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [technicianLocation, setTechnicianLocation] = useState({
    latitude: user?.location?.coordinates?.[1],
    longitude: user?.location?.coordinates?.[0],
  });

  // --- API Hooks ---
  const [updateRequestAppointment, { isLoading: isUpdating }] =
    useUpdateRequestAppointmentMutation();
  const [updateDiscussion, { isLoading: isUpdatingDiscussion }] =
    useUpdateDiscussionMutation();
  const [getAppointmentDetail, { data, isLoading: appointmentLoader }] =
    useLazyGetAppointmentDetailQuery();
  const [
    getDiscussionForms,
    { data: discussionData, isLoading: discussionLoader },
  ] = useLazyGetDiscussionFormsQuery();
  const [createUpdateProfile] = useCreateUpdateProfileMutation();

  // --- Refs ---
  const mapRef = useRef(null);
  const watchId = useRef(null);
  const centeredMapRef = useRef(false);

  // --- Memoized Values ---
  const statusFlow = useMemo(
    () =>
      isDiscussion
        ? ['Upcoming', 'Start', 'Stop', 'Completed']
        : ['Accepted', 'On The Way', 'Arrived'],
    [isDiscussion],
  );

  const nextStatus = useMemo(() => {
    const currentIndex = statusFlow.findIndex(
      s => s?.toLowerCase() === (currentStatus || '').toLowerCase(),
    );
    if (currentIndex === -1) {
      return statusFlow[0] || null;
    }
    return statusFlow[currentIndex + 1] || null;
  }, [currentStatus, statusFlow]);

  // Find matching discussion form if available
  const currentForm = useMemo(() => {
    if (!isDiscussion) return null;
    return discussionData?.data?.find(item => item._id === ids?.requestFormId);
  }, [isDiscussion, discussionData, ids?.requestFormId]);
  // Robust customer data extraction
  const customerUser = currentForm?.userId || ids?.user || data?.data?.userId;
  const customerName =
    customerUser?.fullName ||
    customerUser?.name ||
    ids?.user?.fullName ||
    'Customer';
  const customerImage = customerUser?.profileImage
    ? getProfileImage(customerUser.profileImage, true)
    : null;

  const customerPhone = currentForm?.userId?.phone || ids?.phone;

  // Destination coordinates
  const destinationCoords = useMemo(() => {
    const lat =
      ids?.coordinates?.lat ||
      customerUser?.latitude ||
      customerUser?.location?.coordinates?.[1] ||
      currentForm?.latitude ||
      data?.data?.latitude;
    const lng =
      ids?.coordinates?.lng ||
      customerUser?.longitude ||
      customerUser?.location?.coordinates?.[0] ||
      currentForm?.longitude ||
      data?.data?.longitude;

    if (lat && lng && Number(lat) !== 0 && Number(lng) !== 0) {
      return { latitude: Number(lat), longitude: Number(lng) };
    }
    return null;
  }, [ids?.coordinates, customerUser, currentForm, data]);

  // --- Effects ---

  // 1. Initial Data Fetching
  useEffect(() => {
    if (ids?.requestFormId) {
      if (isDiscussion) {
        getDiscussionForms({
          id: user?._id,
          type: user?.type,
          status: ids?.status,
        });
      } else {
        getAppointmentDetail(ids.requestFormId);
      }
    }
  }, [
    ids?.requestFormId,
    ids?.status,
    isDiscussion,
    getDiscussionForms,
    getAppointmentDetail,
    user,
  ]);

  // 2. Sync Status from API data
  useEffect(() => {
    if (isDiscussion) {
      if (currentForm?.status) {
        setCurrentStatus(currentForm.status);
      }
    } else if (data?.data?.status) {
      setCurrentStatus(data.data.status);
    }
  }, [data, currentForm, isDiscussion]);

  // 3. Map Animation Logic
  const fitMap = useCallback(() => {
    if (!mapRef.current) return;
    if (technicianLocation?.latitude && destinationCoords) {
      mapRef.current.fitToCoordinates([technicianLocation, destinationCoords], {
        edgePadding: { top: 100, right: 60, bottom: 320, left: 60 },
        animated: true,
      });
    } else if (destinationCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: destinationCoords.latitude,
          longitude: destinationCoords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        1000,
      );
    }
  }, [technicianLocation, destinationCoords]);

  useEffect(() => {
    if (destinationCoords && mapReady && !centeredMapRef.current) {
      fitMap();
      centeredMapRef.current = true;
    }
  }, [mapReady, destinationCoords, fitMap]);

  // 3.5 Initial Current Location
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setTechnicianLocation({ latitude, longitude });
        },
        error => console.log('GetCurrentPosition Error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    getCurrentLocation();
  }, []);

  // 4. Geolocation Tracking
  useEffect(() => {
    const startTracking = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      watchId.current = Geolocation.watchPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setTechnicianLocation({ latitude, longitude });

          if (currentStatus === 'On The Way') {
            const userId = user?._id || user?.id;
            if (!userId) return;

            const formData = new FormData();
            formData.append('userId', String(userId));
            formData.append('latitude', String(latitude));
            formData.append('longitude', String(longitude));

            try {
              await createUpdateProfile(formData).unwrap();
            } catch (err) {
              console.error('TECH_TRACKING: Sync Error', err);
            }
          }
        },
        error => console.log('Geolocation Error:', error),
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000,
        },
      );
    };

    if (currentStatus === 'On The Way') {
      startTracking();
    } else {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }

    return () => {
      if (watchId.current !== null) Geolocation.clearWatch(watchId.current);
    };
  }, [currentStatus, user, createUpdateProfile]);

  // --- Handlers ---
  const onChangeStatus = useCallback(
    async (status, shouldNavigateBack) => {
      const payload = { formId: ids?.requestFormId, status };
      const mutation = isDiscussion
        ? updateDiscussion
        : updateRequestAppointment;

      try {
        const res = await mutation(payload).unwrap();
        const updatedStatus = res?.data?.status || status;
        setCurrentStatus(updatedStatus);
        Toast.show(`Status updated to ${status}`, Toast.SHORT);

        const mustGoBack =
          shouldNavigateBack !== undefined
            ? shouldNavigateBack
            : isDiscussion
            ? status === 'Completed'
            : false;

        if (mustGoBack) {
          setTimeout(() => navigation.goBack(), 600);
        }
      } catch (error) {
        console.error('Error changing status:', error);
        Toast.show('Some problem occurred', Toast.SHORT);
      }
    },
    [
      ids?.requestFormId,
      isDiscussion,
      updateDiscussion,
      updateRequestAppointment,
      navigation,
    ],
  );

  const handlePress = () => {
    if (nextStatus) {
      onChangeStatus(nextStatus);
    }
  };

  const handleCompleteService = async () => {
    await onChangeStatus('Discussing', false);
    navigation.navigate('JobDiscussionForm', { ids });
  };

  const handleCall = () => {
    openDialer(customerPhone);
  };

  const handleChat = () => {
    navigation.navigate('Chat', {
      otherUserId: customerUser?._id || ids?.user?._id,
      userName: customerName,
      userImage: customerUser?.profileImage,
    });
  };

  const getStatusMessage = () => {
    const s = (currentStatus || '').toLowerCase();
    switch (s) {
      case 'accepted':
        return 'Payment received. Ready to start the journey.';
      case 'on the way':
        return eta !== null
          ? `You're on the way. Estimated arrival in ${Math.round(eta)} mins`
          : 'Calculating ETA...';
      case 'arrived':
        return "You've arrived at the customer's location.";
      case 'upcoming':
        return 'Service is upcoming.';
      case 'start':
        return 'Service started.';
      case 'stop':
        return 'Service stopped.';
      case 'completed':
        return 'Service completed.';
      case 'paid':
        return 'Service paid.';
      default:
        return 'Waiting to start...';
    }
  };

  if (appointmentLoader || discussionLoader) {
    return (
      <View style={styles.loaderContainer}>
        <Loader color={AppColors.PRIMARY} />
      </View>
    );
  }

  const isStatusStart = (currentStatus || '').toLowerCase() === 'start';
  const isStatusCompleted = (currentStatus || '').toLowerCase() === 'completed';

  return (
    <Fragment>
      {/* Full-screen Google Map */}
      {destinationCoords || user?.location?.coordinates ? (
        <MapView
          provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
          ref={mapRef}
          onMapReady={() => setMapReady(true)}
          style={styles.map}
          initialRegion={
            destinationCoords
              ? {
                  latitude: destinationCoords.latitude,
                  longitude: destinationCoords.longitude,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }
              : DEFAULT_REGION
          }
        >
          {technicianLocation?.latitude && (
            <Marker
              coordinate={technicianLocation}
              title="You (Technician)"
              description="Your current location"
              pinColor="#3B82F6"
            />
          )}

          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title={customerName}
              description="Appointment location"
              pinColor="#0284C7"
            />
          )}

          {technicianLocation?.latitude && destinationCoords && (
            <MapViewDirections
              origin={technicianLocation}
              destination={destinationCoords}
              apikey={MAP_API_KEY}
              strokeWidth={4}
              strokeColor="#4285F4"
              mode="DRIVING"
              onReady={result => {
                setEta(result.duration);
                fitMap();
              }}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.fallbackContainer}>
          <Ionicons name="location-outline" size={48} color="#94A3B8" />
          <Text style={styles.fallbackTitle}>Location data not available</Text>
          <Text style={styles.fallbackSubtitle}>
            Unable to show map directions for this customer.
          </Text>
        </View>
      )}

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={24} color="#1E293B" />
      </TouchableOpacity>

      {/* Floating Recenter Button */}
      {destinationCoords && (
        <TouchableOpacity
          style={styles.floatingLocateBtn}
          onPress={fitMap}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={22} color="#1E293B" />
        </TouchableOpacity>
      )}

      {/* Modern Bottom Card Sheet */}
      <View style={styles.bottomCard}>
        {/* Top Header: Customer Info + Action Buttons */}
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            {customerImage ? (
              <Image source={{ uri: customerImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#64748B" />
              </View>
            )}
            <Text numberOfLines={1} style={styles.customerName}>
              {customerName}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCircleBtn}
              onPress={handleChat}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Middle Content Area */}
        <View style={styles.middleSection}>
          {isStatusStart && (
            <View style={styles.lottieWrapper}>
              <LottieView
                source={require('../../../assets/animations/map.json')}
                autoPlay={true}
                loop={true}
                style={styles.lottieAnim}
              />
            </View>
          )}

          <Text style={styles.statusMessageText}>{getStatusMessage()}</Text>
        </View>

        {/* Bottom Primary Button */}
        {nextStatus && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handlePress}
            activeOpacity={0.85}
            disabled={isUpdating || isUpdatingDiscussion}
          >
            {isUpdating || isUpdatingDiscussion ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.primaryActionBtnText}>
                {nextStatus.toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Discussion Completed State: Done Button */}
        {isDiscussion && isStatusCompleted && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>BACK TO HOME</Text>
          </TouchableOpacity>
        )}

        {/* Requested Flow Completion */}
        {!nextStatus && !isDiscussion && currentStatus === 'Arrived' && (
          <TouchableOpacity
            onPress={handleCompleteService}
            style={styles.completeBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>SERVICE COMPLETED</Text>
          </TouchableOpacity>
        )}
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  fallbackContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  floatingLocateBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  bottomCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
  },
  avatarPlaceholder: {
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 14,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    backgroundColor: '#F1F5F9',
    height: 1,
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginVertical: 10,
  },
  lottieWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lottieAnim: {
    width: 80,
    height: 80,
  },
  statusMessageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    textAlign: 'center',
  },
  primaryActionButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary_button || '#A0CCD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  primaryActionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.8,
  },
  completeBtn: {
    backgroundColor: '#10B981',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    alignSelf: 'center',
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});

export default Services;
