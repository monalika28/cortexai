import { Check, Copy, ExternalLink, Play, Code as CodeIcon, Eye, X } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Sandpack } from '@codesandbox/sandpack-react'

// Single Code Block with Code / Live Preview Tabs
function CodeBlock({ language, value }) {
  const [activeTab, setActiveTab] = useState('code') // 'code' | 'preview'
  const [copied, setCopied] = useState(false)

  const isPreviewable = ['jsx', 'javascript', 'js', 'tsx', 'react', 'html'].includes(language?.toLowerCase())

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Ensure safe App export format for Sandpack
  const getExecutableCode = (code) => {
    if (!code) return ''
    if (!code.includes('export default')) {
      return `${code}\n\nexport default App;`
    }
    return code
  }

  return (
    <div className='my-4 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-xl'>
      {/* Top Header Bar */}
      <div className='flex items-center justify-between bg-[#161b22] border-b border-white/10 px-4 py-2'>
        <div className='flex items-center gap-2'>
          <span className='uppercase text-xs font-semibold text-slate-400 tracking-wider'>
            {language || 'code'}
          </span>
          {isPreviewable && (
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' title='Live sandbox available' />
          )}
        </div>

        <div className='flex items-center gap-1.5'>
          {isPreviewable && (
            <div className='flex items-center bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.06] mr-2'>
              <button
                type='button'
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CodeIcon size={12} />
                Code
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={12} />
                Live Preview
              </button>
            </div>
          )}

          <button
            type='button'
            className='flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/[0.05]'
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={13} className='text-emerald-400' />
                <span className='text-emerald-400'>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body: Either Syntax Highlighter or Sandpack Live Runner */}
      {activeTab === 'preview' && isPreviewable ? (
        <div className='w-full bg-[#0d0f14] p-1'>
          <Sandpack
            template='react'
            theme='dark'
            files={{
              '/App.js': getExecutableCode(value),
            }}
            options={{
              showNavigator: false,
              showTabs: false,
              showLineNumbers: false,
              editorHeight: 380,
              classes: {
                'sp-wrapper': 'w-full !border-none',
                'sp-layout': '!bg-[#0d0f14] !border-none',
              },
            }}
            customSetup={{
              dependencies: {
                'lucide-react': 'latest',
              },
            }}
          />
        </div>
      ) : (
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={oneDark}
          wrapLongLines
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '16px',
            background: '#0d1117',
            fontSize: '13px',
          }}
        >
          {value}
        </SyntaxHighlighter>
      )}
    </div>
  )
}

function MessageBubble({ role, content, images }) {
  const isUser = role === 'user'
  const [lightBox, setLightBox] = useState(null)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`w-fit max-w-[92vw] md:max-w-[72%] px-4 py-2.5 rounded-2xl break-words overflow-hidden leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm'
            : 'text-slate-200 rounded-tl-sm'
        }`}
      >
        {images?.length > 0 && (
          <div className='flex flex-wrap gap-3 mt-4'>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setLightBox(img)}
                loading='lazy'
                onError={(e) => e.currentTarget.remove()}
                className='w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition'
                alt='attachment'
              />
            ))}
          </div>
        )}

        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className='text-2xl font-bold mt-5 mb-3'>{children}</h1>,
            h2: ({ children }) => <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>,
            h3: ({ children }) => <h3 className='text-lg font-semibold mt-3 mb-2'>{children}</h3>,
            p: ({ children }) => <p className='mb-3 whitespace-pre-wrap break-words'>{children}</p>,
            ul: ({ children }) => <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>,
            ol: ({ children }) => <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>,
            table: ({ children }) => (
              <div className='overflow-x-auto my-4'>
                <table className='min-w-full border border-white/10'>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className='border border-white/10 bg-white/5 px-3 py-2 text-left'>{children}</th>
            ),
            td: ({ children }) => (
              <td className='border border-white/10 px-3 py-2'>{children}</td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target='_blank'
                rel='noreferrer'
                className='text-indigo-400 underline inline-flex items-center gap-1'
              >
                {children}
                <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).trim()

              if (!className) {
                return (
                  <code className='px-1.5 py-0.5 rounded bg-white/10 text-indigo-200'>
                    {value}
                  </code>
                )
              }

              const language = className.replace('language-', '')
              return <CodeBlock language={language} value={value} />
            },
            img: ({ src }) => {
              if (!src) return null
              return (
                <img
                  src={src}
                  onClick={() => setLightBox(src)}
                  loading='lazy'
                  onError={(e) => e.currentTarget.remove()}
                  className='w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition'
                  alt='embedded'
                />
              )
            },
          }}
        >
          {content}
        </Markdown>
      </div>

      {lightBox && (
        <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6'>
          <button
            type='button'
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2'
            onClick={() => setLightBox(null)}
          >
            <X />
          </button>
          <img
            src={lightBox}
            alt='full view'
            className='max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain'
          />
        </div>
      )}
    </div>
  )
}

export default MessageBubble