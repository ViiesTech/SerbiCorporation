import React from 'react';
import { View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const AppClock = ({
  handleConfirm,
  isDatePickerVisible,
  setDatePickerVisibility,
}) => {
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // const handleConfirm = (date) => {
  //     // console.warn("A date has been picked: ", date);
  //     hideDatePicker();
  // };

  return (
    <View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={date => {
          handleConfirm(date);
          hideDatePicker();
        }}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default AppClock;
