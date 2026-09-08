import {comparisonScale} from '../utils/bridleInsights';
import {formatValue} from '../utils/vibrationData';
export default function BridleComparison({entries}){
 const {min,max,ceiling}=comparisonScale(entries),w=640,bottom=205;
 const x=t=>max===min?345:55+(t-min)/(max-min)*555,y=v=>bottom-v/ceiling*150;
 return <div className="bt-comparison"><h4>A/B comparison · actual test dates</h4><p><span style={{color:'#22d3ee'}}>● {entries[0].label}</span> &nbsp; <span style={{color:'#f472b6'}}>■ {entries[1].label}</span> · mm/s</p>
 {entries.some(e=>e.points.length)?<div className="bt-scroll" tabIndex={0} aria-label="Scrollable A/B date comparison"><svg width={w} height="265" role="img" aria-label={`${entries[0].plant} ${entries[0].bridle} A/B vibration comparison by actual test date`}>
 {[0,1,2,3,4].map(i=><g key={i}><line x1="55" x2="610" y1={y(ceiling*i/4)} y2={y(ceiling*i/4)} stroke="#ffffff25"/><text x="48" y={y(ceiling*i/4)+4} textAnchor="end" fontSize="11" fill="#cbd5e1">{formatValue(ceiling*i/4)}</text></g>)}
 {entries.map((e,k)=><g key={e.position}>{e.points.length>1&&<polyline points={e.points.map(p=>`${x(Date.parse(p.testDate))},${y(p.vibrationValue)}`).join(' ')} fill="none" stroke={k?'#f472b6':'#22d3ee'} strokeWidth="3" strokeDasharray={k?'7 4':undefined}/>}{e.points.map((p,i)=><g key={p._id||i}><title>{e.label}: {p.testDate} · {p.vibrationValue} mm/s</title>{k?<rect x={x(Date.parse(p.testDate))-4} y={y(p.vibrationValue)-4} width="8" height="8" fill="#f472b6"/>:<circle cx={x(Date.parse(p.testDate))} cy={y(p.vibrationValue)} r="4" fill="#22d3ee"/>}</g>)}</g>)}
 {(min===max?[min]:[min,min+(max-min)/2,max]).map((t,i)=><text key={i} x={x(t)} y="230" textAnchor={min===max?'middle':i===0?'start':i===2?'end':'middle'} fill="#cbd5e1" fontSize="10">{new Date(t).toISOString().slice(0,10)}</text>)}<text x="320" y="252" textAnchor="middle" fill="#94a3b8" fontSize="10">Test date (UTC) · Lines connect recorded samples</text></svg></div>:<p>No readings available for comparison.</p>}
 {entries.filter(e=>e.status!=='Available').map(e=><p key={e.position}>{e.label}: {e.status}</p>)}
 <small>Each motor uses its latest 15 valid readings. Exact values are in the motor cards below.</small></div>;
}
