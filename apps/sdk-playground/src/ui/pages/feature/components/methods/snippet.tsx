import Button from '@/ui/components/button'
import Icon from '@/ui/components/icon'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

type SnippetData = {
  language: string
  code: string
}

function parse(snippet: string): SnippetData | null {
  const codeBlockRegex = /```(\w+)?\n([\S\s]*?)```/u
  const match = snippet.match(codeBlockRegex)

  if (!match) {
    return null
  }

  return {
    language: match[1] || 'typescript',
    code: match[2].trim(),
  }
}

function copy(code: string) {
  void navigator.clipboard.writeText(code)
}

/**
 * Parses and renders a given markdown snippet
 */
export default function Snippet({ children }) {
  const snippet = parse(children)

  if (!snippet) return null

  const { code, language } = snippet

  return (
    <div className="group relative flex flex-col  p-4">
      <Button
        type="button"
        variant="tertiary"
        className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => copy(code)}
      >
        <Icon name="copy" className="text-slate-600" size={14} />
      </Button>

      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        wrapLines
        wrapLongLines
        customStyle={{ fontSize: 13, padding: 0, background: 'transparent' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
