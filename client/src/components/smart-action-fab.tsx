import { useLocation } from 'wouter';

interface SmartActionFABProps {
  onAssistantOpen?: () => void;
}

export function SmartActionFAB({ onAssistantOpen }: SmartActionFABProps) {
  const [, setLocation] = useLocation();

  // Handle click to open AI assistant in full screen
  const handleClick = () => {
    setLocation('/ai-assistant');
    if (onAssistantOpen) {
      onAssistantOpen();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-105"
        onClick={handleClick}
        data-testid="ai-chat-fab"
        title="AI Assistant - Upload bills, prescriptions & invoices"
      >
        {/* Human with brain icon */}
        <span className="material-icons text-2xl">psychology</span>
        
        {/* Upload indicator */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="material-icons text-xs text-white">upload</span>
        </div>
        
        {/* Pulse animation for attention */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse opacity-75"></div>
      </button>
    </div>
  );
}