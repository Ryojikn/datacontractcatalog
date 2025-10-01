import type { TableSchema } from '@/types'

interface SchemaVisualizerProps {
  schema: TableSchema
}

export function SchemaVisualizer({ schema }: SchemaVisualizerProps) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-xl font-semibold mb-4">Schema: {schema.tableName}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Column</th>
              <th className="text-left p-2 font-medium">Type</th>
              <th className="text-left p-2 font-medium">Nullable</th>
              <th className="text-left p-2 font-medium">Constraints</th>
            </tr>
          </thead>
          <tbody>
            {schema.columns.map((column) => (
              <tr key={column.name} className="border-b hover:bg-muted/50">
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{column.name}</span>
                    {column.primaryKey && (
                      <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">PK</span>
                    )}
                    {column.foreignKey && (
                      <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">FK</span>
                    )}
                  </div>
                  {column.description && (
                    <p className="text-xs text-muted-foreground mt-1">{column.description}</p>
                  )}
                </td>
                <td className="p-2 text-sm">{column.type}</td>
                <td className="p-2 text-sm">{column.nullable ? 'Yes' : 'No'}</td>
                <td className="p-2 text-sm">
                  {column.constraints?.join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}