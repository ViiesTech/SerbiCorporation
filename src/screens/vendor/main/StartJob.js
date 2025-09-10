import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Container from '../../../components/Container'
import NormalHeader from '../../../components/NormalHeader'
import { images } from '../../../assets/images'
import AppButton from '../../../components/AppButton'
import { responsiveHeight } from '../../../utils'
import AppText from '../../../components/AppText'
import LineBreak from '../../../components/LineBreak'

const StartJob = ({ navigation }) => {
  const [startJob, setStartJob] = useState(true);
  useEffect(() => {
    setInterval(() => {
      setStartJob(false)

    }, 2000)
  }, [])
  return (
    <Container contentStyle={{ flexGrow: 1 }}>
      <NormalHeader heading={startJob ? 'You’ve started the job.' : 'You’ve Done the job.'} onBackPress={() => navigation.goBack()} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Image source={images.pest_controller} style={{ alignSelf: 'center', height: responsiveHeight(35) }} resizeMode='contain' />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: responsiveHeight(2) }}>
            <AppButton buttoWidth={40} borderRadius={30} textColor='black' bgColor='#a0ccd9' title='START' />
            <AppButton handlePress={() => navigation.navigate('ClientReview')} buttoWidth={40} borderRadius={30} textColor='black' bgColor='#F7C845' title='STOP' />
          </View>
          <LineBreak val={2} />
          <AppText align='center' title='You’ve started the job. Good luck!' />
        </View>
      </View>
    </Container>
  )
}

export default StartJob