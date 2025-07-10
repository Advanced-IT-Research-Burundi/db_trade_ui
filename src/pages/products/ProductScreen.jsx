import React from 'react';
import { useApi } from '../../hooks/useApi';
import { useMutation } from 'react-query';
import ApiService from '../../services/api';
const ProductsList = () => {
  const { data: products, loading, refetch } = useApi('/api/products');
  const { mutate: deleteProduct } = useMutation(
    (id) => ApiService.delete(`/api/products/${id}`)
  );

  return (
    <div className="products-list">
      {loading ? (
        <p>Loading...</p>
      ) : (
        products.map((product) => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </div>
        ))
      )}
      <button onClick={refetch}>Refresh Products</button>
    </div>
  );
};
export default ProductsList;