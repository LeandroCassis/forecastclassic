
import React from 'react';
import ProductHeader from '@/components/ProductHeader';
import ForecastTable from '@/components/ForecastTable';

interface Produto {
  codigo: string;
  produto: string;
  marca: string;
  fabrica: string;
  familia1: string;
  familia2: string;
  empresa: string;
}

interface ProductListProps {
  products: Produto[];
  isLoading: boolean;
}

const LoadingPlaceholder = () => (
  <div className="space-y-12">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductList: React.FC<ProductListProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  if (products.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center">
        <p>Nenhum produto encontrado com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {products.map(produto => (
        <div key={produto.produto} className="space-y-0">
          <ProductHeader produto={produto.produto} />
          <ForecastTable produto={produto.produto} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
