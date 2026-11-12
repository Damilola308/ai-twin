'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TwinAvatar3D from './TwinAvatar3D';
import { ArrowLeft, ArrowUpRight, AudioLines, Bot, LoaderCircle, Mic, MicOff, Send, Volume2, VolumeX, X } from 'lucide-react';

type Message = { id: number; role: 'assistant' | 'user'; content: string };
type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = { 0: SpeechRecognitionAlternative; isFinal: boolean };
type SpeechRecognitionEvent = { results: ArrayLike<SpeechRecognitionResult> };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; onresult: ((event: SpeechRecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };

declare global { interface Window { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike } }

const starters = ['Tell me about Opeyemi.', 'Walk me through the projects.', 'What is your approach to AI product design?', 'How can I get in touch?'];

export default function TwinExperience() {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, role: 'assistant', content: 'Hey, welcome to my corner of THE CURIOUS LAB. I’m Opeyemi’s AI twin — a curious guide to the work, ideas and thinking behind this portfolio. What would you like to explore?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [preview, setPreview] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceAvailable(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) && 'speechSynthesis' in window);
    return () => { recognition.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, loading]);

  async function sendMessage(raw: string) {
    const message = raw.trim();
    if (!message || loading) return;
    setInput(''); setNotice(''); setLoading(true);
    setMessages((old) => [...old, { id: Date.now(), role: 'user', content: message }]);
    try {
      const response = await fetch('/api/twin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to answer right now.');
      setPreview(data.mode === 'preview');
      setMessages((old) => [...old, { id: Date.now() + 1, role: 'assistant', content: data.answer }]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void sendMessage(input); }

  function startListening() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) { setNotice('Speech recognition is not supported in this browser. You can still type your question.'); return; }
    try {
      const instance = new Speech(); instance.lang = 'en-NG'; instance.interimResults = false;
      instance.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript || ''; setInput(transcript); setListening(false); if (transcript) void sendMessage(transcript); };
      instance.onerror = () => { setListening(false); setNotice('I couldn’t access speech input. Check your microphone permission or type instead.'); };
      instance.onend = () => setListening(false);
      recognition.current = instance; instance.start(); setListening(true); setNotice('');
    } catch { setListening(false); setNotice('Microphone could not be started. Please check browser permissions.'); }
  }

  function stopSpeech() { window.speechSynthesis?.cancel(); setSpeaking(false); }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) { setNotice('Spoken playback is unavailable in this browser.'); return; }
    stopSpeech(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-NG'; utterance.rate = 0.96; utterance.pitch = 1.02;
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => { setSpeaking(false); setNotice('Spoken playback could not start.'); };
    window.speechSynthesis.speak(utterance);
  }

  return <main className="twin-page">
    <header className="twin-topbar"><Link href="/" className="twin-back"><ArrowLeft size={15}/> BACK TO THE LAB</Link><span className="twin-wordmark">THE CURIOUS LAB<span>.</span></span><span className="twin-status"><i/> AI TWIN / ONLINE</span></header>
    <section className="twin-layout">
      <aside className="twin-intro">
        <div className="twin-kicker">AN EXPERIMENT IN DIGITAL IDENTITY <span>✳</span></div>
        <div className="twin-avatar-wrap twin-avatar-wrap-3d"><TwinAvatar3D/><span className="twin-avatar-tag"><span/> 3D PROTOTYPE · CUSTOM MODEL TO REFINE</span></div>
        <div className="twin-intro-copy"><span className="twin-eyebrow">MEET MY DIGITAL COUNTERPART</span><h1>A little more<br/><em>curiosity.</em></h1><p>I’m Opeyemi’s AI twin. Think of me as a thoughtful guide to the projects, ideas and product thinking happening inside this lab.</p></div>
        <div className="twin-disclosure"><Bot size={16}/><p>You’re chatting with an AI representation of Opeyemi, not Opeyemi personally. My answers are grounded in the information shared on this portfolio.</p></div>
        <div className="twin-mini-links"><Link href="/work">EXPLORE THE WORK <ArrowUpRight size={13}/></Link><Link href="/contact">CONTACT OPEYEMI <ArrowUpRight size={13}/></Link></div>
      </aside>
      <section className="twin-chat" aria-label="Conversation with Opeyemi's AI twin">
        <div className="twin-chat-head"><div><span className="twin-eyebrow">THE CONVERSATION</span><h2>Ask me anything<span>.</span></h2></div><div className="twin-mode-switch"><button className={mode === 'text' ? 'selected' : ''} onClick={() => { setMode('text'); if (listening) recognition.current?.stop(); }}>TEXT</button><button className={mode === 'voice' ? 'selected' : ''} onClick={() => { setMode('voice'); if (voiceAvailable && !listening) startListening(); }}>VOICE</button></div></div>
        <div className="twin-chat-body" aria-live="polite">
          {messages.map((message) => <article key={message.id} className={`twin-message ${message.role}`}><span className="twin-message-label">{message.role === 'assistant' ? 'THE TWIN' : 'YOU'}</span><p>{message.content}</p>{message.role === 'assistant' && <button className="twin-speak" onClick={() => speaking ? stopSpeech() : speak(message.content)} aria-label={speaking ? 'Stop spoken response' : 'Play spoken response'}>{speaking ? <VolumeX size={14}/> : <Volume2 size={14}/>} {speaking ? 'STOP' : 'LISTEN'}</button>}</article>)}
          {loading && <div className="twin-thinking"><LoaderCircle size={15}/> THINKING THROUGH IT...</div>}
          <div ref={bottomRef}/>
        </div>
        {messages.length === 1 && <div className="twin-starters"><span className="twin-eyebrow">A FEW PLACES TO START</span><div>{starters.map((starter) => <button key={starter} onClick={() => void sendMessage(starter)}>{starter}<ArrowUpRight size={13}/></button>)}</div></div>}
        {notice && <div className="twin-notice" role="alert">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14}/></button></div>}
        <form className="twin-composer" onSubmit={onSubmit}><input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'voice' ? 'Or type what you’d like to ask...' : 'Ask about the work, ideas, or the person behind them...'} maxLength={1200} aria-label="Your message"/><button type="button" className={`twin-mic ${listening ? 'is-listening' : ''}`} onClick={() => listening ? recognition.current?.stop() : startListening()} aria-label={listening ? 'Stop listening' : 'Start voice input'} disabled={!voiceAvailable}>{listening ? <MicOff size={18}/> : <Mic size={18}/>}</button><button type="submit" className="twin-send" disabled={!input.trim() || loading} aria-label="Send message"><Send size={17}/></button></form>
        <div className="twin-chat-foot"><span>{listening ? <><i className="listening-dot"/> LISTENING — SPEAK NOW</> : loading ? 'PREPARING A RESPONSE...' : 'YOUR CURIOSITY SETS THE DIRECTION'}</span><span>{voiceAvailable ? <><AudioLines size={12}/> VOICE AVAILABLE</> : 'TEXT MODE AVAILABLE'}</span></div>
        {preview && <p className="twin-preview-note">Preview mode: add an OpenAI API key to enable open-ended AI conversations. The current answers use a small set of grounded responses.</p>}
        <p className="twin-privacy-note">In live mode, questions are sent to OpenAI for answers. Browser voice recognition may use your browser’s speech service. Please don’t share sensitive information.</p>
      </section>
    </section>
    <footer className="twin-footer"><span>BUILT WITH CURIOSITY <b>✳</b></span><span>AN AI REPRESENTATION · NOT A HUMAN CONVERSATION</span><Link href="/">RETURN TO PORTFOLIO ↗</Link></footer>
  </main>;
}
