import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;  
}

interface ProductData{
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => {
      return ({...product, priceFormatted : formatPrice(product.price), subTotal: formatPrice(product.price*product.amount)})
  }) as ProductData[];

  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        sumTotal+=product.price*product.amount;
        return sumTotal;
      }, 0)
    )

  function handleProductIncrement(product: Product) {
     product.amount++;
     const {id: productId, amount} = product; 
     updateProductAmount({productId, amount});
  }

  function handleProductDecrement(product: Product) {
    product.amount =  product.amount > 0 ? product.amount - 1 : product.amount;
    const {id: productId, amount} = product; 
    updateProductAmount({productId, amount});
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>cartFormatted.</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
        {cart.length > 0 && cartFormatted.map(product =>(
                        <tr data-testid="product" key= {product.id}>

                        <td>
                          <img src= {product.image} alt={product.title} />
                        </td>
                        <td>
                          <strong>{product.title}</strong>
                          <span>{product.priceFormatted}</span>
                        </td>
                        <td>
                          <div>
                            <button
                              type="button"
                              data-testid="decrement-product"
                              disabled={product.amount <= 1}
                              onClick={() => handleProductDecrement(product)}
                            >
                              <MdRemoveCircleOutline size={20} />
                            </button>
                            <input
                              type="text"
                              data-testid="product-amount"
                              readOnly
                              value={product.amount}
                            />
                            <button
                              type="button"
                              data-testid="increment-product"
                             onClick={() => handleProductIncrement(product)}
                            >
                              <MdAddCircleOutline size={20} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <strong>{product.subTotal}</strong>
                        </td>
                        <td>
                          <button
                            type="button"
                            data-testid="remove-product"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
        ))}

        </tbody>

      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
