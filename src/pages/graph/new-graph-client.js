import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { ActionButton } from "@/components/Misc/ActionButton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSelectAllClientGroups } from "../../../redux/slices/clientGroupSlice";
import {
  generateGraph,
  generateGraphData,
} from "../../../redux/slices/graphSlice";

export default function NewGraphClient() {
  return <div>Test</div>
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const allGroups = useSelectAllClientGroups();

//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [dropdownOptions, setDropdownOptions] = useState({
//     xAxis: [],
//     yAxis: [],
//     series: [],
//   });

//   const [graphSettings, setGraphSettings] = useState({
//     xAxis: { id: "", label: "", field_type: "", ticks: [], tickSize: 12 },
//     yAxis: {
//       id: "",
//       label: "",
//       field_type: "",
//       title: "Value",
//       unit: "RM",
//       ids: [],
//     },
//     series: { id: "", label: "", field_type: "", ids: [] },
//     general: {
//       allowDecimal: true,
//       monotype: "default",
//       dateRange: "week",
//       publishStatus: "unpublished",
//     },
//     meta: {
//       graphName: "",
//       graphDescription: "",
//       selectedSource: "Client",
//       selectedClientGroup: "",
//     },
//     activeTab: "date",
//     targetX: "",
//     targetY: "",
//     targetSeries: "",
//   });

//   const [chartData, setChartData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // ----------------- EFFECTS -----------------
//   useEffect(() => {
//     if (!selectedGroup) return;

//     const options = {
//       xAxis: getDropdownOptions(selectedGroup.columns),
//       yAxis: getDropdownOptions(selectedGroup.columns),
//       series: getDropdownOptions(selectedGroup.columns),
//     };

//     setDropdownOptions(options);

//     // reset selections
//     setGraphSettings((prev) => ({
//       ...prev,
//       xAxis: { ...prev.xAxis, id: "", label: "", field_type: "" },
//       yAxis: { ...prev.yAxis, id: "", label: "", field_type: "" },
//       series: { ...prev.series, id: "", label: "", field_type: "" },
//     }));
//   }, [selectedGroup]);

//   useEffect(() => {
//     const initializeFields = async () => {
//       try {
//         const fields = await graphApiService.getAvailableFields();
//         setGraphSettings((prev) => ({
//           ...prev,
//           yAxis: { ...prev.yAxis, ids: fields.yKeys },
//           series: { ...prev.series, ids: fields.seriesKeys },
//         }));
//       } catch (err) {
//         setError("Failed to load available fields");
//       }
//     };
//     initializeFields();
//   }, []);

//   // ----------------- HANDLERS -----------------
//   const handleGenerateGraph = async () => {
//     setIsLoading(true);
//     setError(null);
//     const payload = {
//       xAxis: graphSettings.xAxis,
//       yAxis: graphSettings.yAxis,
//     };
//     console.log(graphSettings);
//     dispatch(generateGraphData(payload));
//   };

//   const handleSave = async () => {
//     console.log("Saving graph settings", graphSettings);
//     alert("Graph saved successfully!");
//   };

//   const handlePublishToggle = (status) => {
//     setGraphSettings((prev) => ({
//       ...prev,
//       general: { ...prev.general, publishStatus: status },
//     }));
//   };

//   const updateXAxisTickColor = (tickValue, color) =>
//     setGraphSettings((prev) => ({
//       ...prev,
//       xAxis: {
//         ...prev.xAxis,
//         ticks: prev.xAxis.ticks.map((t) =>
//           t.value === tickValue ? { ...t, color } : t
//         ),
//       },
//     }));

//   const updateYAxisFieldColor = (key, color) =>
//     setGraphSettings((prev) => ({
//       ...prev,
//       yAxis: {
//         ...prev.yAxis,
//         fields: prev.yAxis.ids.map((f) =>
//           f.key === key ? { ...f, color } : f
//         ),
//       },
//     }));

//   const updateSeriesFieldColor = (key, color) =>
//     setGraphSettings((prev) => ({
//       ...prev,
//       series: {
//         ...prev.series,
//         fields: prev.series.ids.map((f) =>
//           f.key === key ? { ...f, color } : f
//         ),
//       },
//     }));

//   const CustomXAxisTick = ({ x, y, payload }) => {
//     const tick = graphSettings.xAxis.ticks.find(
//       (t) => t.value === payload.value
//     );
//     return (
//       <text x={x} y={y + 12} fill={tick?.color || "#000"} textAnchor="middle">
//         {payload.value}
//       </text>
//     );
//   };

//   const getDropdownOptions = (columns) => {
//     return columns.map((col) => ({ id: col.column_id, label: col.label, field_type: col.field_type }));
//   };

//   // ----------------- RENDER FUNCTIONS -----------------
//   const renderTabContent = () => {
//     const { activeTab, targetX, targetY, targetSeries } = graphSettings;
//     switch (activeTab) {
//       case "date":
//         return (
//           <>
//             <div className="setting-group">
//               <label>Date Range</label>
//               <select
//                 value={graphSettings.general.dateRange}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     general: { ...prev.general, dateRange: e.target.value },
//                   }))
//                 }
//                 className="setting-select"
//               >
//                 {["day", "week", "month", "year"].map((v) => (
//                   <option key={v} value={v}>
//                     {v.charAt(0).toUpperCase() + v.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="setting-group">
//               <label>Start Date</label>
//               <input
//                 type="date"
//                 className="setting-select"
//                 placeholder="Select start date"
//               />
//             </div>
//             <div className="setting-group">
//               <label>End Date</label>
//               <input
//                 type="date"
//                 className="setting-select"
//                 placeholder="Select end date"
//               />
//             </div>
//           </>
//         );

//       case "xaxis":
//         return (
//           <>
//             <div className="setting-group">
//               <label>Target X Tick</label>
//               <select
//                 value={targetX}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     targetX: e.target.value,
//                   }))
//                 }
//                 className="setting-select"
//               >
//                 <option value="">Select date to customize</option>
//                 {graphSettings.xAxis.ticks.map((t) => (
//                   <option key={t.value} value={t.value}>
//                     {t.value}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {targetX && (
//               <div className="setting-group">
//                 <label>Color for {targetX}</label>
//                 <div className="color-input-group">
//                   <input
//                     type="color"
//                     value={
//                       graphSettings.xAxis.ticks.find((t) => t.value === targetX)
//                         ?.color || "#4F46E5"
//                     }
//                     onChange={(e) =>
//                       updateXAxisTickColor(targetX, e.target.value)
//                     }
//                     className="color-picker"
//                   />
//                   <input
//                     type="text"
//                     value={
//                       graphSettings.xAxis.ticks.find((t) => t.value === targetX)
//                         ?.color || "#4F46E5"
//                     }
//                     onChange={(e) =>
//                       updateXAxisTickColor(targetX, e.target.value)
//                     }
//                     className="color-hex"
//                   />
//                 </div>
//               </div>
//             )}
//           </>
//         );

//       case "yaxis":
//         return (
//           <>
//             <div className="setting-group">
//               <label>Y-Axis Title</label>
//               <input
//                 type="text"
//                 value={graphSettings.yAxis.title}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     yAxis: { ...prev.yAxis, title: e.target.value },
//                   }))
//                 }
//                 className="setting-select"
//                 placeholder="Enter Y-axis title"
//               />
//             </div>

//             <div className="setting-group">
//               <label>Y-Axis Unit</label>
//               <input
//                 type="text"
//                 value={graphSettings.yAxis.unit}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     yAxis: { ...prev.yAxis, unit: e.target.value },
//                   }))
//                 }
//                 className="setting-select"
//                 placeholder="e.g., RM, KG, M"
//               />
//             </div>

//             <div className="setting-group">
//               <label>Target Y</label>
//               <select
//                 value={targetY}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     targetY: e.target.value,
//                   }))
//                 }
//                 className="setting-select"
//               >
//                 <option value="">Select Y value to customize</option>
//                 {graphSettings.yAxis.ids.map((key) => (
//                   <option key={key} value={key}>
//                     {key.charAt(0).toUpperCase() + key.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {targetY && (
//               <div className="setting-group">
//                 <label>
//                   Color for {targetY.charAt(0).toUpperCase() + targetY.slice(1)}
//                 </label>
//                 <div className="color-input-group">
//                   <input
//                     type="color"
//                     value={"#4F46E5"} // Default color for now
//                     onChange={(e) =>
//                       updateYAxisFieldColor(targetY, e.target.value)
//                     }
//                     className="color-picker"
//                   />
//                   <input
//                     type="text"
//                     value={"#4F46E5"} // Default color for now
//                     onChange={(e) =>
//                       updateYAxisFieldColor(targetY, e.target.value)
//                     }
//                     className="color-hex"
//                   />
//                 </div>
//               </div>
//             )}
//           </>
//         );

//       case "series":
//         return (
//           <>
//             <div className="setting-group">
//               <label>Target Series</label>
//               <select
//                 value={targetSeries}
//                 onChange={(e) =>
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     targetSeries: e.target.value,
//                   }))
//                 }
//                 className="setting-select"
//               >
//                 <option value="">Select series to customize</option>
//                 {graphSettings.series.ids.map((key) => (
//                   <option key={key} value={key}>
//                     {key.charAt(0).toUpperCase() + key.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {targetSeries && (
//               <div className="setting-group">
//                 <label>
//                   Color for{" "}
//                   {targetSeries.charAt(0).toUpperCase() + targetSeries.slice(1)}
//                 </label>
//                 <div className="color-input-group">
//                   <input
//                     type="color"
//                     value={"#4F46E5"} // Default color for now
//                     onChange={(e) =>
//                       updateSeriesFieldColor(targetSeries, e.target.value)
//                     }
//                     className="color-picker"
//                   />
//                   <input
//                     type="text"
//                     value={"#4F46E5"} // Default color for now
//                     onChange={(e) =>
//                       updateSeriesFieldColor(targetSeries, e.target.value)
//                     }
//                     className="color-hex"
//                   />
//                 </div>
//               </div>
//             )}
//           </>
//         );

//       default:
//         return null;
//     }
//   };

//   // ----------------- RENDER -----------------
//   return (
//     <div className="new-graph-client-container">
//       <div className="title-container">
//         <h1>New Graph</h1>
//       </div>

//       {/* Graph header with actions */}
//       <div className="graph-header">
//         <div className="graph-actions">
//           <ActionButton
//             type="primary"
//             onClick={() => router.back()}
//             label={"Target Members"}
//           />

//           {/* Publish/Unpublish Toggle */}
//           <div className="publish-toggle">
//             <button
//               className={`action-btn ${
//                 graphSettings.general.publishStatus === "unpublished"
//                   ? "active"
//                   : ""
//               }`}
//               onClick={() => handlePublishToggle("unpublished")}
//             >
//               Unpublish
//             </button>
//             <button
//               className={`action-btn ${
//                 graphSettings.general.publishStatus === "published"
//                   ? "active publish-btn"
//                   : ""
//               }`}
//               onClick={() => handlePublishToggle("published")}
//             >
//               Publish
//             </button>
//           </div>
//         </div>

//         <div className="settings-actions">
//           <ActionButton
//             type="secondary"
//             onClick={() => router.back()}
//             label={"Back"}
//           />
//           <ActionButton
//             type="primary"
//             onClick={handleGenerateGraph}
//             label={isLoading ? "Generating..." : "Generate Graph"}
//             disabled={isLoading}
//           />
//           <ActionButton
//             type="primary"
//             onClick={handleSave}
//             label={"Save Graph"}
//           />
//         </div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       <div className="graph-content">
//         {/* Left side - Graph visualization */}
//         <div className="graph-visualization">
//           <div className="graph-config-fields">
//             <PlainTextField
//               label="Graph Name"
//               value={graphSettings.meta.graphName}
//               onChange={(e) =>
//                 setGraphSettings((prev) => ({
//                   ...prev,
//                   meta: { ...prev.meta, graphName: e.target.value },
//                 }))
//               }
//               placeholder="Enter graph name"
//             />
//             <PlainTextField
//               label="Description"
//               value={graphSettings.meta.graphDescription}
//               onChange={(e) =>
//                 setGraphSettings((prev) => ({
//                   ...prev,
//                   meta: { ...prev.meta, graphDescription: e.target.value },
//                 }))
//               }
//               placeholder="Enter description"
//               multiline
//             />
//           </div>

//           {/* Graph chart area */}
//           <div className="graph-chart">
//             {isLoading ? (
//               <div className="loading-placeholder">
//                 Generating graph data...
//               </div>
//             ) : chartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={chartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis
//                     dataKey={graphSettings.xAxis.id}
//                     allowDecimals={graphSettings.general.allowDecimal}
//                     tick={<CustomXAxisTick />}
//                   />
//                   <YAxis
//                     allowDecimals={graphSettings.general.allowDecimal}
//                     label={{
//                       value: `${graphSettings.yAxis.title} (${graphSettings.yAxis.unit})`,
//                       angle: -90,
//                       position: "insideLeft",
//                       offset: -10,
//                     }}
//                   />
//                   <Tooltip />
//                   <Legend />

//                   {graphSettings.series.ids.map((series) =>
//                     graphSettings.yAxis.ids.map((yKey) => {
//                       const key = `${series}_${yKey}`;
//                       return (
//                         <Line
//                           key={key}
//                           type="monotone"
//                           dataKey={key}
//                           stroke="#4F46E5"
//                           strokeWidth={2}
//                           dot={{ fill: "#4F46E5", strokeWidth: 2 }}
//                           name={`${
//                             series.charAt(0).toUpperCase() + series.slice(1)
//                           } - ${yKey.charAt(0).toUpperCase() + yKey.slice(1)}`}
//                         />
//                       );
//                     })
//                   )}
//                 </LineChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="placeholder">
//                 Click "Generate Graph" to fetch chart data
//               </div>
//             )}
//           </div>

//           {/* Source selection */}
//           <div className="source-section">
//             <div className="source-label">
//               Source = {graphSettings.meta.selectedSource} /
//             </div>
//             <select
//               value={graphSettings.meta.selectedClientGroup}
//               onChange={(e) => {
//                 const selectedGroup = allGroups.find(
//                   (g) => g.client_group_id === e.target.value
//                 );
//                 setSelectedGroup(selectedGroup);
//                 setGraphSettings((prev) => ({
//                   ...prev,
//                   meta: { ...prev.meta, selectedClientGroup: e.target.value },
//                 }));
//               }}
//               className="client-group-select"
//             >
//               <option value="">Select a Group</option>
//               {allGroups.map((g) => (
//                 <option key={g.client_group_id} value={g.client_group_id}>
//                   {g.client_group_name}
//                 </option>
//               ))}
//             </select>
//             <div className="fields-info">X, Y, Series = Fields</div>
//           </div>
//         </div>

//         {/* Right side - Settings panel */}
//         <div className="graph-settings">
//           <div className="settings-section">
//             <h3>Line Source</h3>

//             <div className="setting-group">
//               <label>Group</label>
//               <select
//                 value={graphSettings.meta.selectedClientGroup}
//                 onChange={(e) => {
//                   const selectedGroup = allGroups.find(
//                     (g) => g.client_group_id === e.target.value
//                   );
//                   setSelectedGroup(selectedGroup);
//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     meta: { ...prev.meta, selectedClientGroup: e.target.value },
//                   }));
//                 }}
//                 className="setting-select"
//               >
//                 <option value="">Select a Group</option>
//                 {allGroups.map((g) => (
//                   <option key={g.client_group_id} value={g.client_group_id}>
//                     {g.client_group_name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="setting-group">
//               <label>X Axis</label>
//               <select
//                 value={graphSettings.xAxis.id}
//                 onChange={(e) => {
//                   const selectedOption = dropdownOptions.xAxis.find(
//                     (o) => o.id === e.target.value
//                   );

//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     xAxis: {
//                       ...prev.xAxis,
//                       id: e.target.value,
//                       label: selectedOption?.label || "",
//                       field_type: selectedOption?.field_type || "", // <-- set field_type from selected option
//                     },
//                   }));
//                 }}
//                 className="setting-select"
//               >
//                 <option value="">Select X Axis</option>
//                 {dropdownOptions.xAxis.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="setting-group">
//               <label>Y Axis</label>
//               <select
//                 value={graphSettings.yAxis.id}
//                 onChange={(e) => {
//                   const selectedOption = dropdownOptions.yAxis.find(
//                     (o) => o.id === e.target.value
//                   );

//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     yAxis: {
//                       ...prev.yAxis,
//                       id: e.target.value,
//                       label: selectedOption?.label || "",
//                       field_type: selectedOption?.field_type || "", // <-- set field_type from selected option
//                     },
//                   }));
//                 }}
//                 className="setting-select"
//               >
//                 <option value="">Select X Axis</option>
//                 {dropdownOptions.yAxis.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="setting-group">
//               <label>Series</label>
//               <select
//                 value={graphSettings.series.id}
//                 onChange={(e) => {
//                   const selectedOption = dropdownOptions.series.find(
//                     (o) => o.id === e.target.value
//                   );

//                   setGraphSettings((prev) => ({
//                     ...prev,
//                     series: {
//                       ...prev.series,
//                       id: e.target.value,
//                       label: selectedOption?.label || "",
//                       field_type: selectedOption?.field_type || "", // <-- set field_type from selected option
//                     },
//                   }));
//                 }}
//                 className="setting-select"
//               >
//                 <option value="">Select X Axis</option>
//                 {dropdownOptions.series.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {selectedGroup ? (
//             <div className="settings-section">
//               <h3>Settings</h3>

//               <div className="settings-tabs">
//                 <button
//                   className={`tab ${
//                     graphSettings.activeTab === "date" ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setGraphSettings((prev) => ({ ...prev, activeTab: "date" }))
//                   }
//                 >
//                   Date Settings
//                 </button>
//                 <button
//                   className={`tab ${
//                     graphSettings.activeTab === "xaxis" ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setGraphSettings((prev) => ({
//                       ...prev,
//                       activeTab: "xaxis",
//                     }))
//                   }
//                 >
//                   X Axis
//                 </button>
//                 <button
//                   className={`tab ${
//                     graphSettings.activeTab === "yaxis" ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setGraphSettings((prev) => ({
//                       ...prev,
//                       activeTab: "yaxis",
//                     }))
//                   }
//                 >
//                   Y Axis
//                 </button>
//                 <button
//                   className={`tab ${
//                     graphSettings.activeTab === "series" ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setGraphSettings((prev) => ({
//                       ...prev,
//                       activeTab: "series",
//                     }))
//                   }
//                 >
//                   Series
//                 </button>
//               </div>

//               {/* Dynamic tab content */}
//               {renderTabContent()}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
}
