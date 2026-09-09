import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { safetyConfig, safetySummary, safetyBuckets, safetyDetails } from './safetyData';

const W=595.28,H=841.89,M=38,CW=W-M*2;

const c=hex=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
const val=value=>value===null||value===undefined||value===''?'Not recorded':String(value);


export async function buildSafetyReport({kind,rows=[],filters={},generatedAt=new Date()}) {
  const pdf=await PDFDocument.create();
  pdf.setTitle(safetyConfig[kind].title+' Report');pdf.setAuthor('Wider Electrical');
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
  function newPage(title){page=pdf.addPage([W,H]);rect(0,0,W,7,'#6d28d9');text('WIDER ELECTRICAL',M,24,9,'#4338ca',bold);text('SAFETY RECORDS REPORT',W-220,24,8,'#64748b');line(M,45,W-M,45);text(title,M,62,20,'#172554',bold);y=99;}
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
  newPage(safetyConfig[kind].title);
  const stats=safetySummary(kind,rows),buckets=safetyBuckets(kind,rows);
  rect(M,110,CW,55,'#312e81');text('FILTERED SAFETY REPORT',M+15,120,14,'#ffffff',bold);text(rows.length+' records | Current saved values',M+15,143,10,'#e0e7ff');
  y=190;
  stats.forEach(([key,value],i)=>{rect(M,y,CW,40,i%2?'#ecfeff':'#ede9fe');text(key,M+12,y+12,10,'#4338ca',bold);text(value,M+340,y+10,15,'#172554',bold);y+=48;});
  const notes=[
   'Date range: '+(filters.from||'Any')+' to '+(filters.to||'Any'),
   'Status: '+(filters.status||'All'), 'Classification: '+(filters.category||'All'), 'Search: '+(filters.query||'None'),
   kind==='injury'?'Counts use current classification. Lost days are manually verified, not calculated.':kind==='training'?'Participants are attendances, not unique people. Man-hours = hours x participants.':kind==='walk'?'Linked statuses are a snapshot. Legacy free-text observations are not counted.':'Incidents follow Reported, Under Review, Action Pending and Closed.',
   'Missing fields are labelled. This export follows the filters on the page.',
   'Change history is available from each record in the application.'
  ];
  y+=12;
  for(const note of notes){const lines=wrap(note,CW,10);for(const l of lines){if(y>H-65)newPage('Report notes');text(l,M,y,10);y+=15;}y+=8;}
  if(buckets.length){newPage(kind==='near'?'Incidents by location':'Records by month');const max=Math.max(...buckets.map(b=>b[1]),1);const palette=['#0284c7','#db2777','#7c3aed','#d97706','#059669'];
   for(let i=0;i<buckets.length;i++){const [name,count]=buckets[i];const lines=wrap(name,145,9);const height=Math.max(32,lines.length*12+10);if(y+height>H-60)newPage('Chart - continued');for(let n=0;n<lines.length;n++)text(lines[n],M,y+5+n*12,9);rect(M+155,y+4,300*count/max,17,palette[i%palette.length]);text(count,M+465,y+5,10,'#172554',bold);y+=height;}
  }
  rows.forEach((row,index)=>{const details=[['Record ID',row._id||'Not recorded'],...safetyDetails(kind,row)];table('Record '+(index+1)+' - '+(row.date||'Undated'),['Field','Saved value'],details,[150,CW-150]);});
  const pages=pdf.getPages();pages.forEach((p,i)=>{page=p;line(M,H-42,W-M,H-42);text('Generated '+new Date(generatedAt).toISOString().replace('T',' ').slice(0,19)+' UTC',M,H-31,7,'#64748b');text('Page '+(i+1)+' / '+pages.length,W-M-55,H-31,7,'#64748b');});
  await Promise.all(tasks);return pdf.save();
}
export async function downloadSafetyReport(data){const bytes=await buildSafetyReport(data),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='Safety_'+data.kind+'_Report.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
