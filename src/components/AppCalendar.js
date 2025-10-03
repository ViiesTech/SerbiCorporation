import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AppColors } from '../utils';

const AppCalendar = ({ date, changeDate }) => {
  return (
    <View>
      <Calendar
        style={{
          borderWidth: 1,
          borderColor: AppColors.PRIMARY,
          borderRadius: 20,
        }}
        initialDate={date}
        markedDates={{
          [date]: { selected: true, selectedColor: AppColors.PRIMARY },
        }}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#dd99ee',
        }}
        onDayPress={day => {
          changeDate(day.dateString); 
        }}
      />
    </View>
  );
};

export default AppCalendar;
