import { useId, useState } from "react";
import "./VibrationHistoryTabs.css";

import { latestVibrations, vibrationSummary, formatValue } from "../utils/vibrationData";
export { latestVibrations } from "../utils/vibrationData";

const colors = ["#2563eb", "#db2777", "#7c3aed", "#d97706", "#059669", "#0891b2"];
const dateText = date => new Date(date).toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "2-digit", timeZone: "UTC"
});
const valueText = value => value.toLocaleString("en-GB", { maximumSignificantDigits: 5 });

export function VibrationGraph({ points, type }) {
  const width = Math.max(640, points.length * 88 + 110);
  const bottom = 280, top = 48, left = 76, right = width - 40;
  const max = Math.max(...points.map(point => point.vibrationValue), 0);
  const ceiling = max > 0 ? max : 1;
  const plotHeight = bottom - top - 24;
  const x = index => points.length === 1 ? (left + right) / 2 : left + 34 + index * (right - left - 68) / (points.length - 1);
  const y = value => bottom - (value / ceiling) * plotHeight;
  const line = points.map((point, index) => x(index) + "," + y(point.vibrationValue)).join(" ");
  return (
    <div className="vht-graph">
      <p className="vht-hint">Latest {points.length} valid readings · Oldest → Newest · Vibration in mm/s</p>
      <div className="vht-scroll" tabIndex={0} aria-label="Scrollable vibration chart">
        <svg width={width} height="360" viewBox={"0 0 " + width + " 360"} role="img"
          aria-label={type + " chart showing " + points.length + " vibration readings"}>
          <title>{type === "bar" ? "Vibration bar chart" : "Vibration line chart"}</title>
          <desc>Readings ordered by test date. Exact values are listed below the chart.</desc>
          {[0, 1, 2, 3, 4].map(tick => {
            const value = ceiling * tick / 4;
            return <g key={tick}>
              <line x1={left - 8} x2={right + 8} y1={y(value)} y2={y(value)} stroke="#cbd5e1" strokeDasharray={tick ? "4 5" : undefined} />
              <text x={left - 16} y={y(value) + 4} textAnchor="end" fontSize="12" fill="#475569">{valueText(value)}</text>
            </g>;
          })}
          <text x="17" y="168" transform="rotate(-90 17 168)" textAnchor="middle" fontSize="12" fill="#475569">Vibration (mm/s)</text>
          {type === "line" && points.length > 1 && <>
            <polygon points={x(0) + "," + bottom + " " + line + " " + x(points.length - 1) + "," + bottom} fill="#7c3aed" opacity=".08" />
            <polyline points={line} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinejoin="round" />
          </>}
          {points.map((point, index) => <g key={point._id || index}>
            {type === "bar" ? <>
              <rect x={x(index) - 24} y={y(point.vibrationValue)} width="48" height={bottom - y(point.vibrationValue)} rx="6" fill={colors[index % colors.length]}>
                <title>{dateText(point.testDate) + ": " + point.vibrationValue + " mm/s"}</title>
              </rect>
              {point.vibrationValue === 0 && <line x1={x(index) - 24} x2={x(index) + 24} y1={bottom} y2={bottom} stroke={colors[index % colors.length]} strokeWidth="3" />}
            </> : <circle cx={x(index)} cy={y(point.vibrationValue)} r="7" fill={colors[index % colors.length]} stroke="#fff" strokeWidth="2">
              <title>{dateText(point.testDate) + ": " + point.vibrationValue + " mm/s"}</title>
            </circle>}
            <text x={x(index)} y={y(point.vibrationValue) - 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{valueText(point.vibrationValue)}</text>
            <text x={x(index)} y="305" textAnchor="middle" fontSize="11" fill="#475569">{dateText(point.testDate)}</text>
            <text x={x(index)} y="322" textAnchor="middle" fontSize="10" fill="#64748b">#{index + 1}</text>
          </g>)}
          <text x={width / 2} y="350" textAnchor="middle" fontSize="12" fill="#475569">Test date · Oldest → Newest</text>
        </svg>
      </div>
      <p className="vht-hint">Scroll sideways if needed. Hover a bar or point for its exact reading.</p>
      <div className="vht-scroll">
        <table className="vht-table">
          <caption>Readings shown in this chart</caption>
          <thead><tr><th>#</th><th>Test date</th><th>Vibration (mm/s)</th></tr></thead>
          <tbody>{points.map((point, index) => <tr key={point._id || index}>
            <td style={{ color: colors[index % colors.length], fontWeight: 700 }}>{index + 1}</td>
            <td>{dateText(point.testDate)}</td><td>{point.vibrationValue}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function VibrationHistoryTabs({ records, loading = false, error = "", children }) {
  const [active, setActive] = useState("history");
  const id = useId();
  const tabs = [{ key: "history", label: "📋 History" }, { key: "bar", label: "📊 Bar Chart" }, { key: "line", label: "📈 Line Chart" }];
  const points = latestVibrations(records);
  const summary = vibrationSummary(records);
  const invalidCount = records.filter(row => latestVibrations([row]).length === 0).length;
  return (
    <section className="vht-section">
      <div className="vht-heading">
        <h3>Vibration History &amp; Trends</h3>
        <div role="tablist" aria-label="Vibration views" className="vht-tabs">
          {tabs.map((tab, index) => <button key={tab.key} type="button" role="tab"
            id={id + "-" + tab.key} aria-controls={id + "-panel"} aria-selected={active === tab.key}
            tabIndex={active === tab.key ? 0 : -1}
            className={"vht-tab vht-" + tab.key + (active === tab.key ? " vht-active" : "")}
            onClick={() => setActive(tab.key)}
            onKeyDown={event => {
              const next = event.key === "ArrowRight" ? (index + 1) % tabs.length :
                event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length :
                event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
              if (next >= 0) { event.preventDefault(); setActive(tabs[next].key); document.getElementById(id + "-" + tabs[next].key)?.focus(); }
            }}>{tab.label}</button>)}
        </div>
      </div>
      {!loading && !error && points.length > 0 && <>
        <div className="vht-summary">
          <div><span>Latest reading</span><strong>{formatValue(summary.latest)} <small>mm/s</small></strong></div>
          <div><span>Change vs previous</span><strong>{summary.change===null?'Not enough readings':(summary.change>0?'+':'')+formatValue(summary.change)+' mm/s'}</strong><small>{summary.percent===null?(summary.previous===0?'Percentage unavailable: previous reading is zero':'Requires two readings'):(summary.percent>0?'+':'')+formatValue(summary.percent)+'%'}</small></div>
          <div><span>Average · {points.length} readings</span><strong>{formatValue(summary.average)} <small>mm/s</small></strong></div>
          <div><span>Maximum · {points.length} readings</span><strong>{formatValue(summary.maximum)} <small>mm/s</small></strong></div>
        </div><p className="vht-hint">Summary uses the latest {points.length} valid readings by test date (maximum 15).</p>
      </>}
      <div id={id + "-panel"} role="tabpanel" aria-labelledby={id + "-" + active} tabIndex={0}>
        {loading ? <p role="status">Loading vibration readings…</p> : error ? <p className="vht-error" role="alert">{error}</p> :
          active === "history" ? children :
          points.length ? <>
            {invalidCount > 0 && <p className="vht-hint">{invalidCount} record(s) with invalid dates or values are excluded from the chart; they remain in History.</p>}
            <VibrationGraph points={points} type={active} />
          </> : <p className="vht-hint">No valid vibration readings yet. Add a vibration test to see the trend.</p>}
      </div>
    </section>
  );
}
