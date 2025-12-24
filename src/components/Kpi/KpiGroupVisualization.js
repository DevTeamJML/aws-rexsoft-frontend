import { useEffect, useMemo, useState } from "react";
import { SampleKpiChart } from "./SampleKpiChart";

export default function KpiGroupVisualization({
  kpis = [],
  visualization,
  setVisualization,
}) {
  const [activeKpiId, setActiveKpiId] = useState(kpis[0]?.kpi_id || "");

  /* ============================
     SYNC SERIES WITH KPIs
  ============================ */
  useEffect(() => {
    if (!kpis.length) return;

    setVisualization((prev) => {
      const existingMap = new Map(
        (prev.series || []).map((s) => [s.kpi_id, s])
      );

      const nextSeries = kpis.map((kpi, index) => {
        return (
          existingMap.get(kpi.kpi_id) || {
            kpi_id: kpi.kpi_id,
            label: kpi.title || `KPI ${index + 1}`,
            chart_type: "bar",
            color: "#4F46E5",
            visible: true,
          }
        );
      });

      return {
        ...prev,
        series: nextSeries,
      };
    });

    // ensure active KPI exists
    if (!kpis.find((k) => k.kpi_id === activeKpiId)) {
      setActiveKpiId(kpis[0].kpi_id);
    }
  }, [kpis]);

  /* ============================
     ACTIVE SERIES
  ============================ */

  const activeSeries = useMemo(
    () => visualization.series?.find((s) => s.kpi_id === activeKpiId),
    [visualization.series, activeKpiId]
  );

  const updateSeries = (patch) => {
    setVisualization((prev) => ({
      ...prev,
      series: prev.series.map((s) =>
        s.kpi_id === activeKpiId ? { ...s, ...patch } : s
      ),
    }));
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="graph-content">
      {/* LEFT */}
      {/* <div className="graph-visualization">
        <div className="placeholder">KPI Group Chart Preview</div>
      </div> */}
      <div
        className="graph-visualization"
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
      >
        <div className="sample-hint">
          This is a sample preview. Actual KPI values will be calculated after
          saving.
        </div>

       <SampleKpiChart series={[activeSeries]} />

      </div>

      {/* RIGHT */}
      <div className="graph-settings">
        {/* KPI SELECTOR */}
        <div className="settings-section">
          <h3>Customize KPI</h3>

          <select
            className="select"
            value={activeKpiId}
            onChange={(e) => setActiveKpiId(e.target.value)}
          >
            {kpis.map((kpi) => (
              <option key={kpi.kpi_id} value={kpi.kpi_id}>
                {kpi.title || "Untitled KPI"}
              </option>
            ))}
          </select>
        </div>

        {/* KPI SETTINGS */}
        {activeSeries && (
          <>
            <div className="settings-section">
              <h3>Chart Type</h3>
              <select
                className="select"
                value={activeSeries.chart_type}
                onChange={(e) => updateSeries({ chart_type: e.target.value })}
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="area">Area</option>
              </select>
            </div>

            <div className="settings-section">
              <h3>Appearance</h3>

              <div className="row">
                <label>Color</label>
                <input
                  type="color"
                  value={activeSeries.color}
                  onChange={(e) => updateSeries({ color: e.target.value })}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
