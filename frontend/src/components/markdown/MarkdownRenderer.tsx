import { useTheme } from '../../hooks/useTheme'
import MDEditor from '@uiw/react-md-editor'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string;
}

interface CodeComponentProps {
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const { theme } = useTheme()

  return (
    <div 
      data-color-mode={theme === 'dark' ? 'dark' : 'light'}
      style={{ 
        backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
        color: theme === 'dark' ? 'hsl(var(--foreground))' : '#000'
      }}
      className="markdown-body"
    >
      <MDEditor.Markdown 
        source={content}
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: '1rem',
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[]}
        components={{
          img: (props) => {
            const isError = props.alt === 'Error';
            return (
              <span style={{ 
                display: 'block', 
                backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
                background: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
                margin: '0.3em 0',
                textAlign: 'left'
              }}>
                {isError ? props.alt : (
                  <img 
                    {...props} 
                    alt={props.alt || ''}
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff',
                      maxWidth: '100%',
                      display: 'block'
                    }} 
                  />
                )}
              </span>
            )
          },
          table: (props) => (
            <div style={{ 
              backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff'
            }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#fff'
              }}>
                <style>
                  {`
                    th, td {
                      background-color: ${theme === 'dark' ? 'hsl(var(--card))' : '#fff'} !important;
                      color: ${theme === 'dark' ? 'hsl(var(--foreground))' : '#000'};
                    }
                    th {
                      font-weight: 600;
                      background-color: ${theme === 'dark' ? 'hsl(var(--secondary))' : '#f6f8fa'} !important;
                    }
                  `}
                </style>
                {props.children}
              </table>
            </div>
          ),
          code: (props: CodeComponentProps & { children?: React.ReactNode }) => {
            const { inline, children, className } = props;
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <pre style={{ 
                backgroundColor: theme === 'dark' ? 'hsl(var(--secondary))' : '#f6f8fa',
                color: theme === 'dark' ? 'hsl(var(--foreground))' : '#000',
                padding: '1em',
                margin: '1em 0'
              }}>
                <code className={className}>
                  {children}
                </code>
              </pre>
            ) : (
              <code 
                className={className}
                style={{
                  backgroundColor: theme === 'dark' ? 'hsl(var(--secondary))' : '#f6f8fa',
                  padding: '0.2em 0.4em',
                  borderRadius: '4px'
                }}
              >
                {children}
              </code>
            )
          },
          ul: (props) => (
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '2em',
              marginTop: '1em',
              marginBottom: '1em'
            }}>
              {props.children}
            </ul>
          ),
          ol: (props) => (
            <div className="markdown-ordered-list">
              <ol style={{
                listStyle: 'decimal',
                paddingInlineStart: '2em',
                marginBlockStart: '1em',
                marginBlockEnd: '1em',
                counterReset: 'section'
              }}>
                {props.children}
              </ol>
            </div>
          ),
          li: (props) => (
            <li style={{
              marginTop: '0.5em',
              marginBottom: '0.5em',
              display: 'list-item',
              counterIncrement: 'section'
            }}>
              {props.children}
            </li>
          )
        }}
      />
    </div>
  )
} 