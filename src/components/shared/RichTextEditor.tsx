

// FIX: Import React to provide the 'React' namespace for types like 'React.ReactNode'.
import React, { useRef, type FC } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };
  
  const createLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };
  
  const ToolbarButton: FC<{ onClick: () => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="px-3 py-1 border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="flex items-center space-x-2 p-2 border border-b-0 border-gray-300 rounded-t-md bg-gray-50 flex-wrap gap-y-2">
        <ToolbarButton onClick={() => applyFormat('bold')} title="Bold"><b>B</b></ToolbarButton>
        <ToolbarButton onClick={() => applyFormat('italic')} title="Italic"><i>I</i></ToolbarButton>
        <ToolbarButton onClick={createLink} title="Hyperlink">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => applyFormat('formatBlock', '<h2>')} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => applyFormat('formatBlock', '<h3>')} title="Heading 3">H3</ToolbarButton>
        <ToolbarButton onClick={() => applyFormat('formatBlock', '<h4>')} title="Heading 4">H4</ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
        aria-label="Rich text editor"
      />
    </div>
  );
};

export default RichTextEditor;
