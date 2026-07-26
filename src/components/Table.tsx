import { useState } from 'react'

interface Column<T> {
  key: keyof T
  id?: string
  header: string
  className?: string
  render?: (value: any, row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  getRowKey?: (row: T) => string | number
  bordered?: boolean
  striped?: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

export default function Table<T>({ columns, data, onRowClick, getRowKey, bordered = true, striped = true, pageSize = 10, onPageSizeChange }: TableProps<T>) {
  const getColumnId = (column: Column<T>) => column.id ?? String(column.key)

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map(c => getColumnId(c))))
  const [colvisOpen, setColvisOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredColumns = columns.filter(column => visibleColumns.has(getColumnId(column)))

  const filteredData = data.filter(row =>
    columns.some(column => {
      const value = row[column.key]
      return value !== undefined && String(value).toLowerCase().includes(search.toLowerCase())
    })
  )

  const toggleColumn = (id: string) => {
    const next = new Set(visibleColumns)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setVisibleColumns(next)
  }

  const getCsv = () => {
    const headers = filteredColumns.map(c => c.header).join(',')
    const rows = data.map(row => filteredColumns.map(c => String(row[c.key] ?? '')).join(',')).join('\n')
    return [headers, rows].join('\n')
  }

  const handleExport = (action: string) => {
    const csv = getCsv()
    if (action === 'copy') {
      navigator.clipboard.writeText(csv)
      alert('Copied to clipboard')
    } else if (action === 'csv') {
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
    setExportOpen(false)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="text-sm text-gray-700">
          <label>
            Show{' '}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="mx-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>All</option>
            </select>{' '}
            entries
          </label>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700">
            <label>
              Search:{" "}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </label>
          </div>

          <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center gap-1"
            >
              Export <i className="fas fa-caret-down"></i>
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-10 py-1">
                {['Copy', 'CSV'].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleExport(action.toLowerCase())}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setColvisOpen(!colvisOpen)}
              className="px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center gap-1"
            >
              Column visibility <i className="fas fa-caret-down"></i>
            </button>
            {colvisOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-10 p-2">
                {columns.map((column) => (
                  <label key={getColumnId(column)} className="flex items-center gap-2 py-1 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(getColumnId(column))}
                      onChange={() => toggleColumn(getColumnId(column))}
                    />
                    {column.header}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              {filteredColumns.map((column) => (
                <th
                  key={column.id ?? String(column.key)}
                  className={`px-4 py-2 border ${bordered ? 'border-gray-300' : 'border-b border-gray-200'} ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={getRowKey ? getRowKey(row) : index}
                onClick={() => onRowClick?.(row)}
                className={`${striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${onRowClick ? 'cursor-pointer hover:bg-gray-100' : 'hover:bg-gray-100'}`}
              >
                {filteredColumns.map((column) => (
                  <td
                    key={column.id ?? String(column.key)}
                    className={`px-4 py-2 whitespace-nowrap border ${bordered ? 'border-gray-300' : 'border-b border-gray-200'} ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] !== undefined ? row[column.key] : '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No data available
        </div>
      )}
    </div>
  )
}
