import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      
      const INDEX_NOT_FOUNDED = -1;

      let productAmount = (await getProductInStockById(productId)).amount;
      const productIndex = cart.findIndex( products => products.id === productId);
      if(productIndex === INDEX_NOT_FOUNDED && productAmount > 0)
      {
         let product = await getProductById(productId)
         product.amount = 1;
         const newCart = [...cart, product]    
         setCart(newCart);
         localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
         return;
      }
      if(productIndex !== INDEX_NOT_FOUNDED && productAmount > cart[productIndex].amount)
      {
         const newCart = cart.map(product => {
          if(product.id === productId) product.amount++;
          return product;
         })
         setCart(newCart);
         localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
         return;
      }    
      throw new Error(); 
    } catch {
      toast.error('Quantidade solicitada fora de estoque');
    }

    async function getProductById(productId: number) {
     return await api.get(`/products/${productId}`).then(response => response.data).catch((reason) =>{
      toast.error("Erro na adi????o do produto")
    });
    }

    async function getProductInStockById(productId: number) {
      return await api.get(`/stock/${productId}`).
      then(response => response.data).catch((reason) =>{
        toast.error("Erro na adi????o do produto")
      })
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter(product => { return product.id !== productId});
      if(newCart.length == cart.length) throw Error();
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    } catch {
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {
      if(amount <= 0)  return;

      await api.get<Stock>(`/stock/${productId}`).then(response =>{
      
        if(response.data.amount >= amount)
        {
          const existsProduct = cart.find(product => product.id === productId);
           if(!existsProduct)
           {
             return;
           } 
           const newCart = cart.map(product =>{
             if(product.id === productId) product.amount = amount;
             return product
            });
            
            setCart(newCart);
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
            return ;
        }
        toast.error('Quantidade solicitada fora de estoque'); 
        return
      });

    } catch{
      toast.error('Erro na altera????o de quantidade do produto'); 
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );

 
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
