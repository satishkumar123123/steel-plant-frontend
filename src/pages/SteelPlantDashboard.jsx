import {Link} from 'react-router-dom';
import './SteelPlantDashboard.css';
const sections=[
 {key:'cgl',title:'Continuous Galvanizing Line',path:'/cgl'},
 {key:'crm',title:'Cold Rolling Mill',path:'/crm'},
 {key:'ccl',title:'Colour Coating Line',path:'/ccl'},
 {key:'pickling',title:'Pickling Line',path:'/pickling'},
 {key:'crane',title:'Crane Details',path:'/crane'},
 {key:'safety',title:'Safety Details',path:'/safety'}
];
const wordColours=['#ffffff','#fde68a','#a5f3fc','#fbcfe8','#d9f99d'];
function ColourWords({text}){return text.split(' ').map((word,i)=><span key={i} style={{color:wordColours[i%wordColours.length]}}>{word}{' '}</span>);}
export default function SteelPlantDashboard(){return <main className="apollo-home">
 <header className="apollo-brand"><h1><ColourWords text="Apollo Building Product Limited"/></h1><p>Wider Electrical</p></header>
 <nav className="apollo-hub" aria-label="Plant sections and reports">
  <Link to="/motors/search" className="apollo-report"><span className="apollo-report-content"><strong><ColourWords text="Search Motors & Reports"/></strong></span></Link>
  {sections.map(s=><Link key={s.key} to={s.path} className={`apollo-card apollo-${s.key}`}><h2><ColourWords text={s.title}/></h2></Link>)}
 </nav>
 </main>;}
