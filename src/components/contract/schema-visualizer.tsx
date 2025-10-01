import React from 'react';
import type { TableSchema, Column } from '../../types';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui';

interface SchemaVisualizerProps {
  schema: TableSchema;
  className?: string;
}

interface ColumnRowProps {
  column: Column;
  dictionary: Record<string, string>;
}

const ColumnRow: React.FC<ColumnRowProps> = ({ column, dictionary }) => {
  const isPrimaryKey = column.primaryKey;
  const hasForeignKey = column.foreignKey;
  const description = dictionary[column.name] || column.description;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <tr className="border-b border-border hover:bg-muted/50 cursor-help transition-colors">
            <td className="px-4 py-3 font-medium">
              <div className="flex items-center gap-2">
                <span className={isPrimaryKey ? 'text-primary font-semibold' : ''}>
                  {column.name}
                </span>
                {isPrimaryKey && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                    PK
                  </span>
                )}
                {hasForeignKey && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-secondary-foreground bg-secondary rounded-full">
                    FK
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {column.type}
            </td>
            <td className="px-4 py-3 text-center">
              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                column.nullable 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {column.nullable ? 'N' : 'R'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground">
              {column.constraints && column.constraints.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {column.constraints.map((constraint, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-muted rounded-md"
                    >
                      {constraint}
                    </span>
                  ))}
                </div>
              )}
            </td>
          </tr>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="bottom" className="max-w-md">
            <div className="space-y-1">
              <p className="font-medium">{column.name}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
              {hasForeignKey && (
                <p className="text-xs text-muted-foreground">
                  References: {column.foreignKey}
                </p>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ 
  schema, 
  className = '' 
}) => {
  if (!schema || !schema.columns || schema.columns.length === 0) {
    return (
      <div className={`p-6 border border-border rounded-lg bg-card ${className}`}>
        <div className="text-center text-muted-foreground">
          <p>No schema information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-border rounded-lg bg-card overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-md">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{schema.tableName}</h3>
            <p className="text-sm text-muted-foreground">
              {schema.columns.length} column{schema.columns.length !== 1 ? 's' : ''}
              {schema.primaryKeys && schema.primaryKeys.length > 0 && (
                <span className="ml-2">
                  • {schema.primaryKeys.length} primary key{schema.primaryKeys.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Schema Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Column Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Data Type
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Nullable
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Constraints
              </th>
            </tr>
          </thead>
          <tbody>
            {schema.columns.map((column, index) => (
              <ColumnRow 
                key={`${column.name}-${index}`}
                column={column}
                dictionary={schema.dictionary}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-primary-foreground bg-primary rounded-full">
              PK
            </span>
            <span>Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-secondary-foreground bg-secondary rounded-full">
              FK
            </span>
            <span>Foreign Key</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              R
            </span>
            <span>Required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              N
            </span>
            <span>Nullable</span>
          </div>
          <div className="text-muted-foreground">
            Hover over columns for detailed descriptions
          </div>
        </div>
      </div>
    </div>
  );
};