// Simple reusable list-view table. columns: [{ key, label }]
export default function DataTable({ columns, rows, onRowClick }) {
  return (
    <table className="w-full bg-white shadow rounded-lg overflow-hidden">
      <thead className="bg-gray-100 text-left text-sm">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="px-4 py-2">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className="border-t hover:bg-gray-50 cursor-pointer text-sm"
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-2">{row[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
