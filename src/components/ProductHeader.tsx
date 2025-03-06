import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
interface ProductHeaderProps {
  produto: string;
}
const ProductHeader: React.FC<ProductHeaderProps> = ({
  produto
}) => {
  const {
    data: productData
  } = useQuery({
    queryKey: ['product-details', produto],
    queryFn: async () => {
      console.log('Fetching product details for:', produto);
      const response = await fetch(`/api/produtos/${encodeURIComponent(produto)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('Product details fetched:', data);
      return data;
    }
  });
  return <div className="bg-white/80 backdrop-blur-lg rounded-t-2xl shadow-lg border border-b-0 border-blue-100/50 p-4 pb-3">
      <div className=" flex justify-between text-[1rem] ">
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">PRODUTO</div>
          <div className="text-black text-base py-0 ">{produto}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">COD PRODUTO</div>
          <div className="text-black text-base py-0 ">{productData?.codigo || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">FOB</div>
          <div className="text-black text-base py-0 ">
            {productData?.moedafob && productData?.fob ? `${productData.moedafob} ${productData.fob.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">FÁBRICA</div>
          <div className="text-black text-base py-0 ">{productData?.fabrica || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">MARCA</div>
          <div className="text-black text-base py-0 ">{productData?.marca || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">PREÇO VENDA</div>
          <div className="text-black text-base py-0 ">
            {productData?.preco_venda ? `R$ ${productData.preco_venda.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">ATUALIZAÇÃO FOB</div>
          <div className="text-black text-base py-0 ">
            {productData?.data_atualizacao_fob ? format(new Date(productData.data_atualizacao_fob), 'dd/MM/yyyy') : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">ESTOQUE ATUAL</div>
          <div className="text-black text-base py-0 ">
            {productData?.estoque != null ? productData.estoque.toFixed(2) : '-'}
          </div>
        </div>
      </div>
    </div>;
};
export default ProductHeader;