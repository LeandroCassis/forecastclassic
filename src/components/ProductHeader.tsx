
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { History, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Fetch the last update information
  const { data: lastUpdateInfo } = useQuery({
    queryKey: ['forecast-last-update', productData?.codigo],
    queryFn: async () => {
      if (!productData?.codigo) return null;
      
      const response = await fetch(`/api/forecast-values-history/${encodeURIComponent(productData.codigo)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Return the first item (most recent update) if available
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!productData?.codigo,
  });

  // Format the last update timestamp if it exists
  const formattedLastUpdate = lastUpdateInfo?.modified_at 
    ? format(new Date(lastUpdateInfo.modified_at), 'dd/MM/yyyy HH:mm') 
    : '-';

  // Get user initials from full name or username
  const userInitials = lastUpdateInfo?.user_fullname 
    ? lastUpdateInfo.user_fullname.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
    : lastUpdateInfo?.username 
      ? lastUpdateInfo.username.substring(0, 2).toUpperCase()
      : '-';

  return <div className="bg-white/80 backdrop-blur-lg rounded-t-2xl shadow-lg border border-b-0 border-blue-100/50 p-4 pb-3">
      <div className="flex justify-between text-[1rem]">
        <div className="text-center">
          <div className="font-semibold text-transparent -500 mb-0.5 rounded-none ">PRODUTO</div>
          <div className="text-black text-2xl py-0">{produto}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">COD PRODUTO</div>
          <div className="text-black text-sm">{productData?.codigo || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">FOB</div>
          <div className="text-black text-sm">
            {productData?.moedafob && productData?.fob ? `${productData.moedafob} ${productData.fob.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">FÁBRICA</div>
          <div className="text-black text-sm">{productData?.fabrica || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">MARCA</div>
          <div className="text-black text-sm">{productData?.marca || '-'}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">PREÇO VENDA</div>
          <div className="text-black text-sm">
            {productData?.preco_venda ? `R$ ${productData.preco_venda.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">ATUALIZAÇÃO FOB</div>
          <div className="text-black text-sm">
            {productData?.data_atualizacao_fob ? format(new Date(productData.data_atualizacao_fob), 'dd/MM/yyyy') : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none">ESTOQUE ATUAL</div>
          <div className="text-black text-sm">
            {productData?.estoque != null ? productData.estoque.toFixed(2) : '-'}
          </div>
        </div>
        
        {/* Nova coluna com data e hora da última atualização */}
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none flex items-center justify-center">
            <History size={14} className="mr-1" />
            ÚLTIMA ATUALIZAÇÃO
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-black text-sm">
                  {formattedLastUpdate}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data e hora da última atualização</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Nova coluna com as iniciais do usuário que fez a última atualização */}
        <div className="text-center">
          <div className="font-semibold text-black -500 mb-0.5 rounded-none flex items-center justify-center">
            <User size={14} className="mr-1" />
            POR
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-black text-sm">
                  {userInitials !== '-' ? (
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium mx-auto">
                      {userInitials}
                    </div>
                  ) : '-'}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{lastUpdateInfo?.user_fullname || lastUpdateInfo?.username || 'Usuário desconhecido'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>;
};

export default ProductHeader;
