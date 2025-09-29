// Category selector for document capture
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  selected: 'invoice' | 'prescription' | 'bill';
  onSelect: (category: 'invoice' | 'prescription' | 'bill') => void;
  className?: string;
}

const categories = [
  { 
    id: 'invoice' as const, 
    label: 'Invoice', 
    icon: '📄',
    description: 'Supplier invoices & bills'
  },
  { 
    id: 'prescription' as const, 
    label: 'Prescription', 
    icon: '💊',
    description: 'Medical prescriptions'
  },
  { 
    id: 'bill' as const, 
    label: 'Bill', 
    icon: '🧾',
    description: 'Purchase receipts'
  }
];

export function CategorySelector({ selected, onSelect, className }: CategorySelectorProps) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Document Type
      </div>
      
      <div className="flex space-x-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              'flex-1 flex flex-col items-center p-3 rounded-lg border transition-all',
              'text-sm font-medium',
              selected === category.id
                ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-100'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
            data-testid={`category-${category.id}`}
          >
            <span className="text-2xl mb-1">{category.icon}</span>
            <span className="font-medium">{category.label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {category.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}