import { Image } from 'react-native';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { colors } from '../../assets/colors';
import { images } from '../../assets/images';
import { responsiveHeight } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { useSetUserTypeMutation } from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { useState } from 'react';

const typeData = [
  {
    id: 1,
    type: 'Technician',
    color: colors.secondary_button,
  },
  {
    id: 2,
    type: 'User',
    color: colors.primary,
  },
];

const SelectType = ({ route }) => {
  const navigation = useNavigation();
  const [buttonTouched, setButtonTouched] = useState(null);
  const [setUserType, { isLoading }] = useSetUserTypeMutation();
  // console.log(route?.params?.authType)

  const onSelectType = async type => {
    //   await AsyncStorage.setItem('type',type)
    if (route?.params?.token) {
      await setUserType({type,token: route?.params?.token})
        .unwrap()
        .then(res => {
          console.log('response of user type ===>', res);
          Toast.show('Account created successfully!', 2000, Toast.SHORT);
        })
        .catch(error => {
          console.log('error setting user type ===>', error);
          Toast.show('Some problem occured', 2000, Toast.SHORT);
        });
    } else {
      navigation.navigate('Signup', { type: type });
    }
  };

  return (
    <Container space={12} authHeading={true}>
      <Image
        resizeMode="cover"
        style={{
          height: responsiveHeight(30),
          width: responsiveHeight(30),
          alignSelf: 'center',
        }}
        source={images.logo}
      />
      {typeData.map((item, index) => (
        <Button
          onPress={() => {
            onSelectType(item.type);
            setButtonTouched(index);
          }}
          title={item.type.toUpperCase()}
          indicator={buttonTouched == index && isLoading}
          style={{ marginBottom: responsiveHeight(2) }}
          color={item.color}
        />
      ))}
      {/* <LineBreak val={2} />
      <Button
        onPress={() => onSelectType('User')}
        title={'USER'}
        color={colors.primary}
      /> */}
    </Container>
  );
};

export default SelectType;
