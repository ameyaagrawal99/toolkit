import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface EmbedLayoutProps {
  children: React.ReactNode;
  showBadge?: boolean;
}

const EmbedLayout = ({ children, showBadge = true }: EmbedLayoutProps) => {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme');
  const compact = searchParams.get('compact') === 'true';
  const hideBadge = searchParams.get('hidebadge') === 'true';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background ${compact ? 'p-1' : 'p-0'}`}>
      <div className="w-full h-full">
        {children}
      </div>
      
      {showBadge && !hideBadge && (
        <div className="fixed bottom-2 right-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <a 
            href="https://toolvault.lovable.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Powered by ToolVault
          </a>
        </div>
      )}
    </div>
  );
};

export default EmbedLayout;
