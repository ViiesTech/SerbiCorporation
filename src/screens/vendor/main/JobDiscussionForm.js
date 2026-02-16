import { TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import NormalHeader from './../../../components/NormalHeader';
import Container from './../../../components/Container';
import {
  AppColors,
  responsiveFontSize,
  responsiveHeight,
} from '../../../utils';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import AppTextInput from './../../../components/AppTextInput';
import Feather from 'react-native-vector-icons/Feather';
import AppButton from './../../../components/AppButton';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors } from '../../../assets/colors';
import AppCalendar from '../../../components/AppCalendar';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';
import AppClock from '../../../components/AppClock';
import { useCreateDiscussFormMutation } from '../../../redux/services';
import Toast from 'react-native-simple-toast';
import { useSelector } from 'react-redux';

const JobDiscussionForm = ({ route, navigation }) => {
  const [pestValue, setPestValue] = useState(null);
  const [pestOpen, setPestOpen] = useState(false);
  const [pestItems, setPestItems] = useState([
    {
      label: 'General Pest Spray',
      value: 'General Pest Spray',
    },
  ]);
  const [propertyValue, setPropertyValue] = useState(null);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [propertyItems, setPropertyItems] = useState([
    {
      label: 'Residential',
      value: 'Residential',
    },
    {
      label: 'Commercial',
      value: 'Commercial',
    },
    {
      label: 'Industrial',
      value: 'Industrial',
    },
  ]);
  const [residentialValue, setResidentialValue] = useState(null);
  const [residentialOpen, setResidentialOpen] = useState(false);
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
  const [severityValue, setSeverityValue] = useState(null);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [severityItems, setSeverityItems] = useState([
    {
      label: 'Low',
      value: 'Low',
    },
    {
      label: 'High',
      value: 'High',
    },
  ]);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [isShowCalendar, setIsShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(moment().format('hh:mm A'));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [createDiscussForm, { isLoading }] = useCreateDiscussFormMutation();

  const { user } = useSelector(state => state.persistedData);

  //   console.log('time ===>', time);
  const { ids } = route?.params;

  const onCreateDiscussForm = async () => {
    if (!pestValue) {
      Toast.show(
        'Please select the type of pest before submitting the form.',
        Toast.SHORT,
      );
      return;
    }
    if (!propertyValue) {
      Toast.show(
        'Please select the type of property before submitting the form.',
        Toast.SHORT,
      );
      return;
    }
    if (!severityValue) {
      Toast.show('Issue severity is required.', Toast.SHORT);
      return;
    }
    if (!note) {
      Toast.show('Please enter the note', Toast.SHORT);
      return;
    }
    if (!amount) {
      Toast.show('Please select the amount', Toast.SHORT);
      return;
    }
    let data = {
      userId: ids?.user?._id,
      technicianId: ids?.technicianId,
      requestFormId: ids?.requestFormId,
      serviceId: ids?.serviceId,
      typeOfPest: pestValue,
      propertyType: propertyValue,
      residentailType: residentialValue,
      severity: severityValue,
      date: date,
      time: time,
      Notes: note,
      amount,
    };

    await createDiscussForm(data)
      .unwrap()
      .then(res => {
        console.log('response of creating the discussion form', res);
        Toast.show(res.msg, Toast.SHORT);
        if (res.success) {
          navigation.navigate('Home');
        }
      })
      .catch(error => {
        console.log('error creating discussion form', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  return (
    <Container
      contentStyle={{ paddingBottom: responsiveHeight(5) }}
      scrollEnabled={true}
    >
      <NormalHeader
        heading={'job discussion Form'}
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ paddingHorizontal: responsiveHeight(2.5) }}>
        <LineBreak val={4} />
        {/* <View style={{
                    backgroundColor: AppColors.WHITE,
                    elevation: 5,
                    borderRadius: 20,
                    paddingHorizontal: responsiveWidth(4),
                    paddingVertical: responsiveHeight(2),
                    gap: responsiveHeight(1),
                }}> */}
        <View>
          <AppText
            title={'Type of Pest'}
            color={AppColors.BLACK}
            size={1.7}
            fontWeight={'bold'}
          />
          <LineBreak val={0.5} />
          <View style={{ zIndex: 4000 }}>
            <DropDownPicker
              open={pestOpen}
              value={pestValue}
              items={pestItems}
              dropDownDirection="BOTTOM"
              placeholder="Select"
              dropDownContainerStyle={{
                borderColor: colors.secondary_button,
                borderRadius: 15,
              }}
              style={{
                borderRadius: pestOpen ? 15 : 30,
                borderColor: colors.secondary_button,
              }}
              setOpen={setPestOpen}
              setValue={setPestValue}
              setItems={setPestItems}
            />
          </View>
          {/* <AppTextInput
            inputPlaceHolder={'General Pest Spray'}
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
        <LineBreak val={1.5} />
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
              open={propertyOpen}
              value={propertyValue}
              items={propertyItems}
              dropDownDirection="BOTTOM"
              placeholder="Select"
              dropDownContainerStyle={{
                borderColor: colors.secondary_button,
                borderRadius: 15,
              }}
              style={{
                borderRadius: propertyOpen ? 15 : 30,
                borderColor: colors.secondary_button,
              }}
              setOpen={setPropertyOpen}
              setValue={val => {
                setPropertyValue(val());
                setResidentialOpen(true);
              }}
              setItems={setPropertyItems}
            />
          </View>
        </View>
        {propertyValue === 'Residential' && (
          <>
            <LineBreak val={1.5} />
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
          </>
        )}
        <LineBreak val={1.5} />
        <View>
          <AppText
            title={'Issue Severity'}
            color={AppColors.BLACK}
            size={1.7}
            fontWeight={'bold'}
          />
          <LineBreak val={0.5} />
          <View style={{ zIndex: 1000 }}>
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
        <LineBreak val={1.5} />
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
          <LineBreak val={1} />
          <AppTextInput
            inputPlaceHolder={'Lore ipsm...'}
            inputHeight={8}
            multiline={true}
            value={note}
            onChangeText={text => setNote(text)}
            textAlignVertical={'top'}
            borderRadius={10}
          />
        </View>
        <LineBreak val={1.5} />
        <View>
          <AppText
            title={'Select Date'}
            color={AppColors.BLACK}
            size={1.8}
            fontWeight={'bold'}
          />
          <LineBreak val={0.5} />
          <TouchableOpacity onPress={() => setIsShowCalendar(!isShowCalendar)}>
            <AppTextInput
              inputPlaceHolder={'03/17/2025'}
              borderRadius={30}
              editable={false}
              value={moment(date).format('DD/MM/YYYY')}
              inputWidth={77}
              rightIcon={
                <Entypo
                  name="chevron-small-down"
                  size={responsiveFontSize(3.5)}
                  color={AppColors.BLACK}
                />
              }
            />
          </TouchableOpacity>
          {isShowCalendar && (
            <AppCalendar changeDate={day => setDate(day)} date={date} />
          )}
        </View>
        <LineBreak val={1.5} />
        <View>
          <AppText
            title={'Select Time'}
            color={AppColors.BLACK}
            size={1.8}
            fontWeight={'bold'}
          />
          <LineBreak val={0.5} />
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(!isDatePickerVisible)}
          >
            <AppTextInput
              inputPlaceHolder={'10:00 AM'}
              borderRadius={30}
              inputWidth={77}
              editable={false}
              value={time}
              rightIcon={
                <Entypo
                  name="chevron-small-down"
                  size={responsiveFontSize(3.5)}
                  color={AppColors.BLACK}
                />
              }
            />
          </TouchableOpacity>
          <AppClock
            isDatePickerVisible={isDatePickerVisible}
            handleConfirm={date => setTime(moment(date).format('hh:mm A'))}
            setDatePickerVisibility={setDatePickerVisibility}
          />
        </View>
        <LineBreak val={1.5} />
        <View>
          <AppText
            title={'Amount'}
            color={AppColors.BLACK}
            size={1.7}
            fontWeight={'bold'}
          />
          <LineBreak val={0.5} />
          <AppTextInput
            keyboardType={'numeric'}
            value={amount}
            onChangeText={text => setAmount(text)}
            inputPlaceHolder={'$150.00'}
            borderRadius={40}
          />
        </View>
        {/* </View> */}
        <LineBreak val={3} />
        <AppButton
          alignSelf={'center'}
          handlePress={() => onCreateDiscussForm()}
          textColor="black"
          textFontWeight={'bold'}
          title="SUBMIT"
          isLoading={isLoading}
          bgColor="#A0CCD9"
          borderRadius={30}
        />
      </View>
    </Container>
  );
};

export default JobDiscussionForm;
