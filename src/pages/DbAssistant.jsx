import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import './DbAssistant.css';
const API = process.env.REACT_APP_API_URL;
const suggestions = ['CGL mein total motors kitne hain?', 'Breakdown motors ka saved status dikhao', 'Crane inspection history mein kya faults hain?', 'Unsafe issues ke open aur closed counts batao'];
export default function DbAssistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef(null), pending = useRef(false), end = useRef(null), mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { end.current?.scrollIntoView?.({block: 'nearest'}); }, [messages, busy]);
  async function send(value) {
    const text = value.trim();
    if (!text || pending.current) return;
    if (!API) { setError('Backend URL is not configured. Set REACT_APP_API_URL and redeploy.'); return; }
    const prior = messages.slice(-6).map(m => ({role: m.role, content: m.content.slice(0, 1500)}));
    pending.current = true; setBusy(true); setError('');
    const request = new AbortController(); controller.current = request;
    const timer = setTimeout(() => request.abort(), 90000);
    try {
      const response = await fetch(API.replace(/\/$/, '') + '/assistant/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question: text, history: prior}), signal: request.signal });
      let data;
      try { data = await response.json(); } catch { throw Error('The backend did not return a chatbot response. Please check its deployment.'); }
      if (!response.ok) throw Error(data.message || 'Could not answer. Please retry.');
      if (typeof data.answer !== 'string' || !Array.isArray(data.sources)) throw Error('Invalid chatbot response. Please retry.');
      if (mounted.current) {
        setMessages(prev => [...prev, {role: 'user', content: text}, {role: 'assistant', content: data.answer, mode: data.mode, notice: data.notice, checkedAt: data.checkedAt, sources: data.sources}].slice(-30));
        setQuestion('');
      }
    } catch (e) {
      if (mounted.current) setError(e.name === 'AbortError' ? 'The request took too long. Please retry.' : e.message);
    } finally {
      clearTimeout(timer); pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return <main className="db-chat-page"><div className="db-chat-shell">
    <Link className="db-chat-back" to="/motors/search">← Master</Link>
    <header className="db-chat-hero"><small>WIDER ELECTRICAL · SAVED DATA</small><h1>AI Database Assistant</h1><p>Ask about motors, vibration, greasing, cranes, AC repairs and safety records in Hindi, Hinglish or English.</p><div className="db-chat-badges"><span>Fresh database read per question</span><span>Read-only answers</span><span>Sources included</span></div></header>
    <section className="db-chat-panel" aria-label="Database assistant">
      <div className="db-chat-toolbar"><h2>Ask your plant data</h2><button type="button" disabled={busy || !messages.length} onClick={() => {setMessages([]); setError('');}}>Clear chat</button></div>
      {!messages.length && <div className="db-chat-welcome"><h3>What would you like to check?</h3><p>For one motor, include its serial number or database ID. Each answer uses saved records; this assistant does not continuously monitor equipment.</p><div className="db-chat-suggestions">{suggestions.map(text => <button key={text} type="button" disabled={busy} onClick={() => setQuestion(text)}>{text}</button>)}</div></div>}
      <div className="db-chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
        {messages.map((message, index) => <article key={index} className={'db-chat-message db-chat-' + message.role}>
          <strong>{message.role === 'user' ? 'You' : message.mode === 'ai' ? 'AI assistant' : 'Database summary · Basic mode'}</strong>
          {message.notice && <p className="db-chat-notice">{message.notice}</p>}
          <div className="db-chat-answer">{message.content}</div>
          {message.sources && <details className="db-chat-sources"><summary>Database sources · {message.checkedAt && new Date(message.checkedAt).toLocaleString()}</summary><p>Records are read during this request. Examples are limited; text and nested arrays may be shortened.</p>{message.sources.map(source => <div key={source.collection}><b>{source.collection}</b>: {source.total} matching records · {source.returned} provided{source.truncated ? ' · Limited sample' : ''}{source.groupsTruncated ? ' · Group breakdown limited' : ''}{source.recordIds?.length > 0 && <small>Record IDs: {source.recordIds.join(', ')}</small>}</div>)}</details>}
        </article>)}
        {busy && <p className="db-chat-loading" role="status">Reading saved database records and preparing an answer…</p>}<div ref={end}/>
      </div>
      {error && <p className="db-chat-error" role="alert">{error} Your question is kept below.</p>}
      <form className="db-chat-form" onSubmit={event => {event.preventDefault(); send(question);}}><label htmlFor="db-chat-question">Your question</label><textarea id="db-chat-question" placeholder="Example: CGL mein breakdown motors kitne hain?" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} rows={3} disabled={busy}/><div><small>{question.length}/1000 · Check sources before acting on an answer.</small><button type="submit" disabled={busy || !question.trim()}>{busy ? 'Checking…' : 'Ask database →'}</button></div></form>
    </section>
  </div></main>;
}
