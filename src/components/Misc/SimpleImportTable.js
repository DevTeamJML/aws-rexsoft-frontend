import React from "react";

const SimpleImportTable = ({ 
  importedData, 
  columns, 
  loading = false 
}) => {
  if (loading) {
    return <div className="table-loading">Loading imported data...</div>;
  }

  if (!importedData?.processed_list || importedData.processed_list.length === 0) {
    return <div className="table-empty">No data to display</div>;
  }

  // Filter out alert and rich_text columns, and empty columns
  const displayColumns = columns.filter(
    col => col.field_type !== "alert" && 
           col.field_type !== "rich_text" && 
           col.label.trim() !== ""
  );

  const processedData = importedData.processed_list;

  return (
    <div className="simple-import-table">
      <div className="table-header">
        {/* <h3>Imported Data Preview</h3> */}
        <span className="record-count">
          {processedData.length} record(s) ready for import
        </span>
      </div>
      
      {/* <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-number">#</th>
              {displayColumns.map((column) => (
                <th key={column.column_id} className="column-header">
                  {column.label}
                </th>
              ))}
              {importedData.add_handler_list && importedData.add_handler_list.length > 0 && (
                <th className="column-header">Handler</th>
              )}
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, index) => (
              <tr key={index} className="data-row">
                <td className="row-number">{index + 1}</td>
                {displayColumns.map((column) => (
                  <td key={column.column_id} className="data-cell">
                    {row[column.label] || "-"}
                  </td>
                ))}
                {importedData.add_handler_list && importedData.add_handler_list.length > 0 && (
                  <td className="data-cell">
                    {getHandlerDisplay(importedData.add_handler_list, importedData.client_list[index]?.client_id)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

// Helper function to display handlers
const getHandlerDisplay = (handlerList, clientId) => {
  if (!handlerList || !clientId) return "-";
  
  const clientHandlers = handlerList.filter(handler => handler.client_id === clientId);
  if (clientHandlers.length === 0) return "-";
  
  return clientHandlers.map(handler => handler.user_id).join(', ');
};

export default SimpleImportTable;