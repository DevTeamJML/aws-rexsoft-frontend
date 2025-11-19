
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
import { useSelectAllCompanyUsers } from "../../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
import { hideToast, showToast } from "../../../../../redux/slices/toastSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import SimpleImportTable from "@/components/Misc/SimpleImportTable";

// Dynamic imports
const CloudUploadOutlinedIcon = dynamic(
  () => import("@mui/icons-material/CloudUploadOutlined"),
  { ssr: false }
);

const ArrowOutwardIcon = dynamic(
  () => import("@mui/icons-material/ArrowOutward"),
  { ssr: false }
);

const ExcelJS = require("exceljs");

export default function ClientImportForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const currSelectedGroup = useSelectCurrSelectedGroup();
  const currGroupId = useSelectCurrSelectedGroupId();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const user = useSelectUser();

  const [loading, setLoading] = useState(false);
  const [rawImportedData, setRawImportedData] = useState(null);
  const [importedData, setImportedData] = useState(null);
  const [errorList, setErrorList] = useState(null);

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
            <strong>Dropdown:</strong> Enter one value only from the available
            options (e.g. <code>abc</code>)
          </li>
          <li className="instruction-list-item">
            <strong>Short Text:</strong> Plain text (e.g. <code>abc</code>)
          </li>
          <li className="instruction-list-item">
            <strong>Handler:</strong> Enter the User Id by copying it from the{" "}
            <span
              className="user-list-link"
              onClick={() => {
                window.open("/control-panel/users", "_blank");
              }}
            >
              User List
            </span>
            . Separate multiple selections with commas (e.g.{" "}
            <code>id1,id2,id3</code>)
          </li>
        </ul>
      </div>
    );
  };

  const handleNavigateMainPage = () => {
    router.push(`/client/client-list`);
  };

  const handleGetTemplate = async () => {
    const columns = currSelectedGroup.columns;
    const groupName = currSelectedGroup.client_group_name;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clients");

    if (!worksheet) {
      console.error("Failed to create worksheet.");
      return;
    }

    worksheet.columns = [
      ...columns
        .filter(
          (col) => col.field_type !== "alert" && col.field_type !== "rich_text"
        )
        .map((col) => {
          const key = col.label.toLowerCase().split(" ").join("_");
          return {
            header: col.label,
            key: key,
            width: 20,
          };
        }),
      {
        header: "Handler",
        key: "handler",
        width: 20,
      },
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

      if (blob.size === 0) {
        console.error("Blob creation failed.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = groupName + "_template" + "-Client.xlsx";
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
            worksheet.eachRow((row) => rows.push(row.values.slice(1)));

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
      const header = rows[0];
      const expectedLength = header.length;
      const areAllColumnsSame = columns
        .filter(
          (col) => col.field_type !== "alert" && col.field_type !== "rich_text"
        )
        .map((col) => col.label)
        .every((colName) => header.some((header) => header === colName));

      if (!areAllColumnsSame) {
        dispatch(
          showToast({
            message:
              "Header is different from the system, please get the latest template !",
            status: "error",
          })
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 3000);
        return;
      }

      const seenValues = {};
      const processedList = rows
        .slice(1)
        .filter((row) => {
          if (row.length !== expectedLength) return false;
          return true;
        })
        .reduce(
          (acc, currRow, rowIndex) => {
            const client_id = v4();
            const client_group_id = currGroupId;

            const newObj = header.reduce(
              (dataAcc, currColName, colIndex) => {
                if (currColName === "Handler") {
                  const isLastIndex = header.length - 1;
                  const row_value = currRow[isLastIndex];
                  if (row_value) {
                    const handlerArr = row_value.split(",").map((handler) => {
                      return {
                        client_id,
                        user_id: handler.trim(),
                      };
                    });
                    dataAcc["handler_list"].push(handlerArr);
                  }
                } else {
                  const columnObj = columns.find(
                    (col) => col.label === currColName
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

                  if (is_required && row_value === "") {
                    dataAcc["error_values"].push({
                      row_index: rowIndex,
                      col_index: colIndex,
                      message: `${currColName} is a required field, please make sure it's not empty.`,
                      error_type: "required",
                    });
                  }

                  if (!allow_duplicate && row_value !== "") {
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

                  dataAcc["values"].push({
                    client_id,
                    column_id,
                    client_group_id,
                    row_value: row_value,
                  });

                  dataAcc["processed"][currColName] = row_value;
                }

                return dataAcc;
              },
              { values: [], processed: {}, error_values: [], handler_list: [] }
            );

            acc["client_list"].push({
              client_id,
              user_id: user?.uid,
              client_group_id,
            });
            acc["custom_values"].push(newObj["values"]);
            acc["processed_list"].push(newObj["processed"]);
            acc["add_handler_list"].push(newObj["handler_list"]);
            acc["error_list"] = (acc["error_list"] || []).concat(
              newObj.error_values
            );

            return acc;
          },
          {
            client_list: [],
            custom_values: [],
            processed_list: [],
            error_list: [],
            add_handler_list: [],
          }
        );

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
              "There are problems with your imported list, please ammend according to the error list provided below !",
            status: "error",
          })
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 4000);
        return;
      }

      if (processed_list.length < 1) {
        dispatch(
          showToast({
            message: "Empty data, please try to import again !",
            status: "error",
          })
        );
        setTimeout(() => {
          dispatch(hideToast());
        }, 3000);
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
    }
  };

  const handleListImport = async () => {
    const client_list = importedData.client_list;
    const custom_values = importedData.custom_values;
    const add_handler_list = importedData.add_handler_list;

    console.log({
      router,
      setImportedData,
      client_list,
      custom_values,
      handler: add_handler_list,
    });
    dispatch(
      bulkCreateClient({
        router,
        setImportedData,
        client_list,
        custom_values,
        handler: add_handler_list,
      })
    );
  };

  const handleErrorListExport = async () => {
    const error_list = [...errorList];
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Sheet 1`);

    const informationColumns = [
      {
        header: "Row",
        key: "Row",
        width: 10,
      },
      {
        header: "Error Message",
        key: "Error Message",
        width: 50,
      },
    ];

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
      <form id="group-form" className="import-form">
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
              <div className="data-actions">
                <div className="action-group">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() =>
                      document.getElementById("reupload-file").click()
                    }
                  >
                    Re-Upload
                  </button>
                  <input
                    id="reupload-file"
                    type="file"
                    className="visually-hidden"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e)=>handleFileUpload(e)}
                  />
                </div>

                <ActionButton
                  type="primary"
                  label={"Import"}
                  onClick={(e) => handleListImport(e)}
                />
                {/* <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleListImport()}
                >
                  Import
                </button> */}
              </div>

              {/* <ImportedDataTable
                processedList={
                  importedData ? importedData?.processed_list : null
                }
              /> */}
              <SimpleImportTable
                importedData={importedData}
                columns={columns}
                loading={loading}
              />
            </div>
          ) : (
            <div className="upload-section">
              <div
                className="upload-area"
                onClick={() => document.getElementById("upload-file").click()}
              >
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
    </div>
  );
}
