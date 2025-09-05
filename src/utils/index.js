import { Dimensions } from "react-native";
import { images } from "../assets/images";

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