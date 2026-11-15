import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/common/AuthModal';
import { ProductDetailModal } from './components/product/ProductDetailModal';

import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { WantedBoardPage } from './pages/WantedBoardPage';
import { SellItemPage } from './pages/SellItemPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { WishlistPage } from './pages/WishlistPage';
import { ChatsPage } from './pages/ChatsPage';
import { TermsAndRulesPage } from './pages/TermsAndRulesPage';

import { Product, ProductCategory } from './types';

const MainApp: React.FC = () => {
  const { startChatWithSeller, products } = useApp();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [dashboardTab, setDashboardTab] = useState<'postings' | 'wanted' | 'settings'>('postings');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

  // Always open every page from the starting top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Direct access to secret admin route /ishowspeed
  useEffect(() => {
    if (window.location.pathname.toLowerCase().includes('/ishowspeed')) {
      setActiveTab('admin');
    }
  }, []);

  // Deep-link direct product opening from shared links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('product');
    if (prodId && products.length > 0) {
      const found = products.find((p) => p.id === prodId);
      if (found) {
        setSelectedProduct(found);
        setDetailModalOpen(true);
      }
    }
  }, [products]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Open Product Details Modal
  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  // Open Chat with a Seller directly from a product
  const handleOpenChatWithSeller = (product: Product, initialMessage?: string) => {
    const convId = startChatWithSeller(product, initialMessage);
    setDetailModalOpen(false);
    setActiveChatId(convId);
    setActiveTab('chats'); // Opens direct student chats
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF5] text-[#1C1C1C] selection:bg-[#F2A93B] selection:text-[#1C1C1C]">
      {/* Neo-brutalist Floating Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSellModal={() => setActiveTab('sell')}
        onOpenProduct={handleOpenDetails}
        onSelectDashboardTab={(tab) => {
          setDashboardTab(tab);
          setActiveTab('dashboard');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onOpenDetails={handleOpenDetails}
            onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
            onOpenSellModal={() => setActiveTab('sell')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplacePage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onOpenDetails={handleOpenDetails}
            onOpenSellModal={() => setActiveTab('sell')}
            onOpenWantedBoard={() => setActiveTab('wanted')}
          />
        )}

        {activeTab === 'wanted' && (
          <WantedBoardPage
            onOpenChat={(convId) => {
              if (convId) setActiveChatId(convId);
              setActiveTab('chats');
            }}
          />
        )}

        {activeTab === 'sell' && (
          <SellItemPage
            onSuccessRedirect={() => setActiveTab('dashboard')}
            onCancel={() => setActiveTab('marketplace')}
          />
        )}

        {activeTab === 'chats' && (
          <ChatsPage
            initialConversationId={activeChatId}
            onOpenProduct={handleOpenDetails}
            onExploreMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPage
            onOpenDetails={handleOpenDetails}
            onBrowseMarketplace={() => setActiveTab('marketplace')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            initialTab={dashboardTab}
            onTabChange={setDashboardTab}
            onOpenSellModal={() => setActiveTab('sell')}
            onOpenProduct={handleOpenDetails}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage onOpenProductDetails={handleOpenDetails} />
        )}

        {activeTab === 'terms' && (
          <TermsAndRulesPage onBackToMarketplace={() => setActiveTab('marketplace')} />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Global Alerts & Toast Container */}
      <ToastContainer />

      {/* Auth & Personas Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onOpenChatWithSeller={handleOpenChatWithSeller}
        onOpenProduct={handleOpenDetails}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
