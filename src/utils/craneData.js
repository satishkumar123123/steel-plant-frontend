export const SAFETY_KEYS = ['craneHooter','mhUpDownLimitSwitch','ahUpDownLimitSwitch','crossTravelLimitSwitch','longTravelLimitSwitch'];
export const BRAKE_KEYS = ['mainHoistBrakeGap','auxHoistBrakeGap','crossTravelBrakeGap','longTravelBrakeGap'];
const LABELS = {craneHooter:'Crane hooter',mhUpDownLimitSwitch:'Main hoist limit switch',ahUpDownLimitSwitch:'Aux hoist limit switch',crossTravelLimitSwitch:'Cross travel limit switch',longTravelLimitSwitch:'Long travel limit switch',mainHoistBrakeGap:'Main hoist brake gap',auxHoistBrakeGap:'Aux hoist brake gap',crossTravelBrakeGap:'Cross travel brake gap',longTravelBrakeGap:'Long travel brake gap'};
export const checkLabel = key => LABELS[key] || key;
export const isInspection = record => record.recordType === 'inspection' && record.inspectionData && typeof record.inspectionData === 'object';
export function inspectionIssues(record) {
  if (!isInspection(record)) return [];
  const result=[];
  for (const [group,keys] of [['safetyChecks',SAFETY_KEYS],['brakeChecks',BRAKE_KEYS]]) {
    for (const key of keys) {
      const value=record.inspectionData[group]?.[key];
      if (value === 'Not OK' || value === 'Outside Limit') {
        const issueKey=group+'_'+key,stored=record.issues?.[issueKey];
        result.push({issueKey,group,key,value,status:stored?.status === 'Resolved'?'Resolved':'Open',resolvedBy:stored?.resolvedBy,resolvedAt:stored?.resolvedAt,resolutionAction:stored?.resolutionAction});
      }
    }
  }
  return result;
}
export function craneAnalytics(history=[]) {
  const inspections=history.filter(isInspection);
  const dated=inspections.filter(r=>r.updatedAt && Number.isFinite(Date.parse(r.updatedAt))).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)||String(b._id||'').localeCompare(String(a._id||'')));
  const allIssues=inspections.flatMap(record=>inspectionIssues(record).map(issue=>({...issue,record})));
  const countGroup=(record,keys,group,good,bad)=>keys.every(key=>[good,bad].includes(record.inspectionData[group]?.[key]))?keys.filter(key=>record.inspectionData[group][key]===bad).length:null;
  const points=dated.slice(0,15).reverse().map(record=>({record,safety:countGroup(record,SAFETY_KEYS,'safetyChecks','OK','Not OK'),brake:countGroup(record,BRAKE_KEYS,'brakeChecks','Within Limit','Outside Limit')}));
  const recurring=[...SAFETY_KEYS,...BRAKE_KEYS].map(key=>({key,label:checkLabel(key),count:allIssues.filter(issue=>issue.key===key).length})).filter(item=>item.count>0).sort((a,b)=>b.count-a.count);
  return {inspections,points,allIssues,open:allIssues.filter(i=>i.status==='Open').length,resolved:allIssues.filter(i=>i.status==='Resolved').length,total:inspections.length,last:dated[0]?.updatedAt||null,legacyCount:history.length-inspections.length,undated:inspections.length-dated.length,recurring};
}
