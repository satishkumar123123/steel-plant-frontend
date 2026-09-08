import {Link} from 'react-router-dom';
import './SteelPlantDashboard.css';
const sections=[
 {key:'cgl',code:'CGL',title:'Continuous Galvanizing',subtitle:'Line equipment & maintenance',path:'/cgl',icon:'◈'},
 {key:'crm',code:'CRM',title:'Cold Rolling Mill',subtitle:'Motors & equipment records',path:'/crm',icon:'◎'},
 {key:'ccl',code:'CCL',title:'Colour Coating Line',subtitle:'Bridles & line equipment',path:'/ccl',icon:'▥'},
 {key:'pickling',code:'PICKLING',title:'Pickling Line',subtitle:'Equipment & service history',path:'/pickling',icon:'≋'},
 {key:'crane',code:'CRANES',title:'Crane Details',subtitle:'Inspections & fault records',path:'/crane',icon:'⌁'},
 {key:'safety',code:'SAFETY',title:'Safety Details',subtitle:'Indicators & safety activities',path:'/safety',icon:'◇'}
];
export default function SteelPlantDashboard(){return <main className="apollo-home">
 <div className="apollo-glow apollo-glow-one" aria-hidden="true"/><div className="apollo-glow apollo-glow-two" aria-hidden="true"/>
 <header className="apollo-brand"><div className="apollo-monogram" aria-hidden="true">A<span/></div><div><p className="apollo-brand-kicker">APOLLO</p><h1>Building Products <span>Limited</span></h1><p className="apollo-department">WIDER ELECTRICAL <span>•</span> EQUIPMENT & MAINTENANCE</p></div><span className="apollo-brand-tag">Plant workspace</span></header>
 <section className="apollo-intro"><span className="apollo-eyebrow">ONE WORKSPACE. EVERY LINE.</span><h2>Your plant.<br/><span>Connected beautifully.</span></h2><p>Choose a production line or open the central reports hub.</p></section>
 <nav className="apollo-hub" aria-label="Plant sections and reports">
  <div className="apollo-orbit" aria-hidden="true"><i/><i/><i/></div>
  <Link to="/motors/search" className="apollo-report"><div className="apollo-report-inner"><span className="apollo-report-icon" aria-hidden="true"><i/><i/><i/><i/></span><span className="apollo-eyebrow">YOUR CENTRAL HUB</span><h2>Search Motors<br/>&amp; Reports</h2><p>Find equipment. Explore trends.<br/>Download your reports.</p><span className="apollo-report-cta">Open reports <b aria-hidden="true">↗</b></span></div></Link>
  {sections.map((s,i)=><Link key={s.key} to={s.path} className={`apollo-card apollo-${s.key}`} style={{'--order':i}}><div className="apollo-card-top"><span className="apollo-card-icon" aria-hidden="true">{s.icon}</span><span className="apollo-card-code">{s.code}</span><span className="apollo-card-arrow" aria-hidden="true">↗</span></div><h3>{s.title}</h3><p>{s.subtitle}</p><span className="apollo-card-bottom">Explore section <span aria-hidden="true">→</span></span></Link>)}
 </nav><footer className="apollo-footer"><span>APOLLO <b>/</b> WIDER ELECTRICAL</span><span>Production lines · Equipment · Insights</span></footer>
 </main>;}
