import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  const renderCell = (item: T, column: Column<T>, index: number) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item, index);
    }
    return item[column.accessor] as React.ReactNode;
  };

  if (isLoading) {
    return (
      <div className="table-container text-white bg-black">
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container animate-fade-in text-white bg-black">
      <table className="data-table w-full border border-gray-700">
        <thead className="bg-gray-900">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`p-2 border border-gray-700 ${column.className ?? ""}`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-400"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`${
                  onRowClick
                    ? "cursor-pointer hover:bg-white hover:text-black transition-colors duration-200"
                    : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-2 border border-gray-700 ${column.className ?? ""}`}
                  >
                    {renderCell(item, column, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
