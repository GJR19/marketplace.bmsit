import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/common/AuthModal';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { supabase } from './lib/supabase';

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
  const { currentUser, startChatWithSeller, products } = useApp();

  const isLoggedIn = currentUser.id !== 'guest' && Boolean(currentUser.email) && currentUser.verified;

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

  // Guard restricted tabs for guests
  useEffect(() => {
    if (!isLoggedIn && ['sell', 'chats', 'wishlist', 'dashboard'].includes(activeTab)) {
      setActiveTab('home');
      setAuthModalOpen(true);
    }
  }, [activeTab, isLoggedIn]);

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

  // Modals & Auth Mode State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register' | 'forgot' | 'resetPassword'>('signin');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Helper to open auth modal in specific mode
  const handleOpenAuth = (mode: 'signin' | 'register' | 'forgot' | 'resetPassword' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Detect Supabase Password Recovery from URL or Auth State with explicit session recovery
  useEffect(() => {
    const checkRecovery = async () => {
      const href = window.location.href;
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      const isRecovery =
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        href.includes('type=recovery');

      // 1. If access_token exists anywhere in URL/hash, explicitly set session
      const accessTokenMatch = href.match(/access_token=([^&]+)/);
      const refreshTokenMatch = href.match(/refresh_token=([^&]+)/);
      if (accessTokenMatch) {
        const access_token = decodeURIComponent(accessTokenMatch[1]);
        const refresh_token = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : '';
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
        } catch (e) {
          console.warn('setSession from URL token error:', e);
        }
      }

      // 2. If code exists in URL (PKCE flow), exchange for session
      const codeMatch = href.match(/[?&]code=([^&]+)/);
      if (codeMatch) {
        const code = decodeURIComponent(codeMatch[1]);
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (e) {
          console.warn('exchangeCodeForSession error:', e);
        }
      }

      if (isRecovery || accessTokenMatch) {
        setAuthModalMode('resetPassword');
        setAuthModalOpen(true);
      }
    };

    checkRecovery();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (session) {
          try {
            await supabase.auth.setSession(session);
          } catch (e) {}
        }
        setAuthModalMode('resetPassword');
        setAuthModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Open Product Details Modal
  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  };

  // Open Sell Modal / Route with Auth Guard
  const handleOpenSell = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    setActiveTab('sell');
  };

  // Open Chat with a Seller directly from a product
  const handleOpenChatWithSeller = (product: Product, initialMessage?: string) => {
    if (!isLoggedIn) {
      setDetailModalOpen(false);
      setAuthModalOpen(true);
      return;
    }
    const convId = startChatWithSeller(product, initialMessage);
    setDetailModalOpen(false);
    setActiveChatId(convId);
    setActiveTab('chats'); // Opens direct student chats
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF5] text-[#1C1C1C] selection:bg-[#F2A93B] selection:text-[#1C1C1C] overflow-x-hidden w-full max-w-full">
      {/* Neo-brutalist Floating Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => handleOpenAuth('signin')}
        onOpenSellModal={handleOpenSell}
        onOpenProduct={handleOpenDetails}
        onSelectDashboardTab={(tab) => {
          setDashboardTab(tab);
          setActiveTab('dashboard');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onOpenDetails={handleOpenDetails}
            onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
            onOpenSellModal={handleOpenSell}
            onOpenAuth={() => handleOpenAuth('signin')}
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplacePage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onOpenDetails={handleOpenDetails}
            onOpenSellModal={handleOpenSell}
            onOpenWantedBoard={() => setActiveTab('wanted')}
          />
        )}

        {activeTab === 'wanted' && (
          <WantedBoardPage
            onOpenChat={(convId) => {
              if (convId) setActiveChatId(convId);
              setActiveTab('chats');
            }}
            onOpenAuth={() => handleOpenAuth('signin')}
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
            onOpenSellModal={handleOpenSell}
            onOpenProduct={handleOpenDetails}
            onOpenAuth={() => handleOpenAuth('signin')}
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
        onOpenAuth={() => handleOpenAuth('signin')}
      />

      {/* Auth & Personas Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthModalMode('signin');
        }}
        initialMode={authModalMode}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onOpenChatWithSeller={handleOpenChatWithSeller}
        onOpenProduct={handleOpenDetails}
        onOpenAuth={() => handleOpenAuth('signin')}
      />

      {/* Global Alerts & Toast Container (Rendered on top of modals & backdrops) */}
      <ToastContainer />
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
