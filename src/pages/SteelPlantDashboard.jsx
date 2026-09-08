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
export default function SteelPlantDashboard(){return <main className="apollo-home">
 <header className="apollo-brand"><h1>Apollo Building Product Private Limited</h1><p>Wider Electrical</p></header>
 <nav className="apollo-hub" aria-label="Plant sections and reports">
  <Link to="/motors/search" className="apollo-report"><span className="apollo-report-content"><strong>Search Motors<br/>&amp; Reports</strong><span className="apollo-click">Click Me</span></span></Link>
  {sections.map(s=><Link key={s.key} to={s.path} className={`apollo-card apollo-${s.key}`}><h2>{s.title}</h2><span className="apollo-click">Click Me</span></Link>)}
 </nav>
 </main>;}
