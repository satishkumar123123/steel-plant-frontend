import QRCode from 'qrcode';
export const MOTOR_SITE='https://steel-plant-frontend.vercel.app';
export const motorUrl=motor=>{if(!/^[a-f0-9]{24}$/i.test(String(motor._id||'')))throw Error('Invalid motor ID');return MOTOR_SITE+'/motor/'+motor._id;};
export const qrName=m=>String(m.position||m.motorName||m.name||'Motor');
export const qrLocation=m=>[m.plant,m.area||m.location,m.bridleNo!=null?'Bridle '+m.bridleNo:''].filter(Boolean).join(' · ');
export const qrMatrix=m=>QRCode.create(motorUrl(m),{errorCorrectionLevel:'M'}).modules;
export async function qrPng(m){return QRCode.toDataURL(motorUrl(m),{width:1024,margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}});}
export function saveQrUrl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();}
export async function downloadQrPng(m){saveQrUrl(await qrPng(m),'Motor_QR_'+m._id+'.png');}
