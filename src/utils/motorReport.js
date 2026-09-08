import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { vibrationSummary } from './vibrationData';

const W=595.28,H=841.89,M=38,CW=W-M*2;
const palette=['#2563eb','#7c3aed','#db2777','#d97706','#059669','#0891b2'];
const c=hex=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
const date=value=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}):'Not recorded';
const val=value=>value===null||value===undefined||value===''?'Not recorded':String(value);
const num=n=>n===null?'N/A':Number(n.toFixed(3)).toLocaleString('en-GB',{maximumFractionDigits:3});

export async function buildMotorReport({motor,motorHistory=[],greasingHistory=[],vibrationHistory=[],generatedAt=new Date()}) {
  const pdf=await PDFDocument.create();
  pdf.setTitle('Motor Maintenance Report - '+val(motor.serialNo));pdf.setAuthor('Wider Electrical');pdf.setSubject('Motor details, vibration trends and maintenance history');
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
  function newPage(title){page=pdf.addPage([W,H]);rect(0,0,W,7,'#6d28d9');text('WIDER ELECTRICAL',M,24,9,'#4338ca',bold);text('MOTOR MAINTENANCE REPORT',W-220,24,8,'#64748b');line(M,45,W-M,45);text(title,M,62,20,'#172554',bold);y=99;}
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
  const summary=vibrationSummary(vibrationHistory),points=summary.points;
  newPage('Motor overview');
  rect(M,y,CW,94,'#172554');text('EQUIPMENT PROFILE',M+18,y+15,9,'#a5f3fc',bold);
  const name=wrap(motor.motorName||motor.name||motor.position||'Motor',CW-36,18,bold);name.slice(0,2).forEach((s,i)=>text(s,M+18,y+34+i*23,18,'#ffffff',bold));y+=114;
  const info=[['Production line',motor.plant],['Serial number',motor.serialNo],['Motor name / position',motor.motorName||motor.name||motor.position],['Area / location',motor.area||motor.location],['Speed (RPM)',motor.rpm],['Recorded status',motor.status],['Motor ID',motor._id]];
  for(const [key,value] of info){const lines=wrap(value,CW-155,10);const height=Math.max(30,lines.length*14+12);if(y+height>H-75)newPage('Motor overview - continued');rect(M,y,CW,height,'#f8fafc');text(key,M+12,y+9,9,'#6d28d9',bold);for (let i = 0; i < lines.length; i++) { text(lines[i], M+155, y+8+i*14, 10); }y+=height+3;}
  y+=18;if(y+190>H-60)newPage('Vibration snapshot');label('Vibration snapshot');
  const stats=[['Latest',num(summary.latest)+' mm/s'],['Average',num(summary.average)+' mm/s'],['Maximum',num(summary.maximum)+' mm/s']];
  stats.forEach(([key,value],i)=>{const x=M+i*(CW/3);rect(x,y,CW/3-8,62,['#eff6ff','#f5f3ff','#ecfdf5'][i]);text(key,x+12,y+10,9,palette[i],bold);text(value,x+12,y+30,14,palette[i],bold);});y+=78;
  text('Change vs previous: '+(summary.change===null?'Requires two readings':(summary.change>0?'+':'')+num(summary.change)+' mm/s'+(summary.percent===null?' (previous reading is zero)': ' ('+(summary.percent>0?'+':'')+num(summary.percent)+'%)')),M,y,10,'#4338ca',bold);y+=23;
  text('Snapshot and charts use the latest '+points.length+' valid readings (maximum 15).',M,y,9,'#64748b');y+=18;
  text('Full recorded histories follow. Dates are displayed in UTC.',M,y,9,'#64748b');
  newPage('Vibration trend analysis');
  if(!points.length){text('No valid vibration readings are available for charting.',M,y+12,11,'#64748b');}
  else {
    text('Period: '+date(points[0].testDate)+' to '+date(points[points.length-1].testDate)+' | '+points.length+' readings | mm/s',M,y,9,'#64748b');y+=30;
    function chart(type,top){
      rect(M,top,CW,245,'#f8fafc');text(type==='bar'?'READING COMPARISON - BAR CHART':'READING TREND - LINE CHART',M+14,top+12,10,type==='bar'?'#c2410c':'#6d28d9',bold);
      const left=M+43,right=W-M-20,bottom=top+196,range=148,max=Math.max(summary.maximum,1e-10);
      const x=i=>points.length===1?(left+right)/2:left+14+i*(right-left-28)/(points.length-1);const yy=value=>bottom-value/max*range;
      [0,1,2,3,4].forEach(i=>{const v=max*i/4;line(left,bottom-range*i/4,right,bottom-range*i/4,'#e2e8f0');text(num(v),M+7,bottom-range*i/4-4,7,'#64748b');});
      points.forEach((p,i)=>{const color=palette[i%palette.length],px=x(i),py=yy(p.vibrationValue);
        if(type==='bar'){rect(px-9,py,18,Math.max(.7,bottom-py),color);}else{if(i)line(x(i-1),yy(points[i-1].vibrationValue),px,py,'#7c3aed',2);page.drawCircle({x:px,y:H-py,size:3.5,color:c(color)});}
        const label=num(p.vibrationValue);text(label,px-width(label,6.5)/2,py-13,6.5,'#334155',bold);
        const d=new Date(p.testDate).toISOString().slice(5,10).split('-').reverse().join('/');text(d,px-width(d,6.5)/2,bottom+10,6.5,'#475569');text(String(i+1),px-2,bottom+22,6,'#64748b');
      });text('Test date (DD/MM) - oldest to newest',M+150,top+227,8,'#64748b');
    }
    chart('line',y);chart('bar',y+265);
  }
  const sorted=rows=>[...rows].sort((a,b)=>(Date.parse(b.testDate||b.changeDate||b.greasingDate)||0)-(Date.parse(a.testDate||a.changeDate||a.greasingDate)||0));
  table('Vibration history - all '+vibrationHistory.length+' records',['Test date','mm/s','Tested by','Remark'],sorted(vibrationHistory).map(r=>[date(r.testDate),val(r.vibrationValue),val(r.testedBy),val(r.remark)]),[85,60,110,CW-255]);
  table('Motor replacement history - '+motorHistory.length+' records',['Date','Old serial / RPM','New serial / RPM','Reason'],sorted(motorHistory).map(r=>[date(r.changeDate),val(r.oldSerialNo)+' / '+val(r.oldRpm),val(r.newSerialNo)+' / '+val(r.newRpm),val(r.reason)]),[85,125,125,CW-335]);
  table('Greasing history - '+greasingHistory.length+' records',['Date','Grease type','Greased by','Remark'],sorted(greasingHistory).map(r=>[date(r.greasingDate),val(r.greaseType),val(r.greasedBy),val(r.remark)]),[85,110,110,CW-305],true);
  const pages=pdf.getPages();pages.forEach((p,i)=>{page=p;line(M,H-42,W-M,H-42);text('Generated '+new Date(generatedAt).toISOString().replace('T',' ').slice(0,19)+' UTC',M,H-31,7,'#64748b');text('Page '+(i+1)+' / '+pages.length,W-M-55,H-31,7,'#64748b');});
  await Promise.all(tasks);
  return pdf.save();
}
export async function downloadMotorReport(data){
  const bytes=await buildMotorReport(data);const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');
  const name=String(data.motor.serialNo||data.motor._id||'motor').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
  link.href=url;link.download='Motor_Report_'+name+'.pdf';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
