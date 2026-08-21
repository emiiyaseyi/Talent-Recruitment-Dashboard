interface Column<T> {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  align?: "left" | "right";
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No rows to show.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
            {columns.map((c) => (
              <th
                key={c.header}
                className={`py-2 pr-4 font-medium ${c.align === "right" ? "text-right" : ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row)} className="border-b border-[var(--border)] last:border-0">
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={`py-2 pr-4 text-[var(--text-primary)] ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                >
                  {c.cell(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
