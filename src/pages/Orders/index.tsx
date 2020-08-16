import React, { useEffect, useState, useMemo } from 'react';
import { Image } from 'react-native';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  HeaderTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface IFood {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedValue: string;
  thumbnail_url: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IFood[]>([]);

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (error) {
        console.log(error) /* eslint-disable-line */
      }
    }

    loadOrders();
  }, []);

  const orderList = useMemo(() => {
    return orders.map(({ id, name, description, thumbnail_url, price }) => ({
      id,
      name,
      price,
      description,
      thumbnail_url,
      formattedValue: formatValue(price),
    }));
  }, [orders]);

  return (
    <Container>
      <Header>
        <HeaderTitle>Meus pedidos</HeaderTitle>
      </Header>

      <FoodsContainer>
        <FoodList
          data={orderList}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Food key={item.id} activeOpacity={0.6}>
              <FoodImageContainer>
                <Image
                  style={{ width: 88, height: 88 }}
                  source={{ uri: item.thumbnail_url }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{item.name}</FoodTitle>
                <FoodDescription>{item.description}</FoodDescription>
                <FoodPricing>{item.formattedValue}</FoodPricing>
              </FoodContent>
            </Food>
          )}
        />
      </FoodsContainer>
    </Container>
  );
};

export default Orders;
