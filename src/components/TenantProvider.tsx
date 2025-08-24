import { createContext, useContext, ReactNode } from 'react';
import { useTenant, type TenantContext } from '@/hooks/useTenant';

const TenantContextProvider = createContext<TenantContext & {
  detectTenant: () => void;
  getTenantUrl: (tenantId: string) => Promise<string | null>;
  updateBranding: (tenantId: string, branding: any) => Promise<void>;
} | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const tenant = useTenant();

  // Apply branding styles dynamically
  if (tenant.branding) {
    document.documentElement.style.setProperty('--primary', tenant.branding.primary_color);
    document.documentElement.style.setProperty('--secondary', tenant.branding.secondary_color);
    document.documentElement.style.setProperty('--accent', tenant.branding.accent_color);
    
    if (tenant.branding.custom_css) {
      // Inject custom CSS
      const existingStyle = document.getElementById('tenant-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = 'tenant-custom-css';
      style.textContent = tenant.branding.custom_css;
      document.head.appendChild(style);
    }

    // Update favicon
    if (tenant.branding.favicon_url) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = tenant.branding.favicon_url;
      }
    }
  }

  return (
    <TenantContextProvider.Provider value={tenant}>
      {children}
    </TenantContextProvider.Provider>
  );
};

export const useTenantContext = () => {
  const context = useContext(TenantContextProvider);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};