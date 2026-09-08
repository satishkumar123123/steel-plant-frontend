import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { craneAnalytics, SAFETY_KEYS, BRAKE_KEYS, checkLabel } from './craneData';

const W=595.28,H=841.89,M=38,CW=W-M*2;

const c=hex=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
const val=value=>value===null||value===undefined||value===''?'Not recorded':String(value);


export async function buildCraneReport({crane,history=[],generatedAt=new Date()}) {
  const pdf=await PDFDocument.create();
  pdf.setTitle('Crane Inspection Report - '+val(crane.serialNo));pdf.setAuthor('Wider Electrical');pdf.setSubject('Crane inspections, fault trends and repair history');
  const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const tasks=[];let page,y=0;
  // Standard text stays vector-sharp. Non-Latin notes use high-resolution browser font rendering.
  const supports=(text,font)=>{try{font.encodeText(text);return true;}catch{return false;}};
  const canvasContext=()=>{if(typeof document==='undefined')throw Error('Browser required to render non-Latin notes');return document.createElement('canvas').getContext('2d');};
  function width(text,size,font=regular){text=String(text);if(supports(text,font))return font.widthOfTextAtSize(text,size);const ctx=canvasContext();ctx.font=`${font===bold?'bold ':''}${size}px Arial, sans-serif`;return ctx.measureText(text).width;}
  function text(value,x,top,size=10,color='#334155',font=regular){
    const str=String(value).replace(/[\r\n\t]/g,' ');const target=page;
    if(supports(str,font)){target.drawText(str,{x,y:H-top-size,size,font,color:c(color)});return;}
    const scale=3,canvas=document.createElement('canvas');canvas.width=Math.ceil((width(str,size,font)+3)*scale);canvas.height=Math.ceil(size*1.7*scale);
    const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.font=`${font===bold?'bold ':''}${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.textBaseline='top';ctx.fillText(str,0,0);
    tasks.push(pdf.embedPng(canvas.toDataURL('image/png')).then(image=>target.drawImage(image,{x,y:H-top-canvas.height/scale,width:canvas.width/scale,height:canvas.height/scale})));
  }
  function rect(x,top,w,h,color){page.drawRectangle({x,y:H-top-h,width:w,height:h,color:c(color)});}
  function line(x1,t1,x2,t2,color='#e2e8f0',thickness=1){page.drawLine({start:{x:x1,y:H-t1},end:{x:x2,y:H-t2},color:c(color),thickness});}
  function wrap(input,maxWidth,size=9,font=regular){const output=[];for(const paragraph of val(input).split(/\r?\n/)){let current='';for(const char of Array.from(paragraph)){if(width(current+char,size,font)>maxWidth&&current){output.push(current);current=char;}else current+=char;}output.push(current||' ');}return output;}
  function newPage(title){page=pdf.addPage([W,H]);rect(0,0,W,7,'#6d28d9');text('WIDER ELECTRICAL',M,24,9,'#4338ca',bold);text('CRANE INSPECTION REPORT',W-220,24,8,'#64748b');line(M,45,W-M,45);text(title,M,62,20,'#172554',bold);y=99;}
  const label=(heading)=>{if(y>H-105)newPage(heading);text(heading,M,y,12,'#6d28d9',bold);y+=25;};
  function table(title,headers,rows,widths,continuePage=false){
    if (continuePage && y < H-180) { y+=28; text(title,M,y,14,"#172554",bold); y+=32; } else newPage(title);
    const drawHeader=()=>{rect(M,y,CW,26,'#312e81');let x=M;headers.forEach((header,i)=>{text(header,x+8,y+8,8,'#ffffff',bold);x+=widths[i];});y+=26;};
    drawHeader();
    if(!rows.length){text('No records available.',M+8,y+16,10,'#64748b');return;}
    rows.forEach((row,index)=>{
      let cells=row.map((value,i)=>wrap(value,widths[i]-16,8.5));let offset=0;const lines=Math.max(...cells.map(cell=>cell.length));
      while(offset<lines){if(y+30>H-58){newPage(title+' - continued');drawHeader();}
        const capacity=Math.max(1,Math.floor((H-58-y-14)/12));const count=Math.min(capacity,lines-offset);const height=count*12+14;
        rect(M,y,CW,height,index%2===0?'#f5f3ff':'#ffffff');let x=M;
        for (let i = 0; i < cells.length; i++) {
          const cellLines = cells[i].slice(offset, offset + count);
          for (let n = 0; n < cellLines.length; n++) {
            text(cellLines[n], x + 8, y + 7 + n * 12, 8.5, i === 0 ? '#6d28d9' : '#334155');
          }
          x += widths[i];
        }
        line(M,y+height,W-M,y+height);y+=height;offset+=count;
      }
    });
  }
  const data=craneAnalytics(history),points=data.points;
  newPage('Crane inspection overview');
  rect(M,y,CW,78,'#172554');text('CRANE / '+val(crane.plant),M+18,y+14,10,'#a5f3fc',bold);
  text('Crane '+val(crane.craneNo),M+18,y+36,23,'#ffffff',bold);y+=97;
  const details=[['Serial number',crane.serialNo],['Manufacturer',crane.make],['Capacity (tonnes)',crane.capacityTon],['Power (kW)',crane.kw],['Location',crane.location],['Crane ID',crane._id]];
  for(const [key,value] of details){
    const lines=wrap(value,CW-155,10),height=Math.max(31,lines.length*14+12);
    if(y+height>H-75)newPage('Crane overview - continued');
    rect(M,y,CW,height,'#f8fafc');text(key,M+12,y+9,9,'#6d28d9',bold);
    for(let i=0;i<lines.length;i++)text(lines[i],M+155,y+8+i*14,10);
    y+=height+3;
  }
  y+=20;if(y+205>H-55)newPage('Inspection summary');label('Saved inspection summary');
  const stats=[['Open faults',data.open,'#fff1f2','#9f1239'],['Resolved faults',data.resolved,'#ecfdf5','#065f46'],['Total inspections',data.total,'#f5f3ff','#5b21b6']];
  stats.forEach(([key,value,bg,fg],i)=>{const x=M+i*CW/3;rect(x,y,CW/3-8,65,bg);text(key,x+12,y+10,9,fg,bold);text(value,x+12,y+29,24,fg,bold);});y+=82;
  text('Last inspection: '+(data.last?new Date(data.last).toISOString().replace('T',' ').slice(0,19)+' UTC':'Not recorded'),M,y,10,'#1e40af',bold);y+=22;
  const notes=[
    'Counts use saved inspection results, never the next-inspection defaults.',
    'Repeated findings count as separate fault entries for each inspection.',
    data.legacyCount+' older snapshots are excluded from inspection counts and charts.',
    'Charts show latest '+points.length+' dated inspections (maximum 15). Dates use UTC.'
  ];
  for(const note of notes){text(note,M,y,9,'#64748b');y+=16;}

  newPage('Fault trend analysis');
  if(!points.length)text('No dated saved inspections available for charts.',M,y+16,11,'#64748b');
  else{
    text('Original findings at inspection time; resolving a fault does not rewrite the chart.',M,y,9,'#64748b');y+=26;
    function chart(type,top){
      rect(M,top,CW,247,'#f8fafc');text(type==='bar'?'FAULT COUNTS - BAR CHART':'FAULT COUNTS - LINE CHART',M+14,top+10,10,'#5b21b6',bold);
      text('Pink: Safety Not OK (0-5)    Purple: Brake Outside Limit (0-4)',M+14,top+28,8,'#475569');
      const left=M+38,right=W-M-20,bottom=top+202,range=133;
      const x=i=>points.length===1?(left+right)/2:left+14+i*(right-left-28)/(points.length-1);
      const yy=value=>bottom-value/5*range;
      [0,1,2,3,4,5].forEach(t=>{line(left,yy(t),right,yy(t),'#e2e8f0');text(t,M+12,yy(t)-4,7,'#64748b');});
      [{key:'safety',color:'#db2777'},{key:'brake',color:'#7c3aed'}].forEach((group,g)=>{
        points.forEach((p,i)=>{
          const value=p[group.key];if(value===null)return;const px=x(i),py=yy(value);
          if(type==='bar'){rect(px+(g===0?-10:1),py,9,Math.max(.7,bottom-py),group.color);}
          else{
            if(i&&points[i-1][group.key]!==null)line(x(i-1),yy(points[i-1][group.key]),px,py,group.color,1.7);
            if(g===0)page.drawCircle({x:px,y:H-py,size:3.2,color:c(group.color)});else rect(px-2.5,py-2.5,5,5,group.color);
          }
          text(value,px+(g===0?-8:3),py-(g===0?11:19),6,group.color,bold);
        });
      });
      points.forEach((p,i)=>{const d=new Date(p.record.updatedAt).toISOString().slice(5,10).split('-').reverse().join('/');text(d,x(i)-width(d,6.5)/2,bottom+8,6.5,'#475569');text(i+1,x(i)-2,bottom+19,6,'#64748b');});
      text('Inspection date (DD/MM) - oldest to newest',M+130,top+234,8,'#64748b');
    }
    chart('line',y);chart('bar',y+267);
    y+=531;text('Incomplete check groups are not plotted; all available results follow in the history.',M,y,8,'#64748b');
  }
  const stamp=value=>value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString().replace('T',' ').slice(0,19)+' UTC':'Not recorded';
  table('Fault register - all recorded findings',['Inspection / By','Check / Result','Status','Repair details'],data.allIssues.map(issue=>[
    stamp(issue.record.updatedAt)+'\n'+val(issue.record.inspectorName||issue.record.updatedBy),
    checkLabel(issue.key)+'\n'+issue.value,
    issue.status,
    issue.status==='Resolved'?'Resolved by: '+val(issue.resolvedBy)+'\nDate: '+stamp(issue.resolvedAt)+'\nAction: '+val(issue.resolutionAction):'Open - repair not recorded'
  ]),[113,145,55,CW-313]);
  const checks=(record,keys,group)=>keys.map(key=>checkLabel(key)+': '+val(record[group]?.[key])).join('\n');
  const ordered=[...history].sort((a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0));
  table('Inspection history - full records',['Date / Inspector','Safety checks','Brake checks','Notes / Action'],ordered.map(record=>{
    const saved=record.inspectionData||record.oldData||{};
    return [
      (record.recordType==='inspection'?'SAVED INSPECTION':'PREVIOUS SNAPSHOT')+'\n'+stamp(record.updatedAt)+'\n'+val(record.inspectorName||record.updatedBy),
      checks(saved,SAFETY_KEYS,'safetyChecks'),checks(saved,BRAKE_KEYS,'brakeChecks'),
      'Remark: '+val(record.remark)+'\nAction taken: '+val(record.actionTaken)
    ];
  }),[110,135,135,CW-380]);
  const pages=pdf.getPages();pages.forEach((p,i)=>{page=p;line(M,H-42,W-M,H-42);text('Generated '+new Date(generatedAt).toISOString().replace('T',' ').slice(0,19)+' UTC',M,H-31,7,'#64748b');text('Page '+(i+1)+' / '+pages.length,W-M-55,H-31,7,'#64748b');});
  await Promise.all(tasks);
  return pdf.save();
}
export async function downloadCraneReport(data){
  const bytes=await buildCraneReport(data);const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');
  const name=String(data.crane.serialNo||data.crane.craneNo||data.crane._id||'crane').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
  link.href=url;link.download='Crane_Report_'+name+'.pdf';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}

