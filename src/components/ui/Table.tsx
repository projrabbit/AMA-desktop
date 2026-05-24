import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render(row: T): ReactNode;
}

interface TableProps<T> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey(row: T): string | number;
}

export function Table<T>({ caption, columns, rows, getRowKey }: TableProps<T>) {
  return (
    <table className="ui-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
