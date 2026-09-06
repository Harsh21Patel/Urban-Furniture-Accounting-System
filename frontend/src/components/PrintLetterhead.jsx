export default function PrintLetterhead({ title = '', reference = '', subtitle = '' }) {
  const printedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div className="hidden print:block print-letterhead mb-6">
      {/* Top brand bar */}
      <div className="flex items-start justify-between pb-4 border-b-2 border-indigo-600">
        {/* Left — Company identity */}
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div
            style={{
              width: 48, height: 48, borderRadius: 8,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-1px' }}>UF</span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.3px' }}>
              Urban Furniture
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#6b7280', marginTop: 1 }}>
              S.G. Highway, Ahmedabad, Gujarat — 380054
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>
              ✉ urbanSales@odoo.com &nbsp;|&nbsp; 🌐 www.urbanfurniture.in
            </p>
          </div>
        </div>

        {/* Right — Document info */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.3px' }}>
            {title}
          </p>
          {reference && (
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#1f2937', marginTop: 2 }}>
              {reference}
            </p>
          )}
          {subtitle && (
            <p style={{ margin: 0, fontSize: 10, color: '#6b7280', marginTop: 1 }}>
              {subtitle}
            </p>
          )}
          <p style={{ margin: 0, fontSize: 9, color: '#9ca3af', marginTop: 4 }}>
            Printed: {printedAt}
          </p>
        </div>
      </div>
    </div>
  );
}
