import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Container from '../components/Container';
import NormalHeader from '../components/NormalHeader';
import { useNavigation } from '@react-navigation/native';
import LineBreak from '../components/LineBreak';
import { responsiveHeight } from '../utils';
import AppText from '../components/AppText';

const Help = () => {
  const nav = useNavigation();

  return (
    <Container>
      <NormalHeader
        heading={'HELP'}
        onBackPress={() => nav.goBack()}
      />
      <LineBreak val={1} />
      <View style={{ padding: responsiveHeight(2) }}>
        <AppText
          title={`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam malesuada elementum neque at aliquet. Maecenas fringilla sagittis tincidunt. Ut vitae auctor nibh. Nunc sit amet massa diam. Curabitur mattis nibh vitae magna vehicula aliquam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In non euismod urna, non laoreet neque. Ut ut risus et ex porttitor ullamcorper. Ut sit amet venenatis nisi. Duis scelerisque placerat enim, a rhoncus nisl tempus posuere. Aliquam erat volutpat. Ut bibendum, tortor ut convallis hendrerit, lorem massa fermentum nisl, nec lobortis erat elit ac ante. Vestibulum sem risus, pharetra in sodales at, ultrices vitae nunc. Suspendisse euismod quam augue, eget scelerisque libero pharetra at. Morbi nec elementum leo, quis vehicula lacus.

Nulla feugiat erat sit amet ipsum convallis fringilla. Ut eget sapien ut enim ultricies venenatis. Etiam gravida turpis diam, sit amet gravida purus scelerisque nec. Nullam arcu arcu, tempor ut felis vel, iaculis fermentum metus. Pellentesque malesuada pharetra elit. Cras ut ipsum vitae ante convallis tincidunt et dictum turpis. Etiam hendrerit vitae lorem ac ultricies. Proin quis erat at lacus fermentum viverra. Sed ultrices ut tellus non tristique. Mauris efficitur orci sed vehicula euismod. Cras at feugiat nisi. Maecenas interdum quam vitae augue varius fringilla. Nunc dolor eros, tristique eu ipsum sit amet, sollicitudin imperdiet mauris. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In hendrerit interdum tristique.

Phasellus velit quam, ultrices eget felis sit amet, maximus convallis libero. Sed faucibus mi id ornare accumsan. Nulla aliquet, ante sed fringilla sagittis, felis dui bibendum metus, ut tempor libero neque in orci. Suspendisse sit amet mattis sem, sit amet tempus arcu. Quisque vitae sodales quam. Integer nulla est, volutpat eget luctus eget, aliquam eu lectus. Etiam nec dolor scelerisque risus consectetur iaculis. Aliquam pharetra dictum sagittis. Pellentesque sagittis vulputate augue sit amet ornare. Nunc at ante ac purus egestas viverra. In tincidunt diam in dolor iaculis eleifend. In hac habitasse platea dictumst. Integer semper varius mauris, id suscipit metus auctor vel.`}
        />
      </View>
    </Container>
  );
};

export default Help;

const styles = StyleSheet.create({});
