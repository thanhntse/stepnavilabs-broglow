import React from 'react';
import { useLanguage } from '@/context/language-context';
import { ShoppingCart, Package } from '@phosphor-icons/react/dist/ssr';
import SafeImage from '@/components/safe-image';

interface Product {
  _id: string;
  name: string;
  brand: string;
  imageUrl: string;
  shopeeUrl: string;
  description: string;
  price: number;
  categories: string[];
  benefits: string[];
}

interface ProductRecommendationsProps {
  products: Product[];
  isLoading: boolean;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ products, isLoading }) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 mb-6 mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Package size={18} className="text-primary-blue" />
          <div className="font-semibold text-gray-700">{t('products.recommendationsLoading')}</div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[200px] bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mb-6 mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Package size={18} className="text-primary-blue" />
        <div className="font-semibold text-gray-700">{t('products.recommendedForYou')}</div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {products.map((product) => (
          <div
            key={product._id}
            className="min-w-[200px] max-w-[200px] bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative w-full h-32 mb-3 bg-gray-50 rounded-md overflow-hidden">
              {product.imageUrl ? (
                <SafeImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  fallbackComponent={
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package size={32} />
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={32} />
                </div>
              )}
            </div>
            <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
            {product.price && (
              <p className="text-sm font-semibold text-primary-blue">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </p>
            )}
            {product.shopeeUrl && (
              <a
                href={product.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs bg-primary-blue text-white px-3 py-1.5 rounded-full inline-flex items-center gap-1 hover:bg-primary-darkblue transition-colors"
              >
                <ShoppingCart size={12} />
                {t('products.buyNow')}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
