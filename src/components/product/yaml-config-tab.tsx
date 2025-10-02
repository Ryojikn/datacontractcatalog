import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { dump } from 'js-yaml'
import { Button } from '@/components/ui'
import { Copy, Check } from 'lucide-react'
import type { DataProduct } from '@/types'

interface YamlConfigTabProps {
  product: DataProduct
}

// Helper function to safely get nested values from config object
function getConfigValue(config: Record<string, unknown>, path: string): string | null {
  const keys = path.split('.')
  let current: unknown = config
  
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return null
    }
  }
  
  return typeof current === 'string' ? current : null
}

export function YamlConfigTab({ product }: YamlConfigTabProps) {
  const [copied, setCopied] = useState(false)

  // Convert JSON to YAML format
  const yamlContent = dump(product.configJson, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Detect theme from CSS variables or use system preference
  const isDarkMode = document.documentElement.classList.contains('dark')

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">YAML Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Product configuration in YAML format
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <SyntaxHighlighter
          language="yaml"
          style={isDarkMode ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDarkMode ? '#6b7280' : '#9ca3af',
            borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            marginRight: '1em'
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {yamlContent}
        </SyntaxHighlighter>
      </div>

      {/* Configuration summary */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {getConfigValue(product.configJson, 'source.type') && (
            <div>
              <span className="font-medium">Source:</span> {getConfigValue(product.configJson, 'source.type')}
            </div>
          )}
          {getConfigValue(product.configJson, 'target.type') && (
            <div>
              <span className="font-medium">Target:</span> {getConfigValue(product.configJson, 'target.type')}
            </div>
          )}
          {getConfigValue(product.configJson, 'schedule.frequency') && (
            <div>
              <span className="font-medium">Schedule:</span> {getConfigValue(product.configJson, 'schedule.frequency')}
            </div>
          )}
          {product.technology && (
            <div>
              <span className="font-medium">Technology:</span> {product.technology}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}