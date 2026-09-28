import React, { useState, useEffect } from 'react';
import { ToastProvider, LoadingState } from './packages/ui';
import { AuthProvider, useAuth } from './apps/shared/AuthContext';
import { Navbar } from './apps/shared/Navbar';
import { Footer } from './apps/shared/Footer';
import { HomePage } from './apps/catalogue/HomePage';
import { ComponentsPage } from './apps/catalogue/ComponentsPage';
import { ComponentDetailPage } from './apps/catalogue/ComponentDetailPage';
import { DocsGettingStartedPage } from './apps/catalogue/DocsGettingStartedPage';
import { LoginPage } from './apps/catalogue/LoginPage';
import { AccountPage } from './apps/catalogue/AccountPage';
import { AdminDashboard } from './apps/admin/AdminDashboard';
import { AdminComponentsList } from './apps/admin/AdminComponentsList';
import { AdminComponentEditor } from './apps/admin/AdminComponentEditor';
import { AdminCustomers } from './apps/admin/AdminCustomers';
import { ComponentSummary } from './packages/types';

function AppContent() {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [components, setComponents] = useState<ComponentSummary[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(true);

  // Sync with browser history back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const loadCatalogue = async () => {
    try {
      const res = await fetch('/api/components');
      if (res.ok) {
        const data = await res.json();
        setComponents(data.components);
      }
    } catch (err) {
      console.error('Failed to load catalogue components:', err);
    } finally {
      setLoadingComponents(false);
    }
  };

  useEffect(() => {
    loadCatalogue();
  }, [currentPath]);

  // Route matching
  const renderCurrentView = () => {
    // 1. Home Route: /
    if (currentPath === '/') {
      return (
        <HomePage
          components={components}
          onNavigate={navigate}
          onSelectComponent={(slug) => navigate(`/components/${slug}`)}
        />
      );
    }

    // 2. Components Listing: /components
    if (currentPath === '/components') {
      return (
        <ComponentsPage
          components={components}
          onSelectComponent={(slug) => navigate(`/components/${slug}`)}
        />
      );
    }

    // 3. Component Detail: /components/:slug
    if (currentPath.startsWith('/components/')) {
      const slug = currentPath.replace('/components/', '').split('/')[0];
      return (
        <ComponentDetailPage
          slug={slug}
          onBack={() => navigate('/components')}
          onLoginClick={() => navigate('/login')}
        />
      );
    }

    // 4. Getting Started Docs: /docs/getting-started
    if (currentPath.startsWith('/docs')) {
      return <DocsGettingStartedPage onNavigate={navigate} />;
    }

    // 5. Login: /login
    if (currentPath === '/login') {
      return <LoginPage onSuccess={() => navigate('/account')} onNavigate={navigate} />;
    }

    // 6. Account: /account
    if (currentPath === '/account') {
      return <AccountPage onNavigate={navigate} />;
    }

    // 7. Admin Routes
    if (currentPath === '/admin') {
      return (
        <AdminDashboard
          onNavigate={navigate}
          onEditComponent={(id) => navigate(`/admin/components/${id}`)}
        />
      );
    }

    if (currentPath === '/admin/components') {
      return (
        <AdminComponentsList
          onNavigate={navigate}
          onEditComponent={(id) => navigate(`/admin/components/${id}`)}
          onViewComponentPublic={(slug) => navigate(`/components/${slug}`)}
        />
      );
    }

    if (currentPath === '/admin/components/new') {
      return (
        <AdminComponentEditor
          onBack={() => navigate('/admin/components')}
          onSaved={() => {
            loadCatalogue();
            navigate('/admin/components');
          }}
        />
      );
    }

    if (currentPath.startsWith('/admin/components/')) {
      const compId = currentPath.replace('/admin/components/', '');
      return (
        <AdminComponentEditor
          componentId={compId}
          onBack={() => navigate('/admin/components')}
          onSaved={() => {
            loadCatalogue();
            navigate('/admin/components');
          }}
        />
      );
    }

    if (currentPath === '/admin/customers') {
      return <AdminCustomers onNavigate={navigate} />;
    }

    // Fallback: 404
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#FFFFFF]">404 — Route Not Found</h2>
        <p className="text-xs text-[#8A8A8A]">The requested path does not exist in the catalogue.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F5F5F5]">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {renderCurrentView()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
