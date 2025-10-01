import { useState } from 'react'
import { Button } from '@/components/ui'
import type { DataProduct } from '@/types'

interface YamlConfigTabProps {
  product: DataProduct
}

export function YamlConfigTab({ product }: YamlConfigTabProps) {
  const [copied, setCopied] = useState(false)

  const yamlContent = JSON.stringify(product.configJson, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">YAML Configuration</h2>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      
      <div className="bg-muted rounded p-4 overflow-auto max-h-96">
        <pre className="text-sm">
          <code>{yamlContent}</code>
        </pre>
      </div>
    </div>
  )
}