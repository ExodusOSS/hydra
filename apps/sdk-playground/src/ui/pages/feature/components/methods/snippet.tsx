import Button from '@/ui/components/button'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

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

  if (!snippet) {
    return null
  }

  const { code, language } = snippet
  return (
    <div
      className="flex flex-col  p-4"
      style={{ backgroundColor: docco.hljs.background as string }}
    >
      <Button
        type="button"
        className="self-end bg-transparent p-0 text-xs text-primary"
        onClick={() => copy(code)}
      >
        Copy
      </Button>

      <SyntaxHighlighter
        language={language}
        style={docco}
        wrapLines
        wrapLongLines
        customStyle={{ fontSize: 16 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
