import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface ProductHeaderProps {
  produto: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ produto }) => {
  const { data: productData } = useQuery({
    queryKey: ['product-details', produto],
    queryFn: async () => {
      console.log('Fetching product details for:', produto);
      const { data, error } = await supabase
        .from('produtos')
        .select('codigo, fob, moedafob, fabrica, preco_venda, data_atualizacao_fob, estoque, marca')
        .eq('produto', produto)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product details:', error);
        throw error;
      }
      console.log('Product details fetched:', data);
      return data;
    }
  });

  const formatFob = (value: number | null, currency: string | null) => {
    if (!value) return '-';
    
    const formattedNumber = Math.floor(value).toLocaleString('en-US');
    
    switch (currency?.toUpperCase()) {
      case 'USD':
        return `USD ${formattedNumber}`;
      case 'CNY':
        return `CNY ${formattedNumber}`;
      default:
        return `${formattedNumber}`;
    }
  };

  if (!productData) return null;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-t-2xl border border-b-0 border-slate-200 p-3 space-y-1">
      <div className="grid grid-cols-7 gap-3 text-[1.15rem]">
        <div>
          <div className="text-black">COD PRODUTO</div>
          <div className="font-medium text-black">{productData.codigo || '-'}</div>
        </div>
        <div>
          <div className="text-black">FOB</div>
          <div className="font-medium text-black">
            {formatFob(productData.fob, productData.moedafob)}
          </div>
        </div>
        <div>
          <div className="text-black">FÁBRICA</div>
          <div className="font-medium text-black">{productData.fabrica || '-'}</div>
        </div>
        <div>
          <div className="text-black">MARCA</div>
          <div className="font-medium text-black">{productData.marca || '-'}</div>
        </div>
        <div>
          <div className="text-black">PREÇO VENDA</div>
          <div className="font-medium text-black">
            {productData.preco_venda ? productData.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
          </div>
        </div>
        <div>
          <div className="text-black">ATUALIZAÇÃO FOB</div>
          <div className="font-medium text-black">
            {productData.data_atualizacao_fob ? format(new Date(productData.data_atualizacao_fob), 'dd/MM/yyyy') : '-'}
          </div>
        </div>
        <div>
          <div className="text-black">ESTOQUE ATUAL</div>
          <div className="font-medium text-black">
            {productData.estoque ? productData.estoque.toLocaleString('pt-BR') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;