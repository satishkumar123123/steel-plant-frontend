export function latestVibrations(records) {
  return (Array.isArray(records) ? records : []).filter(row =>
    row.testDate && Number.isFinite(Date.parse(row.testDate)) &&
    ['number', 'string'].includes(typeof row.vibrationValue) && String(row.vibrationValue).trim() !== '' &&
    Number.isFinite(Number(row.vibrationValue)) && Number(row.vibrationValue) >= 0
  ).map(row => ({ ...row, vibrationValue: Number(row.vibrationValue) }))
    .sort((a,b) => Date.parse(b.testDate)-Date.parse(a.testDate) || (Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0) || String(b._id||'').localeCompare(String(a._id||'')))
    .slice(0,15).reverse();
}
export function vibrationSummary(records) {
  const points=latestVibrations(records);
  if (!points.length) return {points, latest:null,previous:null,change:null,percent:null,average:null,maximum:null};
  const latest=points[points.length-1].vibrationValue;
  const previous=points.length>1?points[points.length-2].vibrationValue:null;
  return {points,latest,previous,change:previous===null?null:latest-previous,percent:previous===null||previous===0?null:(latest-previous)/previous*100,
    average:points.reduce((total,p)=>total+p.vibrationValue/points.length,0),maximum:Math.max(...points.map(p=>p.vibrationValue))};
}
export const formatValue=value=>value===null?'—':Number(value.toFixed(3)).toLocaleString('en-GB',{maximumFractionDigits:3});
