"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import { useRouter } from "next/router";

import {
  getLogs,
  getMyLogs,
  useSelectLogs,
  useSelectLogsLoading,
  useSelectLogsTotal,
} from "../../../redux/slices/logSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { FaSearch } from "react-icons/fa";
import { getAllClientGroupsName, useSelectAllClientGroupsName } from "../../../redux/slices/clientGroupSlice";

const formatValue = (val) => {
  if (val === null || val === undefined || val === "") return "(empty)";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "(empty)";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

export default function LogsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const logs = useSelectLogs();
  const loading = useSelectLogsLoading();
  const total = useSelectLogsTotal();

  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();
  const allGroupName = useSelectAllClientGroupsName(); // expected [{ client_group_id, client_group_name }, ...]

  const permissions = useSelector((s) => s.roleAuth?.userPermissions ?? []);
  const canViewAll = useMemo(
    () =>
      permissions.includes("view_other_logs") ||
      permissions.includes("view_all"),
    [permissions]
  );

  // modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showAllAffected, setShowAllAffected] = useState(false);
  const modalRef = useRef(null);

  // filters / paging
  const [mode, setMode] = useState(canViewAll ? "all" : "mine");
  const [section, setSection] = useState("all");
  const [search, setSearch] = useState("");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const allCompanyUsers = useSelectAllCompanyUsers();
  const isAdmin = useSelectIsAdmin();

  const debounceRef = useRef(null);

  const SECTION_MAP = useMemo(
    () => ({
      Client: "#2f86f6",
      // Appointment: "#e74c3c",
      // Form: "#27ae60",
    }),
    []
  );

  useEffect(() => {
    if (currCompanyId) {
      dispatch(getAllClientGroupsName({ company_id: currCompanyId }));
    }
  }, [currCompanyId]);

  useEffect(() => {
    if (selectedLog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowAllAffected(false);
    }

    return () => {
      document.body.style.overflow = "";
      setShowAllAffected(false);
    };
  }, [openModal, selectedLog]);

  // fetchLogs (useCallback so effects are stable)
  const fetchLogs = useCallback(
    (opts = {}) => {
      const useOffset = opts.offset ?? offset;
      const useSection =
        opts.section ?? (section === "all" ? undefined : section);
      const useSearch = typeof opts.search === "string" ? opts.search : search;

      const params = {
        limit,
        offset: useOffset,
        section: useSection,
        q: useSearch ? useSearch : undefined,
        company_id: currCompanyId,
        user_id: user?.uid,
      };

      // remove undefineds
      Object.keys(params).forEach(
        (k) => params[k] === undefined && delete params[k]
      );

      if (currCompanyId && user?.uid) {
        if (mode === "mine" && !isAdmin) {
          dispatch(getMyLogs({ params }));
        } else {
          dispatch(getLogs({ params }));
        }
      }
    },
    [
      dispatch,
      offset,
      section,
      limit,
      currCompanyId,
      user?.uid,
      mode,
      search,
      isAdmin,
    ]
  );

  // Debounced effect: run when mode/section/search change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchLogs({ offset: 0, section, search });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mode, section, search, fetchLogs]);

  // immediate search handler (used by Enter key)
  const handleGlobalSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setOffset(0);
    fetchLogs({ offset: 0, search });
  }, [fetchLogs, search]);

  // onKeyDown handler for Enter key in search input
  const handleSearchEnter = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const val = typeof e.target?.value === "string" ? e.target.value : search;
      setOffset(0);
      fetchLogs({ offset: 0, search: val });
    },
    [fetchLogs, search]
  );

  const handleLoadMore = () => {
    if (loading) return;
    const next = offset + limit;
    setOffset(next);
    fetchLogs({ offset: next });
  };

  const localeDate = (d) => {
    try {
      const dt = d ? new Date(d) : new Date();
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dt);
    } catch {
      return String(d);
    }
  };

  const canLoadMore = !loading && logs && logs.length < (total || 0);

  // helper to get client group name by id (returns id if not found)
  const getGroupName = useCallback(
    (subjectId) => {
      if (!subjectId) return "";
      if (!Array.isArray(allGroupName) || allGroupName.length === 0)
        return subjectId;
      const found = allGroupName.find(
        (g) =>
          g.client_group_id === subjectId ||
          g.id === subjectId ||
          g.client_group?.id === subjectId
      );
      return found?.client_group_name ?? found?.name ?? subjectId;
    },
    [allGroupName]
  );

  // ---------- small helpers to render metadata shapes ----------
  const renderSingleChanges = (changes = []) => {
    if (!Array.isArray(changes) || changes.length === 0) return null;
    return (
      <div className="modalChanges">
        <h4>Changes</h4>
        {changes.map((ch, i) => (
          <div key={i} className="changeRow">
            <div className="changeLabel">{ch.label ?? ch.column_id}</div>
            <div className="changeValues">
              <div className="old">
                Old: <span>{formatValue(ch.old)}</span>
              </div>
              <div className="new">
                New: <span>{formatValue(ch.new)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBulkFields = (fields = []) => {
    if (!Array.isArray(fields) || fields.length === 0) return null;

    return (
      <div className="modalFieldsTouched">
        <h4>Fields updated</h4>
        <div className="fieldsGrid">
          {fields.map((f, i) => {
            let rawVal = f.value;
            const isObject =
              rawVal !== null &&
              rawVal !== undefined &&
              typeof rawVal === "object";

            // detect alert object structure
            const isAlertObj =
              isObject &&
              rawVal &&
              typeof rawVal.date === "string" &&
              typeof rawVal.is_complete === "boolean";

            let formattedValue;

            if (isAlertObj) {
              const status = rawVal.is_complete ? "Complete" : "Incomplete";
              formattedValue = `${rawVal.date} (${status})`;
            } else {
              formattedValue = formatValue(rawVal);
            }

            return (
              <div key={i} className="fieldRowTwoCol">
                <div className="fieldLabelTwoCol">{f.label ?? f.column_id}</div>
                <div className="fieldValueTwoCol">
                  <div className="fieldText" title={formattedValue}>
                    {formattedValue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAffectedList = (affected = []) => {
    if (!Array.isArray(affected) || affected.length === 0) return null;

    const sample = showAllAffected ? affected : affected.slice(0, 20);

    return (
      <div className="modalAffected">
        <h4>
          Affected clients <span className="muted">({affected.length})</span>
          {!showAllAffected && affected.length > 20 && (
            <small className="muted" style={{ marginLeft: 8 }}>
              (showing 20)
            </small>
          )}
        </h4>

        <div className="affectedGrid" role="list">
          {sample.map((a, i) => {
            // prefer client_name (if provided in metadata), then serial_number, then client_id
            const display =
              a.client_name ??
              a.client_name_display ??
              a.serial_number ??
              a.client_id ??
              "-";
            return (
              <div
                key={a.client_id ?? `${i}`}
                className="affectedItem"
                role="listitem"
              >
                <div className="affectedName" title={display}>
                  {display}
                </div>
                {/* {a.serial_number && (
                  <div className="affectedSerial muted">{a.serial_number}</div>
                )} */}
              </div>
            );
          })}
        </div>

        {affected.length > 20 && (
          <div className="affectedFooter">
            <button
              type="button"
              className="showMoreBtn"
              onClick={() => setShowAllAffected((s) => !s)}
            >
              {showAllAffected ? "Show less" : `Show all (${affected.length})`}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Helper to build display title: "Action — Group Name" when available
  const buildLogTitle = (log) => {
    if (!log) return "";
    const action = log.action ?? "Action";
    const groupId = log.subject_id ?? log.client_group ?? null;
    const groupName = groupId
      ? getGroupName(groupId)
      : log.client_group_name ?? null;
    return groupName ? `${action} — ${groupName}` : action;
  };

  return (
    <div className="logs-page-container" aria-busy={loading ? "true" : "false"}>
      <header className="page-header">
        <h1 className="title">Logs</h1>
        <p className="subtitle">
          View activity logs. Toggle between your logs and company logs (if
          permitted).
        </p>
      </header>

      <div className="controls">
        <div className="modeToggle">
          {canViewAll ? (
            <>
              <button
                type="button"
                className={mode === "mine" ? "modeBtnActive" : "modeBtn"}
                onClick={() => {
                  setMode("mine");
                }}
              >
                My logs
              </button>
              <button
                type="button"
                className={mode === "all" ? "modeBtnActive" : "modeBtn"}
                onClick={() => {
                  setMode("all");
                }}
              >
                Company logs
              </button>
            </>
          ) : (
            <div className="modeLabel">Showing: My logs</div>
          )}
        </div>

        <div className="filters">
          <DropdownField
            value={section}
            dropdownList={["all", ...Object.keys(SECTION_MAP)]}
            onChange={(val) => setSection(val)}
            width={"200px"}
          />

          <div className="search-wrapper" style={{ position: "relative" }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-bar"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchEnter}
            />
          </div>
        </div>
      </div>

      <div className="legend">
        {Object.entries(SECTION_MAP).map(([key, color]) => (
          <div key={key} className="legendItem">
            <span className="legendSwatch" style={{ background: color }} />
            <span className="legendLabel">{key}</span>
          </div>
        ))}
      </div>

      <div className="logs-container">
        <div className="cardsWrap" role="list">
          {loading && (!logs || logs.length === 0) ? (
            <div className="loading">Loading...</div>
          ) : logs && logs.length > 0 ? (
            logs.map((log, idx) => {
              const sec = log.section ?? "Unknown";
              const color = SECTION_MAP[sec] ?? "#9b9b9b";
              const key =
                log.log_id ?? log.id ?? `${log.created_at ?? ""}-${idx}`;

              const title = buildLogTitle(log);
              return (
                <article
                  key={key}
                  className="card"
                  role="listitem"
                  aria-label={`Log ${log.action ?? ""}`}
                  onClick={() => {
                    setSelectedLog(log);
                    setOpenModal(true);
                  }}
                >
                  <div className="cardHeader">
                    <div className="cardTitle" style={{ color }}>
                      {title}
                    </div>
                  </div>

                  <div className="cardBody">
                    <div className="cardText">
                      {log.text ?? log.message ?? "-"}
                    </div>

                    <div className="cardMeta">
                      <span>{localeDate(log.created_at ?? log.createdAt)}</span>
                    </div>
                  </div>

                  <div className="corner" style={{ borderRightColor: color }} />
                </article>
              );
            })
          ) : (
            <div className="empty">No logs found.</div>
          )}
        </div>
      </div>

      {/* Modal: show metadata when selectedLog is set */}
      {openModal && selectedLog && (
        <div className="logModalOverlay" aria-modal="true" role="dialog">
          <div className="logModal" ref={modalRef}>
            <div className="logModalHeader">
              <h3>{buildLogTitle(selectedLog)}</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => {
                  setSelectedLog(null);
                  setOpenModal(false);
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="logModalBody">
              <div className="modalMainText">{selectedLog.text ?? "-"}</div>

              <div className="modalMeta">
                <div className="metaRow">
                  <strong>When:</strong>{" "}
                  <span>
                    {localeDate(
                      selectedLog.created_at ?? selectedLog.createdAt
                    )}
                  </span>
                </div>

                <div className="metaRow">
                  <strong>User:</strong>{" "}
                  <span>
                    {(() => {
                      const u = allCompanyUsers?.find(
                        (x) => x.user_id === selectedLog.user_id
                      );
                      return u ? `${u.first_name} ${u.last_name}` : "-";
                    })()}
                  </span>
                </div>

                {/* show group name */}
                {(selectedLog.subject_id ||
                  selectedLog.client_group_name) && (
                  <div className="metaRow">
                    <strong>Group:</strong>{" "}
                    <span>
                      {selectedLog.client_group_name ??
                        getGroupName(selectedLog.subject_id)}
                    </span>
                  </div>
                )}

                {/* Single-update serial number */}
                {selectedLog.metadata?.serial_number && (
                  <div className="metaRow">
                    <strong>Serial Number</strong>{" "}
                    <span>{selectedLog.metadata.serial_number}</span>
                  </div>
                )}

                {/* Single-update client name */}
                {selectedLog.metadata?.client_name && (
                  <div className="metaRow">
                    <strong>Client</strong>{" "}
                    <span>{selectedLog.metadata.client_name}</span>
                  </div>
                )}
              </div>

              {/* Render single-update changes if present */}
              {selectedLog.metadata?.changes &&
                Array.isArray(selectedLog.metadata.changes) &&
                selectedLog.metadata.changes.length > 0 &&
                renderSingleChanges(selectedLog.metadata.changes)}

              {/* Render bulk-update fields if present */}
              {selectedLog.metadata?.type === "bulk_update" &&
                renderBulkFields(selectedLog.metadata.fields)}

              {/* Render affected for bulk updates (with toggle) */}
              {selectedLog.metadata?.type === "bulk_update" &&
                renderAffectedList(selectedLog.metadata.affected)}

              {/* Fallback: show raw metadata if nothing else rendered */}
              {!selectedLog.metadata && (
                <div style={{ marginTop: 12, color: "#666" }}>
                  No metadata attached to this log.
                </div>
              )}
            </div>

            <div className="logModalFooter">
              <ActionButton
                label="Close"
                onClick={() => {
                  setSelectedLog(null);
                  setOpenModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
