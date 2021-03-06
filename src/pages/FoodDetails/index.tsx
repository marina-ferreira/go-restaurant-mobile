import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';
import OrderSuccess from '../../components/OrderSuccess';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  thumbnail_url?: string;
  category?: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [isSuccessOrder, setIsSuccessOrder] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      try {
        const { data } = await api.get(`/foods/${routeParams.id}`);

        setFood(data);
        setExtras(data.extras);
      } catch (error) {
        console.log(error) /* eslint-disable-line */
      }
    }

    loadFood();
  }, [routeParams]);

  useEffect(() => {
    async function loadFavorites(): Promise<void> {
      try {
        const { data } = await api.get(`/favorites`);
        const isFav = !!data.find((fav: Params) => fav.id === routeParams.id);

        isFav && setIsFavorite(isFav);
      } catch (error) {
        console.log(error) /* eslint-disable-line */
      }
    }

    loadFavorites();
  }, [routeParams]);

  const memoizedFood = useMemo(() => {
    const { id, name, price, description, image_url } = food;

    return {
      id,
      name,
      description,
      image_url,
      formattedPrice: formatValue(price),
    };
  }, [food]);

  function handleIncrementExtra(id: number): void {
    const updatedExtras = extras.map(extra => {
      const quantity = extra.quantity ? extra.quantity + 1 : 1;
      return extra.id === id ? { ...extra, quantity } : extra;
    });

    setExtras(updatedExtras);
  }

  function handleDecrementExtra(id: number): void {
    const updatedExtras = extras.map(extra => {
      return extra.id === id && extra.quantity > 0
        ? { ...extra, quantity: extra.quantity - 1 }
        : extra;
    });

    setExtras(updatedExtras);
  }

  function handleIncrementFood(): void {
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    const quantity = foodQuantity > 1 ? foodQuantity - 1 : 1;
    setFoodQuantity(quantity);
  }

  const toggleFavorite = useCallback(async () => {
    if (isFavorite) {
      await api.delete(`/favorites/${food.id}`);
    } else {
      await api.post(`/favorites`, food);
    }

    setIsFavorite(!isFavorite);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const extrasTotal = extras.reduce((total, extra) => {
      const price = (extra.quantity || 0) * extra.value;
      total += price;
      return total;
    }, 0);

    return extrasTotal * foodQuantity + food.price * foodQuantity;
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    try {
      const { id, name, description, category, thumbnail_url } = food;
      const params = {
        name,
        description,
        category,
        thumbnail_url,
        product_id: id,
        price: cartTotal,
        extras,
      };

      await api.post('/orders', params);
      setIsSuccessOrder(true);

      setTimeout(() => {
        setIsSuccessOrder(false);
        navigation.navigate('Home');
      }, 2000);
    } catch (error) {
      console.log(error); /* eslint-disable-line */
    }
  }

  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 360, height: 183 }}
                source={{
                  uri: memoizedFood.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{memoizedFood.name}</FoodTitle>
              <FoodDescription>{memoizedFood.description}</FoodDescription>
              <FoodPricing>{memoizedFood.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity || 0}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">
              {formatValue(cartTotal)}
            </TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>

      {isSuccessOrder && <OrderSuccess />}
    </Container>
  );
};

export default FoodDetails;
