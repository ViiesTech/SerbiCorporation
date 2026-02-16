import { SvgXml } from 'react-native-svg';

const SVGIcon = ({ height, width, xml }) => {
  if (!xml) return null;
  return <SvgXml xml={xml} height={height} width={width} />;
};

export default SVGIcon;
