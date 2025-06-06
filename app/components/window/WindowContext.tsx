import { createContext, useContext, useEffect, useState } from 'react';
import { Titlebar, TitlebarProps } from './Titlebar';
import { TitlebarContextProvider } from './TitlebarContext';
import { usePersistedState } from '@/app/lib/persistance';

const WindowContext = createContext<WindowContextProps | undefined>(undefined);

function usePage(page: Page): [Page, (page: Page) => void] {
  const [currentPage, setCurrentPage] = usePersistedState('window-page', page);
  const setPage = (page: Page) => {
    setCurrentPage(page);
  };
  return [currentPage as Page, setPage];
}

export const WindowContextProvider = ({ children, titlebar }: WindowContextProviderProps) => {
  const [initProps, setInitProps] = useState<WindowInitProps | undefined>();
  const [page, setPage] = usePage('chat');

  const defaultTitlebar: TitlebarProps = {
    title: 'Electron React App',
    icon: 'appIcon.png',
    titleCentered: false,
    menuItems: [],
  };

  // Merge default titlebar props with user defined props
  titlebar = { ...defaultTitlebar, ...titlebar };

  useEffect(() => {
    // Load window init props
    window.api.invoke('init-window').then((value: WindowInitProps) => setInitProps(value));

    // Add class to parent element
    const parent = document.querySelector('.window-content')?.parentElement;
    if (parent) {
      parent.classList.add('window-frame');
    }
  }, []);

  return (
    <WindowContext.Provider value={{ titlebar, window: initProps!, navigation: { page, setPage } }}>
      <TitlebarContextProvider>
        <Titlebar />
      </TitlebarContextProvider>
      <WindowContent>{children}</WindowContent>
    </WindowContext.Provider>
  );
};

const WindowContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="window-content">{children}</div>;
};

export const useWindowContext = () => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindowContext must be used within a WindowContextProvider');
  }
  return context;
};

interface WindowContextProps {
  titlebar: TitlebarProps;
  readonly window: WindowInitProps;
  readonly navigation: WindowNavigationProps;
}

interface WindowInitProps {
  width: number;
  height: number;
  maximizable: boolean;
  minimizable: boolean;
  platform: string;
}

export type Page = 'chat' | 'settings';

interface WindowNavigationProps {
  page: Page;
  setPage: (page: Page) => void;
}

interface WindowContextProviderProps {
  children: React.ReactNode;
  titlebar?: TitlebarProps;
}
