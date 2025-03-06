
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchFromApi } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import UserHeader from '@/components/UserHeader';
import FilterSection from '@/components/FilterSection';
import PaginationComponent from '@/components/PaginationComponent';
import ProductList from '@/components/ProductList';

interface Produto {
  codigo: string;
  produto: string;
  marca: string;
  fabrica: string;
  familia1: string;
  familia2: string;
  empresa: string;
}

// Define filter options interface to ensure proper typing
interface FilterOptions {
  marcas: string[];
  fabricas: string[];
  familia1: string[];
  familia2: string[];
  produtos: string[];
}

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedFabricas, setSelectedFabricas] = useState<string[]>([]);
  const [selectedFamilia1, setSelectedFamilia1] = useState<string[]>([]);
  const [selectedFamilia2, setSelectedFamilia2] = useState<string[]>([]);
  const [selectedProdutos, setSelectedProdutos] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, [isLoggedIn]);

  const {
    data: produtos,
    isLoading,
    error
  } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      console.log('Fetching produtos from Azure SQL...');
      try {
        return await fetchFromApi('/produtos');
      } catch (error) {
        console.error('Error in produtos query:', error);
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: isLoggedIn
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPage]);

  const getFilteredProducts = (allProducts: Produto[] | null, marcas: string[], fabricas: string[], familia1: string[], familia2: string[], produtos: string[]) => {
    if (!allProducts) return [];
    return allProducts.filter(produto => {
      const matchesMarca = marcas.length === 0 || marcas.includes(produto.marca);
      const matchesFabrica = fabricas.length === 0 || fabricas.includes(produto.fabrica);
      const matchesFamilia1 = familia1.length === 0 || familia1.includes(produto.familia1);
      const matchesFamilia2 = familia2.length === 0 || familia2.includes(produto.familia2);
      const matchesProduto = produtos.length === 0 || produtos.includes(produto.produto);
      return matchesMarca && matchesFabrica && matchesFamilia1 && matchesFamilia2 && matchesProduto;
    });
  };

  const filteredProdutos = useMemo(() => {
    return getFilteredProducts(produtos, selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos);
  }, [produtos, selectedMarcas, selectedFabricas, selectedFamilia1, selectedFamilia2, selectedProdutos]);

  const totalPages = Math.ceil((filteredProdutos?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProdutos?.length || 0);
  const currentProdutos = filteredProdutos?.slice(startIndex, endIndex) || [];

  const filters = useMemo(() => {
    if (!produtos) return {
      marcas: [],
      fabricas: [],
      familia1: [],
      familia2: [],
      produtos: []
    };
    
    // Safely cast the arrays with type assertions
    const allProdutos = produtos as Produto[];
    
    return {
      marcas: Array.from(new Set(allProdutos.map(p => p.marca))).sort(),
      fabricas: Array.from(new Set(allProdutos.map(p => p.fabrica))).sort(),
      familia1: Array.from(new Set(allProdutos.map(p => p.familia1))).sort(),
      familia2: Array.from(new Set(allProdutos.map(p => p.familia2))).sort(),
      produtos: Array.from(new Set(allProdutos.map(p => p.produto))).sort()
    };
  }, [produtos]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[95%] mx-auto py-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 p-6">
            <div className="text-center py-8">
              <h1 className="text-2xl font-semibold mb-4">Login Required</h1>
              <p>Please log in to access the S&OP dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[95%] mx-auto py-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-red-100/50 p-6">
            <div className="text-red-600">Erro ao carregar dados: {(error as Error).message}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-[95%] mx-auto py-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-4 py-[3px]">
          <div className="flex justify-between items-center">
            <h1 className="uppercase text-black text-3xl font-normal">
              S&OP GRUPO CLASSIC
            </h1>
            <UserHeader />
          </div>
          
          <FilterSection 
            filters={filters}
            selectedMarcas={selectedMarcas}
            selectedFabricas={selectedFabricas}
            selectedFamilia1={selectedFamilia1}
            selectedFamilia2={selectedFamilia2}
            selectedProdutos={selectedProdutos}
            setSelectedMarcas={setSelectedMarcas}
            setSelectedFabricas={setSelectedFabricas}
            setSelectedFamilia1={setSelectedFamilia1}
            setSelectedFamilia2={setSelectedFamilia2}
            setSelectedProdutos={setSelectedProdutos}
          />
          
          <div className="mt-4">
            <p className="text-black">
              {filteredProdutos.length} Produtos Ativos | Página {currentPage} de {totalPages || 1}
            </p>
          </div>
        </div>
        
        <ProductList 
          products={currentProdutos} 
          isLoading={isLoading} 
        />

        <PaginationComponent 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Index;
