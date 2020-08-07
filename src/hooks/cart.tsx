/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromStorage = await AsyncStorage.getItem(
        '@GoBarber:products',
      );
      if (productsFromStorage !== null) {
        setProducts(JSON.parse(productsFromStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const findProduct = products.find(item => item.id === product.id);
      if (!findProduct) {
        const newProduct = { ...product, quantity: 1 };
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify([...products, newProduct]),
        );
        setProducts([...products, newProduct]);
      } else {
        const addProduct = products.map(item => {
          if (item === findProduct) {
            item.quantity += 1;
          }
          return item;
        });

        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(addProduct),
        );
        setProducts(addProduct);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const increase = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }
        return product;
      });
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(increase),
      );
      setProducts(increase);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrease = products
        .map(product => {
          if (product.id === id) {
            if (product.quantity > 0) {
              product.quantity -= 1;
            }
          }
          return product;
        })
        .filter(product => product.quantity !== 0);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(decrease),
      );
      setProducts(decrease);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
