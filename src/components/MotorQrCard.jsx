import {useState} from 'react';
import {Link} from 'react-router-dom';
import {qrMatrix,qrName,qrLocation,motorUrl,downloadQrPng} from '../utils/motorQr';
import './MotorQrCard.css';
export default function MotorQrCard({motor}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');let modules,url;
 try{modules=qrMatrix(motor);url=motorUrl(motor);}catch(e){return <p role="alert">QR unavailable: {e.message}</p>;}
 const size=modules.size,rects=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(modules.get(r,c))rects.push(`M${c+4} ${r+4}h1v1h-1z`);
 async function download(type){setBusy(true);setError('');try{if(type==='png')await downloadQrPng(motor);else{const {downloadMotorQrPdf}=await import('../utils/motorQrPdf');await downloadMotorQrPdf([motor]);}}catch(e){setError(e.message||'Download failed');}finally{setBusy(false);}}
 return <article className="mq-card"><div className="mq-heading"><span>{motor.plant||'Motor'}</span><h2>{qrName(motor)}</h2><p>{qrLocation(motor)}</p></div><svg className="mq-code" viewBox={`0 0 ${size+8} ${size+8}`} role="img" aria-label={'QR code for '+qrLocation(motor)+' '+qrName(motor)} shapeRendering="crispEdges"><title>{url}</title><rect width={size+8} height={size+8} fill="white"/><path d={rects.join('')} fill="black"/></svg><p className="mq-serial">Serial: {motor.serialNo||'Not recorded'}</p><Link to={'/motor/'+motor._id}>Open motor details ↗</Link><div className="mq-actions"><button disabled={busy} onClick={()=>download('png')}>↓ QR PNG</button><button disabled={busy} onClick={()=>download('pdf')}>↓ Label PDF</button></div>{error&&<p role="alert">{error}</p>}</article>;
}
