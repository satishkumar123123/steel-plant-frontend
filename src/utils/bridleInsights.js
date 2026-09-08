import {bridleGroups,matchBridle} from './bridleData';
export function bridleEntries(motors,readings){return bridleGroups.flatMap(group=>['A','B'].map(position=>{
 const matches=motors.filter(m=>matchBridle(m,group.plant,group.bridle,position));
 const motor=matches.length===1?matches[0]:null,data=motor&&readings[motor._id];
 const status=matches.length===0?'Motor not found':matches.length>1?'Multiple matching motors':!data?'Loading':data.error?'Readings unavailable':!data.points?.length?'No valid readings':'Available';
 return {...group,position,label:group.bridle+position,motor,status,points:status==='Available'?data.points:[]};
}));}
export function insightSummary(entries,now=Date.now()){
 const available=entries.filter(e=>e.points.length).map(e=>{const latest=e.points[e.points.length-1],previous=e.points[e.points.length-2];return {...e,latest,change:previous?latest.vibrationValue-previous.vibrationValue:null,stale:now-Date.parse(latest.testDate)>30*86400000};});
 return {available:available.length,total:entries.length,highest:[...available].sort((a,b)=>b.latest.vibrationValue-a.latest.vibrationValue)[0]||null,increase:available.filter(e=>e.change>0).sort((a,b)=>b.change-a.change)[0]||null,last:[...available].sort((a,b)=>Date.parse(b.latest.testDate)-Date.parse(a.latest.testDate))[0]||null,stale:available.filter(e=>e.stale).length};
}
export function comparisonScale(entries){const points=entries.flatMap(e=>e.points);const times=points.map(p=>Date.parse(p.testDate));return {min:times.length?Math.min(...times):0,max:times.length?Math.max(...times):0,ceiling:Math.max(1,...points.map(p=>p.vibrationValue))};}
