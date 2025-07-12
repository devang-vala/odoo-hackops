import React from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Toolbar({ editor, setShowEmojiPicker, imageInputRef }) {
  if (!editor) {
    return null;
  }

  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-wrap gap-0.5 border-b-2 border-gray-200 p-1 bg-gray-50">
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={editor.isActive('link') ? 'default' : 'ghost'}
        onClick={() => {
          const url = window.prompt('URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          } else if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          }
        }}
        className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      {/* Text align buttons */}
      <div className="flex border-l-2 border-gray-200 ml-1 pl-1">
        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Media buttons */}
      <div className="flex border-l-2 border-gray-200 ml-1 pl-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={triggerImageUpload}
          className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="p-1 h-8 w-8 hover:bg-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all"
          title="Add Emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}