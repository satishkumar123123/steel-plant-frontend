export const normalize=value=>String(value??'').trim().toLowerCase();
export function filterMotors(motors,{query='',plant='',area='',status=''}) {
  const q=normalize(query);
  return motors.filter(m=> (!plant||normalize(m.plant)===normalize(plant)) && (!area||normalize(m.area||m.location)===normalize(area)) && (!status||normalize(m.status)===normalize(status)) &&
    (!q||[m.serialNo,m.motorName,m.name,m.position,m.area,m.location,m.plant,m.bridleNo].map(normalize).join(' ').includes(q)));
}
