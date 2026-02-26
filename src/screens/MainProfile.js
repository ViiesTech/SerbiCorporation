import React, { useEffect } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { StarRatingDisplay } from 'react-native-star-rating-widget';

// Components & Assets
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import Button from '../components/Button';
import LineBreak from '../components/LineBreak';
import AppText from '../components/AppText';
import Loader from '../components/Loader';
import { colors } from '../assets/colors';
import { images } from '../assets/images';
import { getProfileImage, responsiveHeight } from '../utils';
import { useLazyGetProfileQuery } from '../redux/services';

const MainProfile = () => {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  // Get user ID from Redux
  const { _id } = useSelector(state => state.persistedData.user);
  const [getProfile, { data, isLoading }] = useLazyGetProfileQuery();

  const userProfile = data?.data;

  useEffect(() => {
    if (isFocused && _id) {
      getProfile(_id);
    }
  }, [isFocused, _id]);

  console.log('userProfile:-', userProfile);

  return (
    <Container>
      <NormalHeader heading={'ACCOUNT'} onBackPress={() => nav.goBack()} />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.centerAlign}>
            <LineBreak val={4} />

            {/* Profile Image */}
            <Image
              style={styles.profileImg}
              source={
                userProfile?.profileImage
                  ? { uri: getProfileImage(userProfile.profileImage, true) }
                  : images.userProfile
              }
            />

            <LineBreak val={2} />
            <AppText
              title={userProfile?.fullName || 'Guest User'}
              size={2.4}
              fontWeight={'bold'}
            />

            <LineBreak val={2.5} />
            <Button
              onPress={() => nav.navigate('Profile', { user: userProfile })}
              title={'Edit Profile'}
              color={colors.secondary_button}
            />

            <LineBreak val={2} />
            <AppText
              align={'center'}
              title={userProfile?.locationName || 'No Location Provided'}
              color={colors.gray}
            />

            <LineBreak val={2.5} />

            {/* Technician Stats (Rating/Reviews) */}
            {userProfile?.type === 'Technician' && (
              <View style={styles.centerAlign}>
                <AppText size={2.2} fontWeight={'bold'} title={'Review'} />
                <LineBreak val={1} />
                <View style={styles.ratingRow}>
                  <StarRatingDisplay
                    rating={userProfile?.avgRating || 0}
                    starSize={20}
                    starStyle={styles.starSpacing}
                  />
                  <AppText
                    fontWeight={'bold'}
                    title={userProfile?.avgRating || '0.0'} // ?.toFixed(1)
                  />
                  <AppText
                    title={`(${userProfile?.totalReviews || 0})`}
                    color={colors.gray}
                  />
                </View>
                <LineBreak val={2.5} />
              </View>
            )}

            <View style={styles.divider} />
          </View>

          <LineBreak val={2.5} />

          {/* About Section */}
          <View style={styles.aboutContainer}>
            <AppText size={2.2} fontWeight={'bold'} title={'About'} />
            <LineBreak val={1.5} />
            {userProfile?.type === 'Technician' ? (
              <View style={styles.infoBox}>
                <AppText
                  title={`Service: ${userProfile?.service?.name || 'N/A'}`}
                />
                <AppText title={`Price: $${userProfile?.price || '0'}`} />
                <AppText
                  title={`Hours: ${
                    userProfile?.workingHours?.startTime || '09:00 AM'
                  } - ${userProfile?.workingHours?.endTime || '05:00 PM'}`}
                />
              </View>
            ) : (
              <AppText
                align={'left'}
                title={
                  'This is a user account. Edit your profile to add more details about yourself.'
                }
                color={colors.gray}
              />
            )}
          </View>
        </ScrollView>
      )}
    </Container>
  );
};

export default MainProfile;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  centerAlign: {
    alignItems: 'center',
  },
  profileImg: {
    height: responsiveHeight(14),
    width: responsiveHeight(14),
    borderRadius: responsiveHeight(7),
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starSpacing: {
    marginHorizontal: 0,
  },
  divider: {
    borderBottomWidth: 0.5,
    width: '85%',
    borderBottomColor: colors.black,
    opacity: 0.2,
  },
  aboutContainer: {
    paddingHorizontal: responsiveHeight(3.5),
  },
  infoBox: {
    gap: 8,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
  },
});

