import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';

// Create a React component for the delete button
const ImageDeleteButton = ({ editor, getPos }) => {
  const handleDelete = () => {
    // Delete the node at the current position
    editor.chain().focus().deleteRange({ from: getPos(), to: getPos() + 1 }).run();
  };

  return (
    <div className="absolute top-0 right-0 bg-black bg-opacity-50 rounded-bl-md p-1 cursor-pointer">
      <button 
        onClick={handleDelete}
        className="text-white hover:text-red-500 transition-colors"
        aria-label="Delete image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

// Custom Image extension
export const CustomImage = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageDelete'),
        props: {
          decorations(state) {
            // Find all image nodes in the document
            const decorations = [];
            const { doc, selection } = state;
            
            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                const deleteButton = document.createElement('div');
                deleteButton.className = 'image-delete-button';
                
                // Create and position the delete button
                decorations.push({
                  from: pos,
                  to: pos + 1,
                  node: deleteButton,
                });
              }
            });
            
            return decorations;
          },
        },
      }),
    ];
  },
  addNodeView() {
    return ({ editor, node, getPos }) => {
      const dom = document.createElement('div');
      dom.classList.add('image-wrapper', 'relative', 'inline-block');

      // Create the actual image element
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.title = node.attrs.title || '';
      img.className = node.attrs.class || 'rounded-md max-w-full h-auto';
      
      dom.appendChild(img);
      
      // Add delete button with tippy.js
      const deleteButton = document.createElement('div');
      
      const tippyInstance = tippy(dom, {
        content: deleteButton,
        appendTo: () => document.body,
        trigger: 'mouseenter',
        placement: 'top-end',
        arrow: false,
        offset: [0, 0],
        hideOnClick: false,
        interactive: true,
        theme: 'light',
        getReferenceClientRect: () => dom.getBoundingClientRect(),
        render(instance) {
          const popper = document.createElement('div');
          popper.className = 'tippy-box';
          
          // Render our React component into the popper
          const deleteButtonReact = new ReactRenderer(ImageDeleteButton, {
            props: {
              editor,
              getPos,
            },
            editor,
          });
          
          popper.appendChild(deleteButtonReact.element);
          
          return {
            popper,
            onDestroy() {
              deleteButtonReact.destroy();
            },
          };
        },
      });
      
      return {
        dom,
        destroy() {
          tippyInstance.destroy();
        },
      };
    };
  },
});