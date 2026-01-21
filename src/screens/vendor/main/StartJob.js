import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Container from '../../../components/Container';
import NormalHeader from '../../../components/NormalHeader';
import { images } from '../../../assets/images';
import AppButton from '../../../components/AppButton';
import { responsiveHeight } from '../../../utils';
import AppText from '../../../components/AppText';
import LineBreak from '../../../components/LineBreak';
import { useUpdateDiscussionMutation } from '../../../redux/services';
import Toast from 'react-native-simple-toast';

const StartJob = ({ route, navigation }) => {
  const { formId, status } = route?.params;
  const [jobStatus, setJobStatus] = useState(status);
  const [message, setMessage] = useState('');
  const [updateDiscussion, { isLoading }] = useUpdateDiscussionMutation();

  console.log(status);

  const btnTitle = jobStatus === 'Upcoming' ? 'START' : 'STOP';

  useEffect(() => {
    if (jobStatus === 'Start') {
      setMessage(`You've started the job. Good luck!`);
    } else if (jobStatus === 'Stop') {
      setMessage(`You've stopped the job.`);
    } else if (jobStatus === 'Rejected') {
      setMessage('This job has been rejected.');
    } else {
      setMessage('Ready to start the job ?');
    }
  }, [jobStatus]);

  const onChangeJobStatus = async status => {
    const nextStatus =
      jobStatus === 'Upcoming'
        ? 'Start'
        : jobStatus === 'Start'
        ? 'Stop'
        : null;

    if (!nextStatus) {
      Toast.show('No action available.', Toast.SHORT);
      return;
    }

    if (jobStatus === nextStatus) {
      Toast.show(
        `You have already ${
          nextStatus === 'Start' ? 'started' : 'stopped'
        } the job.`,
      );
      return;
    }

    let data = {
      formId,
      status: nextStatus,
    };
    await updateDiscussion(data)
      .unwrap()
      .then(res => {
        console.log('response of changing the job status ===>', res);
        // Toast.show(res.msg, 2000, Toast.SHORT);
        if (res.success) {
          setJobStatus(nextStatus);
          // if (status === 'Start') {
          //   setMessage(`You've started the job. Good luck!`);
          // } else {
          //   setMessage(`You've stopped the job.`);
          // }
          // navigation.navigate('ClientReview')
        }
      })
      .catch(error => {
        console.log('error while changing job status ===>', error);
        Toast.show('Some problem occured', Toast.SHORT);
      });
  };

  return (
    <Container contentStyle={{ flexGrow: 1 }}>
      <NormalHeader
        heading={
          jobStatus === 'Start'
            ? 'You’ve started the job.'
            : jobStatus === `Stop`
            ? `You've stopped the job.`
            : jobStatus === 'Rejected'
            ? 'This job has been rejected.'
            : 'Ready to start the job ?'
        }
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Image
            source={images.pest_controller}
            style={{ alignSelf: 'center', height: responsiveHeight(35) }}
            resizeMode="contain"
          />
          {(jobStatus === 'Upcoming' || jobStatus === 'Start') && (
            <View style={{ alignItems: 'center', gap: responsiveHeight(2) }}>
              <AppButton
                handlePress={() =>
                  onChangeJobStatus(status === 'Upcoming' ? 'Start' : 'Stop')
                }
                buttoWidth={40}
                borderRadius={30}
                isLoading={isLoading}
                textColor="black"
                bgColor="#a0ccd9"
                title={btnTitle}
              />
              {/* <AppButton handlePress={() => onChangeJobStatus('Stop')} buttoWidth={40} borderRadius={30} textColor='black' bgColor='#F7C845' title='STOP' /> */}
            </View>
          )}
          <LineBreak val={2} />
          <AppText align="center" title={message} />
        </View>
      </View>
    </Container>
  );
};

export default StartJob;
