import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {qrMatrix,qrName,qrLocation,saveQrUrl} from './motorQr';
const W=595.28,H=841.89;
const c=hex=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
const val=v=>v===null||v===undefined||v===''?'Not recorded':String(v);
export async function buildMotorQrPdf(motors,onProgress=()=>{}){
 if(!motors.length)throw Error('No motors selected');
 const pdf=await PDFDocument.create(),regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const tasks=[];let page;
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

 function shortText(value,x,top,maxWidth,size,font=regular){let str=String(value);while(str.length&&width(str,size,font)>maxWidth)str=str.slice(0,-1);if(str!==String(value)){while(str.length&&width(str+'...',size,font)>maxWidth)str=str.slice(0,-1);str+='...';}text(str,x,top,size,'#172554',font);}
 for(let i=0;i<motors.length;i++){
  if(i%6===0){page=pdf.addPage([W,H]);rect(0,0,W,7,'#4338ca');text('WIDER ELECTRICAL | MOTOR QR LABELS',30,20,13,'#312e81',bold);text('Print at 100% / actual size. Scan to open motor details.',30,42,9,'#475569');}
  const motor=motors[i],col=i%2,row=Math.floor((i%6)/2),x=30+col*273,top=68+row*245,w=262;
  rect(x,top,w,232,'#ffffff');line(x,top,x+w,top,'#94a3b8');line(x,top+232,x+w,top+232,'#94a3b8');line(x,top,x,top+232,'#94a3b8');line(x+w,top,x+w,top+232,'#94a3b8');
  rect(x,top,w,26,i%2?'#0e7490':'#4338ca');text('MOTOR DETAILS',x+10,top+7,10,'#ffffff',bold);
  shortText(qrName(motor),x+10,top+34,w-20,12,bold);shortText(qrLocation(motor),x+10,top+52,w-20,9);
  const matrix=qrMatrix(motor),size=matrix.size,extent=136,cell=extent/(size+8),qx=x+(w-extent)/2,qtop=top+68;
  rect(qx,qtop,extent,extent,'#ffffff');
  for(let r=0;r<size;r++)for(let cc=0;cc<size;cc++)if(matrix.get(r,cc))rect(qx+(cc+4)*cell,qtop+(r+4)*cell,cell,cell,'#000000');
  shortText('Serial: '+val(motor.serialNo),x+10,top+204,w-20,9);text('ID: '+motor._id,x+10,top+218,6,'#64748b');
  onProgress(i+1,motors.length);if(i%6===5)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const pages=pdf.getPages();for(let i=0;i<pages.length;i++){page=pages[i];text('Labels generated '+new Date().toISOString().slice(0,10)+' | Serial is a printed snapshot.',30,812,7,'#64748b');text((i+1)+' / '+pages.length,530,812,8,'#64748b');}
 await Promise.all(tasks);return pdf.save();
}
export async function downloadMotorQrPdf(motors,onProgress){const bytes=await buildMotorQrPdf(motors,onProgress),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));saveQrUrl(url,motors.length===1?'Motor_QR_Label_'+motors[0]._id+'.pdf':'Motor_QR_Labels.pdf');setTimeout(()=>URL.revokeObjectURL(url),60000);}
