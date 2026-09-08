import {useEffect,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {filterMotors,normalize} from '../utils/motorFilters';
import './MotorSearch.css';
const API=process.env.REACT_APP_API_URL;
export default function MotorSearch(){
  const [params]=useSearchParams();
  const [motors,setMotors]=useState([]),[query,setQuery]=useState(''),[plant,setPlant]=useState(params.get('plant')||''),[area,setArea]=useState(''),[status,setStatus]=useState('');
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{const controller=new AbortController();let active=true;setLoading(true);setError('');
    (async()=>{try{const res=await fetch(`${API}/motor-search`,{signal:controller.signal});if(!res.ok)throw Error('Could not load motors. Please retry.');const data=await res.json();if(!Array.isArray(data))throw Error('Invalid motor list');if(active)setMotors(data);}catch(e){if(active&&e.name!=='AbortError')setError(e.message);}finally{if(active)setLoading(false);}})();return()=>{active=false;controller.abort();};},[retry]);
  const options=values=>Array.from(new Map(values.filter(Boolean).map(v=>[normalize(v),String(v)])).values()).sort((a,b)=>a.localeCompare(b));
  const areas=options(motors.filter(m=>!plant||normalize(m.plant)===normalize(plant)).map(m=>m.area||m.location));
  const filtered=filterMotors(motors,{query,plant,area,status});
  return <main className="ms-page"><div className="ms-shell"><Link className="ms-back" to="/">← Dashboard</Link>
    <header className="ms-hero"><small>WIDER ELECTRICAL · EQUIPMENT DIRECTORY</small><h1>Find your <span>motor.</span></h1><p>Search by serial, name or location. Filter by production line, area and status.</p><Link className="ms-bridle-trends" to="/motors/bridle-trends">📈 All Bridle Vibration Trends <span>CGL + CCL · A / B motors →</span></Link></header>
    <section className="ms-filters" aria-label="Motor filters"><label className="ms-query">Search motors<input type="search" placeholder="Serial number, motor name, area…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label>Production line<select value={plant} onChange={e=>{setPlant(e.target.value);setArea('');}}><option value="">All lines</option>{options(motors.map(m=>m.plant)).map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Area / Location<select value={area} onChange={e=>setArea(e.target.value)}><option value="">All areas</option>{areas.map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{options(motors.map(m=>m.status)).map(v=><option key={v}>{v}</option>)}</select></label>
      <button onClick={()=>{setQuery('');setPlant('');setArea('');setStatus('');}}>Clear filters</button></section>
    {loading?<p role="status">Loading motors…</p>:error?<div role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:<><p className="ms-count" aria-live="polite">{filtered.length} of {motors.length} motors</p>
      {!filtered.length?<p className="ms-empty">No matching motors. Try another search or clear the filters.</p>:<div className="ms-grid">{filtered.map((m,i)=><Link className={'ms-card ms-color-'+i%4} key={m._id} to={'/motor/'+m._id}>
        <div className="ms-card-top"><span>{m.plant||'Motor'}</span><span className={'ms-status ms-'+(/^(running|ok)$/i.test(m.status)?'running':/^(stopped|breakdown)$/i.test(m.status)?'stopped':'other')}>{m.status||'Unknown'}</span></div>
        <h2>{m.motorName||m.name||m.position||'Motor'}</h2><p>{m.area||m.location||'Area not recorded'}{m.bridleNo!=null?' · Bridle '+m.bridleNo:''}</p>
        <dl><div><dt>Serial</dt><dd>{m.serialNo||'—'}</dd></div><div><dt>RPM</dt><dd>{m.rpm??'—'}</dd></div></dl><strong>Details &amp; report →</strong></Link>)}</div>}</>}
  </div></main>;
}
