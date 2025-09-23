import { Dimensions,Platform,PermissionsAndroid } from "react-native";
import { images } from "../assets/images";
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-simple-toast'
import moment from 'moment'

const percentageCalculation = (max, val) => max * (val / 100);

const fontCalculation = (height, width, val) => {
  const widthDimension = height > width ? width : height;
  const aspectRatioBasedHeight = (16 / 9) * widthDimension;
  return percentageCalculation(Math.sqrt(Math.pow(aspectRatioBasedHeight, 2) + Math.pow(widthDimension, 2)), val);
};
export const responsiveFontSize = (f) => {
  const { height, width } = Dimensions.get("window");
  return fontCalculation(height, width, f);
};
export const responsiveHeight = (h) => {
  const { height } = Dimensions.get("window");
  return height * (h / 100)
}
export const responsiveWidth = (w) => {
  const { width } = Dimensions.get("window");
  return width * (w / 100)
}

export const AppColors = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  BTNCOLOURS: "#DEDEDE",
  // LIGHTGRAY: "#D9D9D9",
  GRAY: "#777777",
  BLUE: "#001AB0",
  DARKGRAY: "#939393",
  PEACHCOLOUR: "#F7D794",
  INPUTBG: "#F5F5F5",
  BGCOLOURS: "#80FF45",
  BGCOLOURS2: "#FE3F9B",
  PRIMARY: "#A0CCD9",
  TEXTCOLOR: "#494949",
  LIGHTGRAY: "#5D5D5D",
  LIGHTESTGRAY: "#EDEDED",
  rightArrowCOlor: "#3D56F0",
  ThemeBlue: '#0893fa',
  Yellow: '#FF9C12',
};


export const slides = [
  {
    key: 1,
    title: 'Welcome to Serbi',
    sub_title: 'SAY GOODBYE TO PESTS WITH SERBI',
    text: 'Lorem ipsum simply dummy text is for using pricing or printing. Dolor sit amet lorem ipsum sit simply dummy text is for using printing or pricing.',
    image: images.slide1,
  },
  {
    key: 2,
    title: 'Book appointment',
    sub_title: 'HOME SERVICES AT YOUR FINGERTIPS',
    text: 'Lorem ipsum simply dummy text is for using pricing or printing. Dolor sit amet lorem ipsum sit simply dummy text is for using printing or pricing.',
    image: images.slide2,
  },
  {
    key: 3,
    title: 'Proceed with work',
    sub_title: 'SERBI EXPERTS AT YOUR DOORSTEP!',
    text: 'Lorem ipsum simply dummy text is for using pricing or printing. Dolor sit amet lorem ipsum sit simply dummy text is for using printing or pricing.',
    image: images.slide3,
  }
];



export const getCurrentLocation = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
       return Toast.show('Location permission denied')
      }
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords); 
        },
        (error) => {
          reject(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  } catch (err) {
    throw new Error(err);
  }
};
 
export  const getShortFileName = (name = '', maxLength = 25) => {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  return name.substring(0, maxLength - ext.length - 3) + '...' + ext;
};

// export const getCreationStatus = (date) => {
//   const input = moment(date);

//   if (input.isSame(moment(), "day")) {
//     return "TODAY";
//   } else if (input.isSame(moment().subtract(1, "day"), "day")) {
//     return "YESTERDAY";
//   } else {
//     return input.format("ddd, MMM D"); 
//   }
// }