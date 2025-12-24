import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelectAllClientGroups } from "../../../../redux/slices/clientGroupSlice";
import {
  generateGraphData,
  saveGraph,
  useSelectGraphData,
} from "../../../../redux/slices/graphSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
} from "../../../../redux/slices/companySlice";
import MultiSelectDropdownField from "@/components/FormComponents/MultiSelectDropdownField";
import { useSelectUser } from "../../../../redux/slices/authSlice";
import { useSelectAllFormTemplates } from "../../../../redux/slices/formTemplateSlice";

export default function NewGraph() {
  const router = useRouter();
  const dispatch = useDispatch();
  const allGroups = useSelectAllClientGroups();
  const allForms = useSelectAllFormTemplates();

  const graphData = useSelectGraphData();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();
  const { source } = router.query;

  const isFormSource = source === "form";
  const isGroupSource = source === "group";

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartMeta, setChartMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSourceEntity, setSelectedSourceEntity] = useState(null);

  const [graphSettings, setGraphSettings] = useState({
    xAxis: { id: "", label: "", field_type: "", ticks: [] },
    yAxis: { id: "", label: "", field_type: "", title: "Value" },
    series: { id: "", label: "", field_type: "" },
    general: {
      monotype: "line",
      publishStatus: "published",
    },
    meta: {
      graphName: "",
      graphDescription: "",
      selectedSource: "Client",
      selectedClientGroup: "",
    },
    dateFilter: {
      dateColumnId: "",
      range: "all",
    },
    sort: {
      by: "x",
      order: "asc",
    },
    viewableMembers: [],
  });

  // ================= EFFECTS =================

  useEffect(() => {
    if (graphData?.data) {
      setChartData(graphData.data);
      setChartMeta(graphData.meta || null);
      setIsLoading(false);
    }
  }, [graphData]);

  // ================= HELPERS =================

  const memberOptions = useMemo(() => {
    return allCompanyUsers.map((u) => ({
      value: u.user_id, // ONLY ID
      label: `${u.first_name} ${u.last_name}`, // display only
    }));
  }, [allCompanyUsers]);

  const normalizedColumns = useMemo(() => {
    if (!selectedSourceEntity?.raw) return [];

    // ===== FORM SOURCE =====
    if (isFormSource) {
      return (
        selectedSourceEntity.raw.questions?.map((q) => ({
          id: q.form_question_id,
          label: q.label,
          field_type: q.field_type,
          options: q.options,
        })) || []
      );
    }

    // ===== GROUP SOURCE (existing behavior) =====
    return (
      selectedSourceEntity.raw.columns?.map((c) => ({
        id: c.column_id,
        label: c.label,
        field_type: c.field_type,
      })) || []
    );
  }, [selectedSourceEntity, isFormSource]);

  const dateColumns = useMemo(() => {
    return normalizedColumns.filter((c) => c.field_type === "date");
  }, [normalizedColumns]);

  // Detect series from backend data shape (NOT user selection)
  const hasSeries = useMemo(() => {
    if (!chartData.length) return false;
    return Object.keys(chartData[0]).some((k) => k !== "x" && k !== "y");
  }, [chartData]);

  const COLORS = [
    "#4F46E5",
    "#16A34A",
    "#DC2626",
    "#EA580C",
    "#0891B2",
    "#9333EA",
  ];

  const [activeSeriesKey, setActiveSeriesKey] = useState("");

  const [visualSettings, setVisualSettings] = useState({
    global: {
      tickFontSize: 11,
      labelFontSize: 11,
    },
    single: {
      color: "#4F46E5",
      strokeWidth: 2,
      fillOpacity: 0.3,
    },
    series: {},
  });

  const seriesKeys = useMemo(() => {
    if (!chartData.length) return [];

    const set = new Set();

    chartData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== "x" && k !== "y") {
          set.add(k);
        }
      });
    });

    return Array.from(set);
  }, [chartData]);

  useEffect(() => {
    if (hasSeries && seriesKeys.length && !activeSeriesKey) {
      setActiveSeriesKey(seriesKeys[0]);
    }
  }, [hasSeries, seriesKeys, activeSeriesKey]);

  useEffect(() => {
    if (!hasSeries) return;

    setVisualSettings((prev) => {
      const next = { ...prev, series: { ...prev.series } };

      seriesKeys.forEach((k, idx) => {
        if (!next.series[k]) {
          next.series[k] = {
            color: COLORS[idx % COLORS.length],
            label: k,
            strokeWidth: 2,
            fillOpacity: 0.3,
          };
        }
      });

      return next;
    });
  }, [seriesKeys, hasSeries]);

  const sourceOptions = useMemo(() => {
    if (isFormSource) {
      return allForms.map((f) => ({
        id: f.form_template_id,
        label: f.template_name,
        raw: f,
      }));
    }

    return allGroups.map((g) => ({
      id: g.client_group_id,
      label: g.client_group_name,
      raw: g,
    }));
  }, [isFormSource, allForms, allGroups]);

  const normalizedChartData = useMemo(() => {
    if (!chartData.length || !seriesKeys.length) return chartData;

    return chartData.map((row) => {
      const next = { ...row };
      seriesKeys.forEach((k) => {
        if (next[k] == null) next[k] = 0;
      });
      return next;
    });
  }, [chartData, seriesKeys]);

  const CustomXAxisTick = ({ x, y, payload }) => (
    <text
      x={x}
      y={y + 12}
      fill="#000"
      textAnchor="middle"
      style={{ fontSize: 11 }}
    >
      {payload.value}
    </text>
  );

  // ================= HANDLERS =================

  const handleGenerateGraph = () => {
    if (!graphSettings.xAxis.id || !graphSettings.yAxis.id) {
      setError("Please select X Axis and Y Axis");
      return;
    }

    setError(null);
    setIsLoading(true);

    dispatch(
      generateGraphData({
        source,
        source_id: graphSettings.meta.selectedClientGroup,

        xAxis: graphSettings.xAxis,
        yAxis: graphSettings.yAxis,
        series: graphSettings.series.id ? graphSettings.series : null,

        dateFilter: graphSettings.dateFilter,
        sort: graphSettings.sort,
      })
    );
  };

  const handleSaveGraph = () => {
    // Basic validation
    if (!graphSettings.xAxis.id || !graphSettings.yAxis.id) {
      setError("Please select X Axis and Y Axis");
      return;
    }

    if (!graphSettings.meta.selectedClientGroup) {
      setError("Please select a Client Group");
      return;
    }

    if (!graphSettings.meta.graphName) {
      setError("Graph name is required");
      return;
    }

    setError(null);
    setIsLoading(true);

    const payload = {
      router,
      user_id: user?.uid,
      company_id: currCompanyId,

      graph_source: source, // group | form
      source_id: graphSettings.meta.selectedClientGroup,

      title: graphSettings.meta.graphName,
      description: graphSettings.meta.graphDescription,

      chart_type: graphSettings.general.monotype,

      xAxis: graphSettings.xAxis,
      yAxis: graphSettings.yAxis,
      series: graphSettings.series.id ? graphSettings.series : null,

      sort: graphSettings.sort,
      dateFilter: graphSettings.dateFilter,

      visualSettings,
      viewableMembers: graphSettings.viewableMembers,

      is_publish: graphSettings.general.publishStatus === "published",
    };

    dispatch(saveGraph(payload));
  };

  // ================= RENDER =================

  return (
    <div className="new-graph-container">
      <div className="title-container">
        <h1>New Graph</h1>
      </div>

      {/* GRAPH HEADER */}
      <div className="graph-header">
        <div className="graph-actions">

          <div className="publish-toggle">
            <button
              className={`action-btn ${
                graphSettings.general.publishStatus === "unpublished"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setGraphSettings((p) => ({
                  ...p,
                  general: { ...p.general, publishStatus: "unpublished" },
                }))
              }
            >
              Unpublish
            </button>
            <button
              className={`action-btn ${
                graphSettings.general.publishStatus === "published"
                  ? "active publish-btn"
                  : ""
              }`}
              onClick={() =>
                setGraphSettings((p) => ({
                  ...p,
                  general: { ...p.general, publishStatus: "published" },
                }))
              }
            >
              Publish
            </button>
          </div>
        </div>

        <div className="settings-actions">
          <ActionButton
            type="secondary"
            onClick={() => router.back()}
            label="Back"
          />
          <ActionButton
            type="primary"
            onClick={handleGenerateGraph}
            label={isLoading ? "Generating..." : "Generate Graph"}
          />
          <ActionButton
            type="primary"
            onClick={handleSaveGraph}
            label={"Save Graph"}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="graph-content">
        {/* LEFT PANEL */}
        <div className="graph-visualization">
          <div className="graph-config-fields">
            <PlainTextField
              label="Graph Name"
              value={graphSettings.meta.graphName}
              onChange={(value) =>
                setGraphSettings((p) => ({
                  ...p,
                  meta: { ...p.meta, graphName: value },
                }))
              }
            />

            <PlainTextField
              label="Description"
              multiline
              value={graphSettings.meta.graphDescription}
              onChange={(value) =>
                setGraphSettings((p) => ({
                  ...p,
                  meta: { ...p.meta, graphDescription: value },
                }))
              }
            />
          </div>

          {/* GRAPH */}
          <div className="graph-chart">
            {isLoading ? (
              <div className="loading-placeholder">
                Generating graph data...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                {graphSettings.general.monotype === "line" && (
                  <LineChart data={normalizedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tick={<CustomXAxisTick />} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      itemStyle={{ fontSize: 11 }}
                      labelStyle={{ fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />

                    {!hasSeries && (
                      <Line
                        dataKey="y"
                        stroke={visualSettings.single.color}
                        strokeWidth={visualSettings.single.strokeWidth}
                      />
                    )}

                    {hasSeries &&
                      seriesKeys.map((k, idx) => (
                        <Line
                          key={k}
                          dataKey={k}
                          name={visualSettings.series[k]?.label || k}
                          stroke={visualSettings.series[k]?.color}
                          strokeWidth={visualSettings.series[k]?.strokeWidth}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                )}

                {graphSettings.general.monotype === "bar" && (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      itemStyle={{ fontSize: 11 }}
                      labelStyle={{ fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />

                    {!hasSeries && <Bar dataKey="y" fill="#4F46E5" />}

                    {hasSeries &&
                      seriesKeys.map((k, idx) => (
                        <Bar
                          key={k}
                          dataKey={k}
                          name={visualSettings.series[k]?.label || k}
                          fill={visualSettings.series[k]?.color}
                        />
                      ))}
                  </BarChart>
                )}

                {graphSettings.general.monotype === "area" && (
                  <AreaChart data={normalizedChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      itemStyle={{ fontSize: 11 }}
                      labelStyle={{ fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />

                    {!hasSeries && (
                      <Area dataKey="y" fill="#4F46E5" fillOpacity={0.3} />
                    )}

                    {hasSeries &&
                      seriesKeys.map((k, idx) => (
                        <Area
                          key={k}
                          dataKey={k}
                          name={visualSettings.series[k]?.label || k}
                          stroke={visualSettings.series[k]?.color}
                          fill={visualSettings.series[k]?.color}
                          fillOpacity={visualSettings.series[k]?.fillOpacity}
                        />
                      ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="placeholder">
                Click "Generate Graph" to fetch chart data
              </div>
            )}
          </div>

          {/* SOURCE */}
          <div className="source-section">
            <div className="source-label">
              Source = {graphSettings.meta.selectedSource} /
            </div>
            <select
              value={graphSettings.meta.selectedClientGroup}
              onChange={(e) => {
                const entity = sourceOptions.find(
                  (s) => s.id === e.target.value
                );

                setSelectedSourceEntity(entity || null);

                setGraphSettings((p) => ({
                  ...p,
                  meta: {
                    ...p.meta,
                    selectedClientGroup: e.target.value,
                  },
                }));
              }}
              className="client-group-select"
            >
              <option value="">
                Select a {isFormSource ? "Form" : "Group"}
              </option>

              {sourceOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="graph-settings">
          <div className="settings-section">
            <h3>Settings</h3>

            <div className="setting-group">
              <label>X Axis</label>
              <select
                value={graphSettings.xAxis.id}
                onChange={(e) => {
                  const opt = normalizedColumns.find(
                    (o) => o.id === e.target.value
                  );
                  setGraphSettings((p) => ({
                    ...p,
                    xAxis: { ...opt, ticks: [] },
                  }));
                }}
                className="setting-select"
              >
                <option value="">Select X Axis</option>
                {normalizedColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-group">
              <label>Y Axis (Numeric)</label>
              <select
                value={graphSettings.yAxis.id}
                onChange={(e) => {
                  const opt = normalizedColumns.find(
                    (o) => o.id === e.target.value
                  );
                  setGraphSettings((p) => ({
                    ...p,
                    yAxis: { ...p.yAxis, ...opt },
                  }));
                }}
                className="setting-select"
              >
                <option value="">Select Y Axis</option>
                {normalizedColumns
                  .filter((c) => c.field_type === "number")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="setting-group">
              <label>Series (Optional)</label>
              <select
                value={graphSettings.series.id}
                onChange={(e) => {
                  const opt = normalizedColumns.find(
                    (o) => o.id === e.target.value
                  );
                  setGraphSettings((p) => ({
                    ...p,
                    series: opt || { id: "", label: "", field_type: "" },
                  }));
                }}
                className="setting-select"
              >
                <option value="">None</option>
                {normalizedColumns
                  .filter((c) => c.field_type !== "number")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="setting-group">
              <label>Chart Type</label>
              <div className="setting-group">
                <select
                  value={graphSettings.general.monotype}
                  onChange={(e) =>
                    setGraphSettings((p) => ({
                      ...p,
                      general: { ...p.general, monotype: e.target.value },
                    }))
                  }
                  className="setting-select"
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                  <option value="area">Area</option>
                </select>
              </div>
            </div>

            <div className="setting-group">
              <label>Sort</label>

              {/* SORT BY */}
              <select
                className="setting-select"
                value={graphSettings.sort.by}
                onChange={(e) =>
                  setGraphSettings((p) => ({
                    ...p,
                    sort: { ...p.sort, by: e.target.value },
                  }))
                }
              >
                <option value="x">X Axis</option>
                <option value="y">Y Value</option>
              </select>

              {/* SORT ORDER */}
              <select
                className="setting-select"
                value={graphSettings.sort.order}
                onChange={(e) =>
                  setGraphSettings((p) => ({
                    ...p,
                    sort: { ...p.sort, order: e.target.value },
                  }))
                }
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Date</label>

              {/* DATE COLUMN SELECT */}
              <select
                className="setting-select"
                value={graphSettings.dateFilter.dateColumnId}
                onChange={(e) =>
                  setGraphSettings((p) => ({
                    ...p,
                    dateFilter: {
                      ...p.dateFilter,
                      dateColumnId: e.target.value,
                    },
                  }))
                }
              >
                <option value="">Select date column</option>
                {dateColumns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* DATE RANGE SELECT */}
              <select
                className="setting-select"
                value={graphSettings.dateFilter.range}
                onChange={(e) =>
                  setGraphSettings((p) => ({
                    ...p,
                    dateFilter: {
                      ...p.dateFilter,
                      range: e.target.value,
                    },
                  }))
                }
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="1m">Last 1 Month</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last 1 Year</option>
              </select>
            </div>
          </div>

          {hasSeries && (
            <div className="settings-section">
              <h3>Series Appearance</h3>

              {/* SERIES SELECTOR */}
              <div className="setting-group">
                <label>Select Series</label>
                <select
                  className="setting-select"
                  value={activeSeriesKey}
                  onChange={(e) => setActiveSeriesKey(e.target.value)}
                >
                  <option value="">Select series</option>
                  {seriesKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* SERIES CONTROLS */}
              {activeSeriesKey && (
                <div className="setting-group">
                  <label>Color</label>
                  <input
                    className="setting-color-input"
                    type="color"
                    value={visualSettings.series[activeSeriesKey]?.color}
                    onChange={(e) =>
                      setVisualSettings((p) => ({
                        ...p,
                        series: {
                          ...p.series,
                          [activeSeriesKey]: {
                            ...p.series[activeSeriesKey],
                            color: e.target.value,
                          },
                        },
                      }))
                    }
                  />

                  {graphSettings.general.monotype !== "bar" &&
                    graphSettings.general.monotype !== "area" && (
                      <>
                        <label>Stroke Width</label>
                        <input
                          className="setting-input"
                          type="number"
                          min="1"
                          max="6"
                          value={
                            visualSettings.series[activeSeriesKey]?.strokeWidth
                          }
                          onChange={(e) =>
                            setVisualSettings((p) => ({
                              ...p,
                              series: {
                                ...p.series,
                                [activeSeriesKey]: {
                                  ...p.series[activeSeriesKey],
                                  strokeWidth: +e.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </>
                    )}
                </div>
              )}
            </div>
          )}
          <div className="settings-section">
            <h3>Viewable Member</h3>

            <div className="setting-group">
              <MultiSelectDropdownField
                selected={graphSettings.viewableMembers}
                options={memberOptions}
                placeholder="Select members"
                width="100%"
                onChange={(userId) =>
                  setGraphSettings((p) => ({
                    ...p,
                    viewableMembers: [...p.viewableMembers, userId],
                  }))
                }
                onRemove={(userId) =>
                  setGraphSettings((p) => ({
                    ...p,
                    viewableMembers: p.viewableMembers.filter(
                      (id) => id !== userId
                    ),
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
