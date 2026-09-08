import { useState } from 'react';
import { craneAnalytics } from '../utils/craneData';
import './CraneAnalytics.css';
const shortDate=date=>new Date(date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'});
export default function CraneAnalytics({history,error=''}) {
  const [view,setView]=useState('bar');
  const data=craneAnalytics(history),points=data.points,width=Math.max(650,points.length*85+110),bottom=280;
  const x=i=>points.length===1?width/2:92+i*(width-150)/(points.length-1);
  const y=value=>bottom-value*40;
  const groups=[{key:'safety',label:'Safety Not OK',color:'#db2777'},{key:'brake',label:'Brake Outside Limit',color:'#7c3aed'}];
  if(error)return <section className="ca-panel"><p role="alert">Inspection summary unavailable: {error}</p></section>;
  return <section className="ca-panel">
    <div className="ca-summary">
      <div><span>Open Faults</span><strong>{data.open}</strong><small>Recorded fault entries</small></div>
      <div><span>Resolved Faults</span><strong>{data.resolved}</strong><small>Repair recorded</small></div>
      <div><span>Total Inspections</span><strong>{data.total}</strong><small>Saved inspection records</small></div>
      <div><span>Last Inspection</span><strong className="ca-date">{data.last?new Date(data.last).toLocaleString():'No dated inspection'}</strong><small>Saved date and time</small></div>
    </div>
    <p className="ca-note">Counts use saved inspections, not next-inspection defaults. Repeated faults are counted separately for each inspection.</p>
    {!!data.legacyCount && <p className="ca-note">{data.legacyCount} older snapshots remain in History and the PDF; they are excluded from inspection counts and charts.</p>}
    <div className="ca-heading"><h3>Inspection Fault Trends</h3><div className="ca-buttons" role="group" aria-label="Fault chart view">
      <button aria-pressed={view==='bar'} onClick={()=>setView('bar')} className={view==='bar'?'ca-selected':''}>📊 Bar Chart</button>
      <button aria-pressed={view==='line'} onClick={()=>setView('line')} className={view==='line'?'ca-selected':''}>📈 Line Chart</button>
    </div></div>
    <p className="ca-note">Latest {points.length} dated inspections (maximum 15), oldest to newest. Fault counts reflect the original inspection, even after repairs.</p>
    {!!data.undated && <p className="ca-note">{data.undated} undated inspection(s) excluded from charts.</p>}
    {!points.length?<p className="ca-empty">Save a dated inspection to start the trend charts.</p>:<>
      <div className="ca-legend">{groups.map(group=><span key={group.key}><i style={{background:group.color}}/>{group.label}</span>)}</div>
      <div className="ca-scroll" tabIndex={0} aria-label="Scrollable inspection chart"><svg width={width} height="350" viewBox={'0 0 '+width+' 350'} role="img" aria-label={view+' chart of inspection fault counts'}>
        <title>{'Latest '+points.length+' inspection fault counts'}</title><desc>Exact dates and counts are in the table below. Missing group results are not plotted.</desc>
        {[0,1,2,3,4,5].map(tick=><g key={tick}><line x1="62" x2={width-30} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0"/><text x="49" y={y(tick)+4} fontSize="12" fill="#64748b" textAnchor="end">{tick}</text></g>)}
        <text x="18" y="175" transform="rotate(-90 18 175)" fontSize="12" fill="#475569" textAnchor="middle">Fault count</text>
        {groups.map((group,g)=><g key={group.key}>{points.map((point,i)=>{
          const value=point[group.key];if(value===null)return null;
          const px=x(i),py=y(value),prev=i?points[i-1][group.key]:null;
          return <g key={point.record._id||i}>{view==='bar'?<rect x={px+(g===0?-23:2)} y={py} width="21" height={Math.max(1,bottom-py)} rx="3" fill={group.color}><title>{shortDate(point.record.updatedAt)+': '+group.label+' '+value}</title></rect>:<>
            {prev!==null&&<line x1={x(i-1)} y1={y(prev)} x2={px} y2={py} stroke={group.color} strokeWidth="3"/>}
            {g===0?<circle cx={px} cy={py} r="6" fill={group.color}/>:<rect x={px-4} y={py-4} width="8" height="8" fill={group.color}/>}
          </>}
          <text x={view==='bar'?px+(g===0?-12:12):px+(g===0?-10:10)} y={py-(g===0?12:22)} textAnchor="middle" fontSize="11" fontWeight="700" fill={group.color}>{value}</text></g>;
        })}</g>)}
        {points.map((point,i)=><g key={point.record._id||i}><text x={x(i)} y="302" textAnchor="middle" fontSize="10" fill="#475569">{shortDate(point.record.updatedAt)}</text><text x={x(i)} y="319" textAnchor="middle" fontSize="10" fill="#64748b">#{i+1}</text></g>)}
        <text x={width/2} y="343" textAnchor="middle" fontSize="12" fill="#475569">Inspection date · Oldest → Newest</text>
      </svg></div>
      <p className="ca-note">Pink circles: safety; purple squares: brakes. A missing group is shown as “Incomplete” in the table, not zero.</p>
      <div className="ca-scroll"><table className="ca-table"><caption>Inspections shown in the chart</caption><thead><tr><th>#</th><th>Date / time</th><th>Inspector</th><th>Safety faults / 5</th><th>Brake faults / 4</th></tr></thead><tbody>{points.map((p,i)=><tr key={p.record._id||i}><td>{i+1}</td><td>{new Date(p.record.updatedAt).toLocaleString()}</td><td>{p.record.inspectorName||p.record.updatedBy||'—'}</td><td>{p.safety??'Incomplete'}</td><td>{p.brake??'Incomplete'}</td></tr>)}</tbody></table></div>
    </>}
    {!!data.recurring.length&&<div className="ca-recurring"><h4>Frequently recorded faults · All inspections</h4><div>{data.recurring.map(item=><span key={item.key}>{item.label}<b>{item.count}</b></span>)}</div></div>}
  </section>;
}
