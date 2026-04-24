import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import moment from "moment";
import Papa from "papaparse";
import { v4 } from "uuid";
import dynamic from "next/dynamic";

// Redux imports
import {
  bulkCreateClient,
  useSelectCurrSelectedGroup,
  useSelectCurrSelectedGroupId,
} from "../../../../../redux/slices/clientSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
import { hideToast, showToast } from "../../../../../redux/slices/toastSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import SimpleImportTable from "@/components/Misc/SimpleImportTable";
import { validateHeader } from "@/utils/clientImportChecker";
import { useSelectUserPermissions } from "../../../../../redux/slices/roleAuthSlice";

// Dynamic imports
const CloudUploadOutlinedIcon = dynamic(
  () => import("@mui/icons-material/CloudUploadOutlined"),
  { ssr: false },
);

const ArrowOutwardIcon = dynamic(
  () => import("@mui/icons-material/ArrowOutward"),
  { ssr: false },
);

const ExcelJS = require("exceljs");

const normalizeRow = (row, length) => {
  const normalized = Array.from({ length }, (_, i) => {
    const val = row[i];
    return val === undefined || val === null ? "" : val;
  });
  return normalized;
};

export default function ClientImportForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const currSelectedGroup = useSelectCurrSelectedGroup();
  const currGroupId = useSelectCurrSelectedGroupId();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const user = useSelectUser();
  const isAdmin = useSelectIsAdmin();
  const userPermissions = useSelectUserPermissions();

  const [loading, setLoading] = useState(false);
  const [rawImportedData, setRawImportedData] = useState(null);
  const [importedData, setImportedData] = useState(null);
  const [errorList, setErrorList] = useState(null);

  // modal & handler selection state
  const [showHandlerModal, setShowHandlerModal] = useState(false);
  const [selectedHandlerIds, setSelectedHandlerIds] = useState([]);

  const currCompanyId = useSelectCurrCompanyId();

  const canManageHandler =
    isAdmin || userPermissions.includes("manage_handler");

  const fileInputRef = useRef(null);

  const columns = useMemo(() => {
    if (currSelectedGroup) {
      return currSelectedGroup?.columns.map((c) => {
        return {
          ...c,
          options: c.options,
        };
      });
    } else {
      return [];
    }
  }, [currSelectedGroup]);

  const clientLocation = {
    "Manage group": "manage-group",
    "Client list": "client-list",
    Import: "import",
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const importInstruction = () => {
    return (
      <div className="import-instruction">
        <h3 className="instruction-title">Import Instructions</h3>

        <p className="instruction-step">
          1. <strong>Download Template:</strong> Before importing,{" "}
          <span className="template-link" onClick={() => handleGetTemplate()}>
            Get Your Template Here
          </span>{" "}
          with the correct file structure.
        </p>

        <p className="instruction-step">
          2. <strong>Field Type/Component Input Reference:</strong>
        </p>

        <ul className="instruction-list">
          <li className="instruction-list-item">
            <strong>Date :</strong> <code>YYYY-MM-DD</code> (e.g.{" "}
            <code>2020-07-20</code>)
          </li>
          <li className="instruction-list-item">
            <strong>Numbers:</strong> Enter numeric values only (e.g.{" "}
            <code>100</code>)
          </li>
          <li className="instruction-list-item">
            <strong>Dropdown:</strong> Enter any value or value from the
            available options (e.g. <code>abc</code>)
          </li>
          <li className="instruction-list-item">
            <strong>Short Text:</strong> Plain text (e.g. <code>abc</code>)
          </li>
          {/* <li className="instruction-list-item">
            <strong>Handler:</strong> You will select handler(s) in the next
            step after uploading — do NOT include a Handler column in the
            spreadsheet.
          </li> */}
        </ul>
      </div>
    );
  };

  const handleNavigateMainPage = () => {
    router.push(`/client/client-list`);
  };

  const handleGetTemplate = async () => {
    // Ensure currSelectedGroup exists
    if (!currSelectedGroup) {
      console.error("No selected group");
      return;
    }

    // Filter columns: exclude alert/rich_text AND columns that are not editable (unless admin)
    const allColumns = currSelectedGroup.columns || [];
    const templateColumns = allColumns.filter((col) => {
      if (col.field_type === "alert" || col.field_type === "rich_text")
        return false;
      if (!isAdmin) {
        if (col.permission && col.permission !== "editable") return false;
      }
      return true;
    });

    const groupName = currSelectedGroup.client_group_name || "group";
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clients");

    worksheet.columns = [
      ...templateColumns.map((col) => {
        const key = col.label.toLowerCase().split(" ").join("_");
        return {
          header: col.label,
          key,
          width: 20,
        };
      }),
      // Handler removed from template on purpose
    ];

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      if (!buffer || buffer.byteLength === 0) {
        console.error("Generated XLSX file is empty.");
        return;
      }
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${groupName}_template-Client.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel Export Error:", error);
    }
  };

  const readExcelFile = (file) => {
    return new Promise(async (resolve, reject) => {
      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "csv") {
        const text = await file.text();
        const parsed = Papa.parse(text.trim(), {
          skipEmptyLines: true,
        });
        resolve(parsed.data);
      } else {
        reader.onload = async (e) => {
          try {
            const buffer = e.target.result;
            await workbook.xlsx.load(buffer);

            const worksheet = workbook.worksheets[0];
            const rows = [];
            worksheet.eachRow((row) => {
              const cleanedRow = row.values.slice(1).map((cell) => {
                if (cell && typeof cell === "object") {
                  // ExcelJS formula object
                  if ("result" in cell) return cell.result;
                  return ""; // fallback
                }
                return cell;
              });

              rows.push(cleanedRow);
            });

            resolve(rows);
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleFileUpload = async (e) => {
    setErrorList(null);
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const rows = await readExcelFile(file);

      setRawImportedData(rows);

      if (!rows || rows.length < 1) {
        dispatch(
          showToast({ message: "File empty or unreadable", status: "error" }),
        );
        setLoading(false);
        return;
      }

      const header = rows[0];

      const optional = [];

      const expectedLength = header.length;
      const compareHeader = header;

      // compute compareColumn the same way as template (exclude non-editable unless admin)
      const compareColumn = columns.filter((col) => {
        if (col.field_type === "alert" || col.field_type === "rich_text")
          return false;
        if (!isAdmin) {
          if (col.permission && col.permission !== "editable") return false;
        }
        return true;
      });

      const { isValid, extra, missing } = validateHeader(
        compareHeader,
        compareColumn,
        optional,
      );

      if (!isValid) {
        dispatch(
          showToast({
            message:
              "Header is different from the system, please get the latest template !",
            status: "error",
          }),
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 3000);
        setLoading(false);
        return;
      }

      const seenValues = {};
      const processedList = rows
        .slice(1)
        .map((row) => normalizeRow(row, expectedLength))
        .filter((row) => {
          const hasAny = row.some(
            (cell) =>
              cell !== null && cell !== undefined && `${cell}`.trim() !== "",
          );
          return hasAny;
        })

        .reduce(
          (acc, currRow, rowIndex) => {
            const client_id = v4();
            const client_group_id = currGroupId;
            const company_id = currCompanyId;

            const newObj = header.reduce(
              (dataAcc, currColName, colIndex) => {
                // Handler parsing removed — we will attach handlers in modal step
                const columnObj = compareColumn.find(
                  (col) => col.label === currColName,
                );

                // Skip if no matching column found or if column_id is empty
                if (!columnObj || !columnObj.column_id) {
                  return dataAcc;
                }

                const column_id = columnObj.column_id;
                const field_type = columnObj.field_type;
                const is_required = columnObj.is_required;
                const allow_duplicate = columnObj.allow_duplicate;
                const row_value = currRow[colIndex];

                if (
                  is_required &&
                  (row_value === "" ||
                    row_value === null ||
                    row_value === undefined)
                ) {
                  dataAcc["error_values"].push({
                    row_index: rowIndex,
                    col_index: colIndex,
                    message: `${currColName} is a required field, please make sure it is not empty.`,
                    error_type: "required",
                  });
                }

                if (
                  !allow_duplicate &&
                  row_value !== "" &&
                  row_value !== null &&
                  row_value !== undefined
                ) {
                  if (!seenValues[column_id]) {
                    seenValues[column_id] = new Set();
                  }
                  if (seenValues[column_id].has(row_value)) {
                    dataAcc["error_values"].push({
                      row_index: rowIndex,
                      col_index: colIndex,
                      message: `${currColName} must be unique, but "${row_value}" is duplicated.`,
                      error_type: "duplicate",
                    });
                  } else {
                    seenValues[column_id].add(row_value);
                  }
                }

                if (
                  row_value !== "" &&
                  row_value !== null &&
                  row_value !== undefined
                ) {
                  dataAcc["values"].push({
                    client_id,
                    column_id,
                    client_group_id,
                    row_value,
                  });
                }

                dataAcc["processed"][currColName] = row_value;

                return dataAcc;
              },

              { values: [], processed: {}, error_values: [], handler_list: [] },
            );

            acc["client_list"].push({
              client_id,
              user_id: user?.uid,
              client_group_id,
              company_id,
            });
            acc["custom_values"].push(newObj["values"]);
            acc["processed_list"].push(newObj["processed"]);
            acc["add_handler_list"].push(newObj["handler_list"]);
            acc["error_list"] = (acc["error_list"] || []).concat(
              newObj.error_values,
            );

            return acc;
          },
          {
            client_list: [],
            custom_values: [],
            processed_list: [],
            error_list: [],
            add_handler_list: [],
          },
        );

      // pull results out
      const client_list = processedList.client_list;
      const custom_values = processedList.custom_values.flat();
      const processed_list = processedList.processed_list;
      const error_list = processedList.error_list;
      const add_handler_list = processedList.add_handler_list.flat(2);

      if (error_list.length > 0) {
        setErrorList(error_list);
        dispatch(
          showToast({
            message:
              "There are problems with your imported list, please amend according to the error list provided below !",
            status: "error",
          }),
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 4000);
        setLoading(false);
        return;
      }

      if (processed_list.length < 1) {
        dispatch(
          showToast({
            message: "Empty data, please try to import again !",
            status: "error",
          }),
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 3000);
        setLoading(false);
        return;
      }

      setImportedData({
        client_list,
        custom_values,
        processed_list,
        add_handler_list,
      });
    } catch (err) {
      console.error("Error reading file:", err);
    } finally {
      setLoading(false);

      e.target.value = "";
    }
  };

  // When user clicks the main Import button, open the handler modal
  const handleListImport = async () => {
    if (!importedData || !importedData.client_list?.length) {
      dispatch(
        showToast({
          message: "No imported data available. Please upload a file first.",
          status: "error",
        }),
      );
      setTimeout(() => dispatch(hideToast()), 2500);
      return;
    }

    // optionally pre-select current user
    // setSelectedHandlerIds([user?.uid]);

    setShowHandlerModal(true);
  };

  const handleConfirmImport = (handlerIds = []) => {
    if (!importedData || !importedData.client_list?.length) {
      dispatch(
        showToast({
          message: "No imported data available. Please upload a file first.",
          status: "error",
        }),
      );
      setShowHandlerModal(false);
      setTimeout(() => dispatch(hideToast()), 2500);
      return;
    }

    const totalImported = importedData.client_list.length;
    const client_group_id =
      currSelectedGroup?.client_group_id ?? currSelectedGroup?.id ?? null;
    const client_group_name = currSelectedGroup?.client_group_name ?? "";

    // build handler pairs
    const handlerPairs = [];
    importedData.client_list.forEach((c) => {
      handlerIds.forEach((uid) => {
        handlerPairs.push({
          client_id: c.client_id,
          user_id: uid,
        });
      });
    });

    const logsBody = {
      company_id: currCompanyId,
      user_id: user?.uid,
      section: "Client",
      action: "Import",
      text: `${user?.displayName} imported ${totalImported} clients into ${client_group_name}`,
      subject_id: currGroupId,
      metadata: {
        type: "client_import",
        total_imported: totalImported,
        client_group_id: currGroupId,
        client_group_name: currSelectedGroup.client_group_name,
      },
    };

    dispatch(
      bulkCreateClient({
        router,
        setImportedData,
        client_list: importedData.client_list,
        custom_values: importedData.custom_values,
        handler: handlerPairs,
        logsBody,
      }),
    );

    setShowHandlerModal(false);
  };

  const handleErrorListExport = async () => {
    const error_list = [...errorList];
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Sheet 1`);

    rawImportedData.forEach((row) => {
      worksheet.addRow(row);
    });

    const errorColors = {
      duplicate: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1591EA" },
      },
      required: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0000" },
      },
    };

    error_list.forEach((err) => {
      const excelRowIndex = err.row_index + 1;
      const excelColIndex = err.col_index + 1;

      const cell = worksheet.getRow(excelRowIndex + 1).getCell(excelColIndex);

      cell.fill = errorColors[err.error_type] || {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCC" },
      };

      cell.note = err.message;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "import_with_errors.xlsx";
    link.click();
  };

  return (
    <div className="client-import-container">
      <form
        id="group-form"
        className="import-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="import-header">
          <div className="header-left">
            <h1 className="page-title">Import Client</h1>
          </div>
          <div className="header-actions">
            <ActionButton
              label={"Back"}
              type="primary"
              onClick={() => handleNavigateMainPage()}
            />
          </div>
        </div>

        <div className="import-content">
          {importInstruction()}

          {errorList && errorList.length > 0 ? (
            <div className="error-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => handleErrorListExport()}
              >
                Get Error List
              </button>
            </div>
          ) : null}

          {importedData && importedData?.processed_list.length > 0 ? (
            <div className="import-data-section">
              <span className="record-count">
                {importedData?.processed_list.length} record(s) ready for import
              </span>
              <div className="data-actions">
                <div className="action-group">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={triggerFilePicker}
                  >
                    Re-Upload
                  </button>

                  <input
                    id="reupload-file"
                    type="file"
                    className="visually-hidden"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e) => handleFileUpload(e)}
                  />
                </div>

                <ActionButton
                  type="primary"
                  label={"Import"}
                  onClick={() => handleListImport()}
                />
              </div>

              {/* <SimpleImportTable
                importedData={importedData}
                columns={columns}
                loading={loading}
              /> */}
            </div>
          ) : (
            <div className="upload-section">
              <div className="upload-area" onClick={triggerFilePicker}>
                <CloudUploadOutlinedIcon fontSize="large" />
                <p className="upload-text">Upload List</p>
              </div>

              <input
                id="upload-file"
                type="file"
                className="visually-hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => handleFileUpload(e)}
              />
            </div>
          )}
        </div>
      </form>
      {/* Handler selection modal */}
      {showHandlerModal && (
        <div className="handler-modal-backdrop">
          <div
            className="handler-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="handler-modal-title"
          >
            <header className="handler-modal__header">
              <h3 id="handler-modal-title" className="handler-modal__title">
                Select Handler(s)
              </h3>
              <p className="handler-modal__subtitle">
                Choose one or more users to assign as handler for the imported
                clients.
              </p>
            </header>

            <div className="handler-modal__body">
              {allCompanyUsers && allCompanyUsers.length > 0 ? (
                allCompanyUsers.map((u) => {
                  const checked = selectedHandlerIds.includes(u.user_id);
                  return (
                    <label key={u.user_id} className="handler-modal__user-row">
                      <input
                        type="checkbox"
                        className="handler-modal__checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHandlerIds((s) => [...s, u.user_id]);
                          } else {
                            setSelectedHandlerIds((s) =>
                              s.filter((id) => id !== u.user_id),
                            );
                          }
                        }}
                      />
                      <div className="handler-modal__user-meta">
                        <span className="handler-modal__user-name">
                          {u.displayName || u.name || u.email}
                        </span>
                        <small className="handler-modal__user-sub">
                          {u.email || u.user_id}
                        </small>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="handler-modal__no-users">
                  No users available
                </div>
              )}
            </div>

            <footer className="handler-modal__footer">
              <div className="handler-modal__footer-actions">
                <button
                  type="button"
                  className="btn btn-secondary handler-modal__btn-back"
                  onClick={() => setShowHandlerModal(false)}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn btn-primary handler-modal__btn-import"
                  onClick={() => handleConfirmImport(selectedHandlerIds)}
                  // disabled={
                  //   !importedData ||
                  //   !importedData.processed_list?.length ||
                  //   selectedHandlerIds.length === 0
                  // }
                >
                  Import
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="visually-hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileUpload}
      />
    </div>
  );
}
