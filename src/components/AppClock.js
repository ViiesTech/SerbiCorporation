import React from 'react'
import { View } from 'react-native'
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AppClock = ({ isDatePickerVisible, setDatePickerVisibility }) => {

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        console.warn("A date has been picked: ", date);
        hideDatePicker();
    };

    return (
        <View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
        </View>
    )
}

export default AppClock