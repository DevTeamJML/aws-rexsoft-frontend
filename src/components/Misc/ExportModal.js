// components/ExportModal/ExportModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import moment from "moment";
import { ApiRoute } from "@/enums/api-route";
import { API } from "@/service/api";

/**
 * Props:
 * - open, onClose
 * - fixedColumns, dynamicColumns
 * - columnVisibility
 * - clients, selectedClientIds
 * - currSelectedGroup
 * - dispatch, getAllClients
 * - user
 * - isArchivedPage
 * - showToast
 * - pagination
 * - canManageHandler (bool)
 * - isAdmin (bool)
 */
const ExportModal = ({
  open,
  onClose,
  fixedColumns = [],
  dynamicColumns = [],
  columnVisibility = [],
  clients = [],
  selectedClientIds = [],
  currSelectedGroup = {},
  dispatch,
  getAllClients,
  user,
  isArchivedPage,
  showToast,
  pagination,
  canManageHandler = false,
  isAdmin = false,
}) => {
  const [selectedColumns, setSelectedColumns] = useState(new Set());
  const [loadingExport, setLoadingExport] = useState(false);

  // Helpers
  const normalize = (s = "") => s.toString().replace(/\s+/g, "_").toLowerCase();

  const getId = (c) => c?.id ?? c?.column_id ?? c?.raw?.column_id ?? undefined;
  const getLabel = (c) =>
    c?.column_name ?? c?.header ?? c?.label ?? c?.name ?? c?.title ?? getId(c);

  const isHandlerColumn = (colRawOrNorm) => {
    if (!colRawOrNorm) return false;
    const col =
      typeof colRawOrNorm === "object" ? colRawOrNorm : { label: colRawOrNorm };
    const lbl = normalize(getLabel(col) ?? "");
    return (
      lbl === "handler" ||
      lbl === "owner" ||
      col.id === "handler" ||
      col.raw?.field === "handler" ||
      normalize(col.raw?.label ?? "") === "handler"
    );
  };

  const rawArrayToMap = (rawArr = []) => {
    const map = {};
    if (!Array.isArray(rawArr)) return map;
    for (const item of rawArr) {
      if (!item) continue;
      const cid = item.column_id ?? item.columnId ?? item.column_id;
      if (!cid) continue;
      map[cid] = item.row_value;
    }
    return map;
  };

  // Normalize and pre-filter columns (permissions + handler)
  const allColumns = useMemo(() => {
    const filteredFixedColumns = fixedColumns.filter(col => col.id !== "user_id");
    const merged = [...(filteredFixedColumns || []), ...(dynamicColumns || [])];

    return merged
      .filter((c) => {
        // filter out not_viewable for non-admins
        if (!isAdmin && c?.permission === "not_viewable") return false;

        // filter out handler if user can't manage handler
        if (!canManageHandler && isHandlerColumn(c)) return false;

        return true;
      })
      .map((c) => ({
        id: getId(c),
        label: getLabel(c),
        raw: c,
      }));
  }, [fixedColumns, dynamicColumns, isAdmin, canManageHandler]);

  // Columns the user may actually see based on columnVisibility (if provided)
  //   const allowedColumns = useMemo(() => {
  //     if (!Array.isArray(columnVisibility) || columnVisibility.length === 0) {
  //       return allColumns;
  //     }
  //     const visibilitySet = new Set(columnVisibility);
  //     return allColumns.filter((col) => {
  //       const id = col.id;
  //       if (id === "_checkbox" || id === "actions") return true; // always keep
  //       // match by id or label (defensive)
  //       console.log(columnVisibility)
  //       return visibilitySet.has(id) || visibilitySet.has(col.label) || visibilitySet.has(normalize(col.label));
  //     });
  //   }, [allColumns, columnVisibility]);

  useEffect(() => {
    if (!open) {
      setSelectedColumns(new Set());
    }
  }, [open]);

  const toggleColumn = (colId) =>
    setSelectedColumns((prev) => {
      const copy = new Set(prev);
      if (copy.has(colId)) copy.delete(colId);
      else copy.add(colId);
      return copy;
    });

  // Extract a single value for client row & column
  const extractValueForColumn = (row = {}, col = {}) => {
    if (!row || !col) return "";

    const normLabel = normalize(col.label);
    // 1) try mapped (by normalized label or by column id)
    if (row.mapped && typeof row.mapped === "object") {
      if (
        normLabel &&
        Object.prototype.hasOwnProperty.call(row.mapped, normLabel)
      )
        return row.mapped[normLabel];
      if (col.id && Object.prototype.hasOwnProperty.call(row.mapped, col.id))
        return row.mapped[col.id];
    }

    // 2) try common top-level fields / accessor
    const keysToTry = [
      col.id,
      col.raw?.accessor,
      col.raw?.column_id,
      col.raw?.key,
      col.raw?.field,
      normLabel,
    ].filter(Boolean);

    for (const k of keysToTry) {
      if (typeof k === "string" && k.includes(".")) {
        const parts = k.split(".");
        let cur = row;
        for (const p of parts) {
          if (cur == null) break;
          cur = cur[p];
        }
        if (cur !== undefined) return cur;
      } else if (Object.prototype.hasOwnProperty.call(row, k)) {
        return row[k];
      }
    }

    // 3) try raw array lookup
    if (Array.isArray(row.raw)) {
      const map = rawArrayToMap(row.raw);
      const cid = col.raw?.column_id ?? col.id;
      if (cid && Object.prototype.hasOwnProperty.call(map, cid))
        return map[cid];
      if (col.id && Object.prototype.hasOwnProperty.call(map, col.id))
        return map[col.id];
      if (col.label && Object.prototype.hasOwnProperty.call(map, col.label))
        return map[col.label];
    }

    // 4) fallback common keys
    for (const fk of [
      "created_at",
      "updated_at",
      "id",
      "client_id",
      "serial_number",
    ]) {
      if (Object.prototype.hasOwnProperty.call(row, fk)) return row[fk];
    }

    return "";
  };

  // Build rows ready for CSV
  const buildRowsFromClients = (rows, columnsToUse) => {
    return (rows || []).map((r) => {
      const out = {};
      const rawMap = rawArrayToMap(r.raw);
      const handlerString = Array.isArray(r.handler)
        ? r.handler.map((h) => h.label || h.value).join(", ")
        : (r.handler_name ?? "");

      for (const c of columnsToUse) {
        // double safety: skip handler if user lacks permission
        if (!canManageHandler && isHandlerColumn(c.raw)) continue;

        let value = extractValueForColumn(r, c);

        const isHandler =
          normalize(c.label) === "handler" ||
          normalize(c.label) === "owner" ||
          c.id === "handler" ||
          c.raw?.field === "handler";
        if (isHandler) value = handlerString || value;

        // if value missing, try rawMap by column_id
        const cid = c.raw?.column_id ?? c.id;
        if (
          (value === "" || value == null) &&
          cid &&
          rawMap[cid] !== undefined
        ) {
          value = rawMap[cid];
        }

        // map dropdown option ids to their display value if options are provided
        const opts = c.raw?.options;
        if (
          value !== null &&
          value !== "" &&
          Array.isArray(opts) &&
          opts.length > 0
        ) {
          const found = opts.find(
            (o) => o.option_id === value || o.id === value,
          );
          if (found) value = found.value ?? value;
        }

        if (typeof value === "object" && value !== null) {
          try {
            value = JSON.stringify(value);
          } catch {
            value = String(value);
          }
        }

        out[c.label] = value == null ? "" : value;
      }

      return out;
    });
  };

  const downloadCsv = (filename, dataRows) => {
    const csv = Papa.unparse(dataRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const selected =
      selectedColumns.size > 0
        ? allColumns.filter((c) => selectedColumns.has(c.id))
        : allColumns;

    const FIXED_KEYS = new Set([
      "user_id",
      "created_at",
      "serial_number",
      "handler",
      "handler_name",
    ]);

    const selectedFixed = selected
      .filter((c) => FIXED_KEYS.has(c.id))
      .map((c) => c.raw);


    const selectedDynamic = selected
      .filter((c) => !FIXED_KEYS.has(c.id))
      .map((c) => c.raw);

    const apiPayload = {
      client_group_id:
        currSelectedGroup?.client_group_id ?? currSelectedGroup?.id ?? null,
      columns: selectedDynamic,
      fixedColumns: selectedFixed,
      filters: currSelectedGroup?.filters || [],
      searchText: "",
      sortConfig: {},
      user_id: user?.uid ?? user?.user_id ?? null,
      isAdmin: user?.isAdmin ?? isAdmin ?? false,
      hasPermission: false,
      isArchivedPage: !!isArchivedPage,
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${process.env.API_URL}/client/exportClientsCSV`;
    form.target = "_blank";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(apiPayload);

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
    form.remove();
  };

  // const handleExport = async ({ exportAll = false }) => {
  //   setLoadingExport(true);
  //   try {
  //     // determine which columns to use
  //     let colsToUse = selectedColumns.size > 0 ? allColumns.filter((c) => selectedColumns.has(c.id)) : allColumns;

  //     if (!canManageHandler) {
  //       colsToUse = colsToUse.filter((c) => !isHandlerColumn(c.raw));
  //     }

  //     if (!colsToUse || colsToUse.length === 0) {
  //       showToast &&
  //         dispatch &&
  //         dispatch(
  //           showToast({
  //             message: "No columns available to export.",
  //             status: "error",
  //           })
  //         );
  //       setLoadingExport(false);
  //       return;
  //     }

  //     let rows = [];

  //     if (exportAll) {
  //       // request all rows from backend
  //       try {
  //         const apiPayload = {
  //           client_group_id: currSelectedGroup?.client_group_id ?? currSelectedGroup?.id ?? null,
  //           columns: dynamicColumns,
  //           fixedColumns,
  //           pagination: { pageSize: 0 }, // server: return all
  //           filters: currSelectedGroup?.filters || [],
  //           searchText: "",
  //           sortConfig: {},
  //           user_id: user?.uid ?? user?.user_id ?? null,
  //           isAdmin: user?.isAdmin ?? isAdmin ?? false,
  //           hasPermission: false,
  //           isArchivedPage: !!isArchivedPage,
  //         };

  //         const res = await API.post(ApiRoute.client.get, apiPayload);
  //         const data = res?.data?.data ?? res?.data?.clients ?? res?.data ?? [];
  //         rows = Array.isArray(data) ? data : [];
  //       } catch (apiErr) {
  //         console.error("Failed to fetch all clients for export:", apiErr);
  //         showToast &&
  //           dispatch &&
  //           dispatch(
  //             showToast({
  //               message: "Failed to fetch all clients for export.",
  //               status: "error",
  //             })
  //           );
  //         setLoadingExport(false);
  //         return;
  //       }
  //     } else {
  //       rows = clients || [];
  //       if (Array.isArray(selectedClientIds) && selectedClientIds.length > 0) {
  //         const setIds = new Set(selectedClientIds);
  //         rows = rows.filter((c) => setIds.has(c.id ?? c.client_id ?? c._id));
  //       }
  //     }

  //     const dataRows = buildRowsFromClients(rows, colsToUse);
  //     const filename = `clients_export_${moment().toISOString().replace(/[:.]/g, "-")}.csv`;
  //     downloadCsv(filename, dataRows);

  //     showToast &&
  //       dispatch &&
  //       dispatch(
  //         showToast({
  //           message: exportAll ? "Exported all clients (CSV ready)." : "Exported clients (CSV ready).",
  //           status: "success",
  //         })
  //       );
  //   } catch (err) {
  //     console.error("Export error:", err);
  //     showToast &&
  //       dispatch &&
  //       dispatch(
  //         showToast({
  //           message: "Failed to export. Check console for details.",
  //           status: "error",
  //         })
  //       );
  //   } finally {
  //     setLoadingExport(false);
  //   }
  // };

  if (!open) return null;

  return (
    <div className="export-backdrop">
      <div className="modal">
        <div className="header">
          <h3>Export Clients</h3>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="body">
          <p className="help">
            Select columns to include in export. If none selected, all viewable
            columns will be exported.
          </p>

          <div className="columnsList">
            {allColumns.length === 0 ? (
              <div className="empty">No columns available</div>
            ) : (
              <div className="scrollArea">
                {allColumns
                  .filter((c) =>
                    canManageHandler ? true : !isHandlerColumn(c.raw),
                  )
                  .map((col) => {
                    const allowed =
                      Array.isArray(columnVisibility) &&
                      columnVisibility.length > 0
                        ? columnVisibility.includes(col.id) ||
                          columnVisibility.includes(col.label) ||
                          columnVisibility.includes(normalize(col.label))
                        : true;
                    return (
                      <label key={col.id ?? col.label} className="colItem">
                        <input
                          type="checkbox"
                          checked={selectedColumns.has(col.id)}
                          onChange={() => toggleColumn(col.id)}
                        />
                        <span className="colLabel">{col.label}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="footer">
          <button
            className="secondary"
            onClick={() => {
              const next = new Set();
              allColumns.forEach((c) => next.add(c.id));
              setSelectedColumns(next);
            }}
          >
            Select All Visible
          </button>

          <div className="actions">
            <span
              className="export-all-span"
              onClick={() => handleExport({ exportAll: true })}
            >
              {`Export ${pagination ? pagination?.totalItems : 0}`}
            </span>

            <button className="outline" onClick={onClose}>
              Cancel
            </button>

            <button
              className="primary"
              onClick={() => handleExport({ exportAll: false })}
              disabled={loadingExport}
            >
              {loadingExport ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
