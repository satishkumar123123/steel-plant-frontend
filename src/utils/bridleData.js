import { normalize } from './motorFilters';
export const bridleGroups = ['CGL','CCL'].flatMap(plant => [...Array.from({length:plant==='CGL'?10:5},(_,i)=>String(i+1)),...(plant==='CGL'?['HBR']:[])].map(bridle=>({plant,bridle})));
export function matchBridle(motor,plant,bridle,position){
  const number=normalize(motor.bridleNo).replace(/^bridle\s*/, '');
  const canonical=/^(hbr|hot\s*bridle)$/.test(number)?'hbr':/^\d+$/.test(number)?String(Number(number)):number;
  return normalize(motor.plant)===normalize(plant)&&normalize(motor.area)==='bridle'&&canonical===normalize(bridle)&&[normalize(position),normalize(bridle)+normalize(position)].includes(normalize(motor.position).replace(/[\s_-]+/g,''));
}