// import { StyleSheet, Text, View } from 'react-native';
// import React, { useEffect } from 'react';
// import Container from '../components/Container';
// import NormalHeader from '../components/NormalHeader';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import Button from '../components/Button';
// import { colors } from '../assets/colors';
// import LineBreak from '../components/LineBreak';
// import { Image } from 'react-native';
// import AppText from '../components/AppText';
// import { images } from '../assets/images';
// import { getProfileImage, responsiveHeight } from '../utils';
// import { StarRatingDisplay } from 'react-native-star-rating-widget';
// import { useLazyGetProfileQuery } from '../redux/services';
// import { useSelector } from 'react-redux';
// import Loader from '../components/Loader';
// import { IMAGE_URL } from '../redux/constant';

// const MainProfile = () => {
//   const nav = useNavigation();
//   const { _id } = useSelector(state => state.persistedData.user);
//   const [getProfile, { data, isLoading }] = useLazyGetProfileQuery();

//   const isFocused = useIsFocused();

//   // console.log('user data ===>', data?.data.profileImage);

//   useEffect(() => {
//     if (isFocused) {
//       getProfile(_id);
//     }
//   }, [isFocused]);

//   return (
//     <Container>
//       <NormalHeader heading={'ACCOUNT'} onBackPress={() => nav.goBack()} />
//       {isLoading ? (
//         <>
//           <LineBreak val={2} />
//           <Loader />
//         </>
//       ) : (
//         <>
//           <View style={{ alignItems: 'center' }}>
//             <LineBreak val={5} />
//             <Image
//               style={{
//                 height: responsiveHeight(12),
//                 width: responsiveHeight(12),
//                 borderRadius: 100,
//                 backgroundColor: '#fafafa',
//               }}
//               source={
//                 data?.data.profileImage
//                   ? { uri: getProfileImage(data?.data?.profileImage) }
//                   : images.userProfile
//               }
//               // source={
//               //   data?.data?.profileImage
//               //     ? {
//               //         uri: data?.data?.isGoogleUser
//               //           ? `${data.data.profileImage}`
//               //           : `${IMAGE_URL}${data.data.profileImage}`,
//               //       }
//               //     : images.userProfile
//               // }
//             />
//             <LineBreak val={2} />
//             <AppText title={data?.data?.fullName} />
//             <LineBreak val={3} />
//             <Button
//               onPress={() => nav.navigate('Profile', { user: data?.data })}
//               title={'Edit Profile'}
//               color={colors.secondary_button}
//             />
//             <LineBreak val={2} />
//             <AppText align={'center'} title={data?.data?.locationName} />
//             <LineBreak val={2.5} />
//             {data?.data?.type !== 'User' && (
//               <>
//                 <AppText size={2.5} fontWeight={'bold'} title={'Review'} />
//                 <LineBreak val={1} />
//                 <View
//                   style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
//                 >
//                   <StarRatingDisplay rating={1} maxStars={1} />
//                   <AppText
//                     fontWeight={'bold'}
//                     title={data?.data?.avgRating || 0}
//                   />
//                   <AppText title={`(${data?.data?.totalReviews || 0})`} />
//                 </View>
//                 <LineBreak val={2.5} />
//               </>
//             )}
//             <View
//               style={{
//                 borderBottomWidth: 0.5,
//                 width: '85%',
//                 borderBottomColor: colors.black,
//               }}
//             />
//           </View>
//           <LineBreak val={2.5} />
//           <View style={{ paddingHorizontal: responsiveHeight(3.5) }}>
//             <AppText size={2.5} fontWeight={'bold'} title={'About'} />
//             <LineBreak val={2} />
//             <AppText align={'center'} title={'No Detail Found'} />
//           </View>
//         </>
//       )}
//     </Container>
//   );
// };

// export default MainProfile;

// const styles = StyleSheet.create({});
