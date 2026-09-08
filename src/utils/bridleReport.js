import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {bridleGroups} from './bridleData';
import {bridleEntries,insightSummary,comparisonScale} from './bridleInsights';
export async function buildBridleReport({motors,readings,generatedAt=new Date()}){
 const entries=bridleEntries(motors,readings),summary=insightSummary(entries,+generatedAt),pdf=await PDFDocument.create();
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const color=h=>rgb(parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255);
 let page;const text=(s,x,y,size=10,fill='#334155',font=regular)=>page.drawText(String(s),{x,y:842-y-size,size,color:color(fill),font});
 const box=(x,y,w,h,fill)=>page.drawRectangle({x,y:842-y-h,width:w,height:h,color:color(fill)});
 const line=(x,y,xx,yy,fill='#cbd5e1',thickness=1)=>page.drawLine({start:{x,y:842-y},end:{x:xx,y:842-yy},color:color(fill),thickness});
 function newPage(title){page=pdf.addPage([595,842]);box(0,0,595,8,'#6d28d9');text('WIDER ELECTRICAL',36,26,10,'#4338ca',bold);text('BRIDLE VIBRATION REPORT',340,26,10,'#64748b');text(title,36,65,22,'#172554',bold);}
 const date=d=>new Date(d).toISOString().slice(0,10),num=n=>Number(n.toFixed(3)).toString();
 newPage('All Bridle Vibration Trends');
 box(36,112,523,80,'#312e81');text('CGL + CCL',54,129,24,'#ffffff',bold);text('32 motor positions | Latest 15 valid readings per motor',54,166,11,'#e0e7ff');
 const rows=[['Motors with readings',summary.available+' / '+summary.total],['Highest latest vibration',summary.highest?`${summary.highest.plant} ${summary.highest.label}: ${num(summary.highest.latest.vibrationValue)} mm/s`:'No readings'],['Largest increase vs previous',summary.increase?`${summary.increase.plant} ${summary.increase.label}: +${num(summary.increase.change)} mm/s`:'No positive increase available'],['Most recent test',summary.last?date(summary.last.latest.testDate):'Not recorded'],['Readings older than 30 days',String(summary.stale)]];
 rows.forEach(([label,value],i)=>{box(36,220+i*54,523,46,i%2?'#ecfeff':'#ede9fe');text(label,48,230+i*54,10,'#4338ca',bold);text(value,290,230+i*54,10,'#172554',bold);});
 text('Coverage and interpretation',36,515,14,'#6d28d9',bold);
 ['Summary covers only available, uniquely matched motors.', 'Missing, ambiguous and failed loads are labelled on their bridle page.', 'A/B charts use actual test dates and a shared vertical scale in mm/s.', 'Lines connect samples; readings are not interpolated or paired by row.', 'Old-reading badge: latest test more than 30 days before report generation.', 'This report exports the loaded page snapshot. Refresh before downloading.'].forEach((s,i)=>text(s,36,546+i*23,10));
 for(const group of bridleGroups){const pair=entries.filter(e=>e.plant===group.plant&&e.bridle===group.bridle);newPage(`${group.plant} - ${group.bridle==='HBR'?'Hot Bridle':`Bridle ${group.bridle}`}`);
 text(`${pair[0].label} (blue) / ${pair[1].label} (pink) - Vibration in mm/s`,36,103,11,'#6d28d9',bold);
 box(36,132,523,243,'#f8fafc');const {min,max,ceiling}=comparisonScale(pair),x=t=>max===min?310:80+(t-min)/(max-min)*440,y=v=>328-v/ceiling*150;
 if(pair.some(e=>e.points.length)){
 for(let t=0;t<=4;t++){const v=ceiling*t/4;line(80,y(v),520,y(v));text(num(v),43,y(v)-5,8);}
 for(let k=0;k<pair.length;k++){const e=pair[k],ink=k?'#db2777':'#0284c7';for(let i=0;i<e.points.length;i++){const p=e.points[i],px=x(Date.parse(p.testDate)),py=y(p.vibrationValue);if(i){const prev=e.points[i-1];line(x(Date.parse(prev.testDate)),y(prev.vibrationValue),px,py,ink,1.8);}if(k)box(px-3,py-3,6,6,ink);else page.drawCircle({x:px,y:842-py,size:3,color:color(ink)});}}
 text(date(min),80,343,8);if(max!==min)text(date(max),465,343,8);text('Actual test date (UTC)',220,359,8,'#64748b');
 }else text('No available readings for comparison.',70,235,12);
 for(let k=0;k<pair.length;k++){const e=pair[k],left=36+k*267;box(left,398,256,30,k?'#9d174d':'#075985');text(e.label,left+10,406,12,'#ffffff',bold);
 if(e.status!=='Available'){text(e.status,left+8,444,10);continue;}
 text(`Latest ${e.points.length} readings`,left+8,440,10,'#475569');text('Test date (UTC)',left+8,466,9,'#4338ca',bold);text('mm/s',left+192,466,9,'#4338ca',bold);
 for(let i=0;i<e.points.length;i++){const p=e.points[i],top=485+i*17;box(left,top,256,17,i%2?'#ffffff':'#eef2ff');text(date(p.testDate),left+8,top+3,8);text(num(p.vibrationValue),left+192,top+3,8,k?'#9d174d':'#075985',bold);}
 }
 }
 const pages=pdf.getPages();pages.forEach((p,i)=>{page=p;line(36,796,559,796);text('Generated '+new Date(generatedAt).toISOString().slice(0,19).replace('T',' ')+' UTC',36,808,8,'#64748b');text(`${i+1} / ${pages.length}`,520,808,8,'#64748b');});pdf.setTitle('CGL and CCL All Bridle Vibration Report');return pdf.save();
}
export async function downloadBridleReport(data){const bytes=await buildBridleReport(data),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='CGL_CCL_All_Bridle_Vibration_Report.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
