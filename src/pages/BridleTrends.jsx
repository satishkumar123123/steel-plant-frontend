import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {bridleGroups,matchBridle} from '../utils/bridleData';
import {latestVibrations,formatValue} from '../utils/vibrationData';
import './BridleTrends.css';
import {bridleEntries,insightSummary} from '../utils/bridleInsights';
const API=process.env.REACT_APP_API_URL;
const colors=['#22d3ee','#f472b6','#a78bfa','#fbbf24','#34d399','#fb923c'];
const date=value=>new Date(value).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit',timeZone:'UTC'});
function Chart({points,type,ceiling,label}){
  const w=Math.max(380,points.length*44+65),bottom=180,left=45;
  const x=i=>points.length===1?w/2:left+18+i*(w-left-40)/(points.length-1);
  const y=v=>bottom-v/ceiling*140;
  return <><div className="bt-scroll" tabIndex={0} aria-label={label+' scrollable chart'}><svg width={w} height="245" viewBox={`0 0 ${w} 245`} role="img" aria-label={label+' '+type+' chart, vibration in mm/s'}><title>{label} vibration trend</title>
    {[0,1,2,3,4].map(t=><g key={t}><line x1={left} x2={w-12} y1={y(ceiling*t/4)} y2={y(ceiling*t/4)} stroke="#ffffff22"/><text x={left-6} y={y(ceiling*t/4)+4} fill="#cbd5e1" fontSize="10" textAnchor="end">{formatValue(ceiling*t/4)}</text></g>)}
    {type==='line'&&points.length>1&&<polyline points={points.map((p,i)=>`${x(i)},${y(p.vibrationValue)}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth="3"/>}
    {points.map((p,i)=><g key={p._id||i}>{type==='bar'?<rect x={x(i)-12} y={y(p.vibrationValue)} width="24" height={Math.max(1,bottom-y(p.vibrationValue))} fill={colors[i%6]} rx="3"><title>{date(p.testDate)}: {p.vibrationValue} mm/s</title></rect>:<circle cx={x(i)} cy={y(p.vibrationValue)} r="5" fill={colors[i%6]}><title>{date(p.testDate)}: {p.vibrationValue} mm/s</title></circle>}<text x={x(i)} y={y(p.vibrationValue)-10} textAnchor="middle" fill="#f8fafc" fontSize="10">{formatValue(p.vibrationValue)}</text><text transform={`translate(${x(i)},198) rotate(-35)`} textAnchor="end" fill="#cbd5e1" fontSize="9">{date(p.testDate)}</text></g>)}
  </svg></div><details className="bt-readings"><summary>View {points.length} exact readings</summary><table><thead><tr><th>Test date (UTC)</th><th>mm/s</th></tr></thead><tbody>{points.map((p,i)=><tr key={p._id||i}><td>{date(p.testDate)}</td><td>{p.vibrationValue}</td></tr>)}</tbody></table></details></>;
}
function Group({group,motors,readings,type,index}){
  const pair=['A','B'].map(position=>({position,matches:motors.filter(m=>matchBridle(m,group.plant,group.bridle,position))}));
  const ceiling=Math.max(1,...pair.flatMap(p=>p.matches.length===1?(readings[p.matches[0]._id]?.points||[]).map(r=>r.vibrationValue):[]));
  return <article className={'bt-group bt-tone-'+index%6}><header><h3>{group.bridle==='HBR'?'Hot Bridle · HBR':'Bridle '+group.bridle}</h3><span>{group.plant} · {group.bridle}A / {group.bridle}B</span></header><div className="bt-pair">{pair.map(({position,matches})=>{const motor=matches[0],data=motor&&readings[motor._id],points=data?.points||[];
    return <section className={'bt-motor bt-motor-'+position} key={position}><h4>{group.bridle}{position}{matches.length===1&&<Link to={'/motor/'+motor._id}>Details ↗</Link>}</h4>{matches.length===0?<p className="bt-message">Motor not found in directory.</p>:matches.length>1?<p className="bt-message" role="alert">Multiple motors match this position. Check the motor directory.</p>:<><p className="bt-serial">Serial · {motor.serialNo||'Not recorded'}</p>{!data?<p role="status">Loading readings…</p>:data.error?<p className="bt-message" role="alert">{data.error}</p>:!points.length?<p className="bt-message">No valid vibration readings.</p>:<><div className="bt-latest"><strong>{formatValue(points[points.length-1].vibrationValue)} <small>mm/s</small></strong><span>Latest · {date(points[points.length-1].testDate)}</span>{Date.now()-Date.parse(points[points.length-1].testDate)>30*86400000&&<small className="bt-old">Older than 30 days</small>}</div><Chart points={points} type={type} ceiling={ceiling} label={`${group.plant} ${group.bridle}${position}`}/>{data.excluded>0&&<small>{data.excluded} invalid record(s) excluded.</small>}</>}</>}</section>;
  })}</div><p className="bt-foot">A &amp; B use the same vertical scale · Oldest → newest · Each motor has its own test dates</p></article>;
}
export default function BridleTrends(){
  const [motors,setMotors]=useState([]),[readings,setReadings]=useState({}),[type,setType]=useState('line'),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
  const [reportBusy,setReportBusy]=useState(false),[reportError,setReportError]=useState('');
  const summary=insightSummary(bridleEntries(motors,readings));
  async function download(){setReportBusy(true);setReportError('');try{const {downloadBridleReport}=await import('../utils/bridleReport');await downloadBridleReport({motors,readings});}catch(e){setReportError('Report download failed. Please retry.');}finally{setReportBusy(false);}}
  useEffect(()=>{const controller=new AbortController();let active=true;setLoading(true);setBusy(true);setError('');setReadings({});
    async function get(path){const r=await fetch(API+path,{signal:controller.signal});if(!r.ok)throw Error('Could not load data. Use Refresh to retry.');const data=await r.json();if(!Array.isArray(data))throw Error('Invalid data response.');return data;}
    (async()=>{try{const list=await get('/motor-search');if(!active)return;setMotors(list);setLoading(false);
      const targets=list.filter(m=>bridleGroups.some(g=>['A','B'].some(p=>matchBridle(m,g.plant,g.bridle,p))));let cursor=0;
      await Promise.all(Array.from({length:Math.min(4,targets.length)},async()=>{while(active&&cursor<targets.length){const motor=targets[cursor++];try{const rows=await get('/vibration-test/'+motor._id);const points=latestVibrations(rows);const excluded=rows.filter(r=>!latestVibrations([r]).length).length;if(active)setReadings(prev=>({...prev,[motor._id]:{points,excluded}}));}catch(e){if(active)setReadings(prev=>({...prev,[motor._id]:{error:e.message}}));}}}));
    }catch(e){if(active)setError(e.message);}finally{if(active){setLoading(false);setBusy(false);}}})();return()=>{active=false;controller.abort();};
  },[retry]);
  return <main className="bt-page"><Link className="bt-back" to="/motors/search">← Search Motor &amp; Reports</Link><header className="bt-hero"><small>WIDER ELECTRICAL · VIBRATION ANALYSIS</small><h1>All Bridle <span>Vibration Trends</span></h1><p>CGL · 22 motor positions &nbsp; / &nbsp; CCL · 10 motor positions</p><p>Latest 15 valid readings per motor · Vibration in mm/s</p><div className="bt-controls"><div role="group" aria-label="Chart style"><button aria-pressed={type==='line'} onClick={()=>setType('line')}>📈 Line Chart</button><button aria-pressed={type==='bar'} onClick={()=>setType('bar')}>📊 Bar Chart</button></div><a href="#bt-cgl">CGL ↓</a><a href="#bt-ccl">CCL ↓</a><button disabled={busy||reportBusy} onClick={()=>setRetry(n=>n+1)}>{busy?'Loading…':'↻ Refresh'}</button><button disabled={busy||loading||!!error||reportBusy} onClick={download}>{reportBusy?'Preparing PDF…':'↓ Download All Bridle Report'}</button></div></header>
    {reportError&&<p role="alert">{reportError}</p>}
    {!loading&&!error&&<><div className="bt-insights" aria-live="polite">
      <div><small>Highest latest vibration</small><strong>{busy?'Loading…':summary.highest?`${formatValue(summary.highest.latest.vibrationValue)} mm/s`:'No readings'}</strong><span>{!busy&&summary.highest&&`${summary.highest.plant} ${summary.highest.label} · ${date(summary.highest.latest.testDate)}`}</span></div>
      <div><small>Largest increase vs previous</small><strong>{busy?'Loading…':summary.increase?`+${formatValue(summary.increase.change)} mm/s`:'No positive increase'}</strong><span>{!busy&&summary.increase&&`${summary.increase.plant} ${summary.increase.label} · ${date(summary.increase.latest.testDate)}`}</span></div>
      <div><small>Most recent test</small><strong>{busy?'Loading…':summary.last?date(summary.last.latest.testDate):'Not recorded'}</strong><span>{!busy&&summary.last&&`${summary.last.plant} ${summary.last.label}`}</span></div>
      <div><small>Latest test older than 30 days</small><strong>{busy?'Loading…':summary.stale+' motors'}</strong><span>{summary.available} / 32 positions with readings</span></div>
    </div><p className="bt-foot">Summary uses available, uniquely matched motors only. Old-reading badges mean more than 30 days; missing or failed loads are shown below. PDF exports the loaded snapshot.</p></>}
    {loading?<p role="status">Loading motor directory…</p>:error?<p role="alert">{error}</p>:['CGL','CCL'].map(plant=><section className="bt-line" id={'bt-'+plant.toLowerCase()} key={plant}><h2>{plant==='CGL'?'CGL · Continuous Galvanizing Line':'CCL · Colour Coating Line'}</h2><p>{plant==='CGL'?'Bridle 1–10 + Hot Bridle':'Bridle 1–5'} · Bridle-numbered A / B motors</p><div className="bt-groups">{bridleGroups.filter(g=>g.plant===plant).map((g,i)=><Group key={g.bridle} group={g} motors={motors} readings={readings} type={type} index={i}/>)}</div></section>)}
  </main>;
}
