import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  QueueListIcon as ListOrderedIcon,
  ArrowLeftIcon as TextAlignLeftIcon,
  ArrowsRightLeftIcon as TextAlignCenterIcon,
  ArrowRightIcon as TextAlignRightIcon,
  LinkIcon,
  PhotoIcon as ImageIcon,
  TableCellsIcon as TableIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ToolbarItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  isActive?: boolean;
  onClick: () => void;
}

export default function EditorToolbar() {
  const [activeStyles, setActiveStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    if (activeStyles.includes(style)) {
      setActiveStyles(activeStyles.filter(s => s !== style));
    } else {
      setActiveStyles([...activeStyles, style]);
    }
    
    // Here we would apply the formatting to the selected text in the editor
    // This is a placeholder for actual text formatting implementation
    document.execCommand(style.toLowerCase());
  };

  const textStyles: ToolbarItem[] = [
    {
      icon: BoldIcon,
      name: 'Bold',
      isActive: activeStyles.includes('Bold'),
      onClick: () => toggleStyle('Bold'),
    },
    {
      icon: ItalicIcon,
      name: 'Italic',
      isActive: activeStyles.includes('Italic'),
      onClick: () => toggleStyle('Italic'),
    },
    {
      icon: UnderlineIcon,
      name: 'Underline',
      isActive: activeStyles.includes('Underline'),
      onClick: () => toggleStyle('Underline'),
    },
  ];

  const alignmentStyles: ToolbarItem[] = [
    {
      icon: TextAlignLeftIcon,
      name: 'Align Left',
      isActive: activeStyles.includes('AlignLeft'),
      onClick: () => toggleStyle('AlignLeft'),
    },
    {
      icon: TextAlignCenterIcon,
      name: 'Align Center',
      isActive: activeStyles.includes('AlignCenter'),
      onClick: () => toggleStyle('AlignCenter'),
    },
    {
      icon: TextAlignRightIcon,
      name: 'Align Right',
      isActive: activeStyles.includes('AlignRight'),
      onClick: () => toggleStyle('AlignRight'),
    },
  ];

  const listStyles: ToolbarItem[] = [
    {
      icon: ListBulletIcon,
      name: 'Bullet List',
      isActive: activeStyles.includes('BulletList'),
      onClick: () => toggleStyle('BulletList'),
    },
    {
      icon: ListOrderedIcon,
      name: 'Numbered List',
      isActive: activeStyles.includes('NumberedList'),
      onClick: () => toggleStyle('NumberedList'),
    },
  ];

  const insertionItems: ToolbarItem[] = [
    {
      icon: LinkIcon,
      name: 'Insert Link',
      onClick: () => {
        const url = prompt('Enter link URL:');
        if (url) {
          // Insert link logic
        }
      },
    },
    {
      icon: ImageIcon,
      name: 'Insert Image',
      onClick: () => {
        const url = prompt('Enter image URL:');
        if (url) {
          // Insert image logic
        }
      },
    },
    {
      icon: TableIcon,
      name: 'Insert Table',
      onClick: () => {
        // Insert table logic
      },
    },
  ];

  const renderToolbarItems = (items: ToolbarItem[]) => {
    return items.map((item) => (
      <button
        key={item.name}
        type="button"
        className={`p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          item.isActive ? 'bg-neutral-100 text-neutral-700' : ''
        }`}
        onClick={item.onClick}
        title={item.name}
      >
        <item.icon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{item.name}</span>
      </button>
    ));
  };

  return (
    <div className="border-b border-neutral-200 px-4 py-2 bg-neutral-50">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {renderToolbarItems(textStyles)}
        </div>
        
        <div className="h-6 border-r border-neutral-200 mx-1" />
        
        <div className="flex items-center space-x-1">
          {renderToolbarItems(alignmentStyles)}
        </div>
        
        <div className="h-6 border-r border-neutral-200 mx-1" />
        
        <div className="flex items-center space-x-1">
          {renderToolbarItems(listStyles)}
        </div>
        
        <div className="h-6 border-r border-neutral-200 mx-1" />
        
        <div className="flex items-center space-x-1">
          {renderToolbarItems(insertionItems)}
        </div>
      </div>
    </div>
  );
}
