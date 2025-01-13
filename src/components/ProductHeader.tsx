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
        .select('codigo, fob, fabrica, preco_venda, data_atualizacao_fob, estoque')
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

  if (!productData) return null;

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-t-2xl border border-b-0 border-slate-200 p-4 space-y-2">
      <div className="grid grid-cols-6 gap-4 text-sm">
        <div>
          <div className="text-slate-500">COD PRODUTO</div>
          <div className="font-medium">{productData.codigo || '-'}</div>
        </div>
        <div>
          <div className="text-slate-500">FOB</div>
          <div className="font-medium">
            {productData.fob ? productData.fob.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">FÁBRICA</div>
          <div className="font-medium">{productData.fabrica || '-'}</div>
        </div>
        <div>
          <div className="text-slate-500">PREÇO VENDA</div>
          <div className="font-medium">
            {productData.preco_venda ? productData.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">DATA ATUALIZAÇÃO FOB</div>
          <div className="font-medium">
            {productData.data_atualizacao_fob ? format(new Date(productData.data_atualizacao_fob), 'dd/MM/yyyy') : '-'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">ESTOQUE</div>
          <div className="font-medium">
            {productData.estoque ? productData.estoque.toLocaleString('pt-BR') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;