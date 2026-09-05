// Simple reusable list-view table. columns: [{ key, label }]
export default function DataTable({ columns, rows, onRowClick }) {
  return (
    <div className="w-full border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
      <table className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs">
        <thead className="bg-gray-50 dark:bg-gray-800/60 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 border-r border-gray-200 dark:border-gray-800 last:border-r-0">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 border-r border-gray-200 dark:border-gray-800 last:border-r-0">{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
