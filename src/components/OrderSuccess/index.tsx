import React, { useEffect, useState, useMemo } from 'react';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { Container, SuccessText } from './styles';

const OrderSuccess: React.FC = () => {
  useEffect(() => {}, []);

  return (
    <Container>
      <Icon name="thumbs-up" size={80} color="#39B100" />
      <SuccessText>Pedido confirmado!</SuccessText>
    </Container>
  );
};

export default OrderSuccess;
