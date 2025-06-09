import Markdown from 'react-markdown';

interface MDProps {
  children: string;
}

export const MD = ({ children }: MDProps): React.JSX.Element => {
  return (
    <Markdown
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mb-1">{children}</h3>,
        p: ({ children }) => <p className="my-1">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => <code className="bg-gray-100 p-1 rounded">{children}</code>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 pl-4 italic text-gray-600 mb-2">{children}</blockquote>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        a: ({ children, href }) => (
          <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </Markdown>
  );
};
