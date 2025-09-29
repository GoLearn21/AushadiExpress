import { useState, useEffect } from "react";
import { Link } from "wouter";

export function ReceivingFAB() {
  const [isReceivingEnabled, setIsReceivingEnabled] = useState(false);

  useEffect(() => {
    // Check if receiving beta is enabled in settings
    const receivingEnabled = localStorage.getItem('enableReceivingBeta');
    setIsReceivingEnabled(receivingEnabled === 'true');
  }, []);

  // Don't render if receiving is not enabled
  if (!isReceivingEnabled) {
    return null;
  }

  return (
    <Link href="/receive-stock">
      <button 
        className="fixed bottom-36 right-4 w-12 h-12 bg-blue-600 text-white rounded-full elevation-2 hover:elevation-3 transition-all duration-200 flex items-center justify-center"
        data-testid="fab-receiving"
        title="Receive Stock"
      >
        <span className="material-icons">inbox</span>
      </button>
    </Link>
  );
}