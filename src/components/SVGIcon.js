import { SvgXml } from "react-native-svg"

const SVGIcon = ({height,width,xml}) => {
  return (
      <SvgXml xml={xml} height={height} width={width} />
  )
}

export default SVGIcon
