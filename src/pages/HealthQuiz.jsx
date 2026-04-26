import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import '../styles/HealthQuiz.css';

const BREEDS = ['Indian Pariah','Labrador','Golden Retriever','German Shepherd','Beagle','Pug','Shih Tzu','Rajapalayam','Mudhol Hound','Chippiparai','Kombai','Kanni','Bakharwal','Rampur Greyhound','Himalayan Sheepdog','Dachshund','Rottweiler','Indie (Mixed)','Other'];

const QS = [
  { id:'coat', cat:'Coat & Skin', icon:'✨', q:"How does your dog's coat look and feel?", h:'A healthy coat reflects nutrition and overall health.',
    opts:[{l:'Shiny & smooth',d:'Glossy, no flakes or odor',s:10,e:'🌟'},{l:'Mostly okay',d:'Slight dullness or mild shedding',s:7,e:'👍'},{l:'Dry & flaky',d:'Dandruff, rough patches',s:4,e:'🤔'},{l:'Itchy / red patches',d:'Frequent scratching, hot spots',s:1,e:'😟'}],
    tip:{good:'Keep it up with omega-rich foods like fish oil or sardines.',bad:'Add a teaspoon of coconut oil or sardine to meals. Consult vet if itching persists.'}},
  { id:'energy', cat:'Energy Level', icon:'⚡', q:"How is your dog's energy throughout the day?", h:'Energy patterns tell us about metabolism, nutrition, and mood.',
    opts:[{l:'Energetic & playful',d:'Active, loves walks and games',s:10,e:'🏃'},{l:'Normal energy',d:'Active but rests well too',s:8,e:'🚶'},{l:'Low energy',d:'Tires quickly, sleeps more than usual',s:4,e:'😴'},{l:'Lethargic',d:'Barely wants to move or play',s:1,e:'😞'}],
    tip:{good:'Great energy! Maintain with regular walks and mental stimulation.',bad:'Low energy can signal poor diet or health issues. Try adding protein-rich fresh food.'}},
  { id:'digestion', cat:'Digestion', icon:'💩', q:"How does your dog's stool look most days?", h:'Stool quality is the #1 indicator of digestive health in dogs.',
    opts:[{l:'Firm & brown',d:'Easy to pick up, consistent shape',s:10,e:'✅'},{l:'Slightly soft',d:'Formed but a bit mushy sometimes',s:7,e:'🟡'},{l:'Often loose or runny',d:'Inconsistent, sometimes watery',s:3,e:'🟠'},{l:'Frequent diarrhea',d:'Watery, mucus, or traces of blood',s:1,e:'🔴'}],
    tip:{good:'Solid digestion! Fresh food and probiotics help maintain this.',bad:'Add pumpkin purée or curd (dahi) for gut health. Persistent issues need a vet visit.'}},
  { id:'appetite', cat:'Appetite', icon:'🍽️', q:"How is your dog's appetite at meal times?", h:'Consistent, eager eating signals good health and proper nutrition.',
    opts:[{l:'Eats eagerly every meal',d:'Finishes on time, always excited',s:10,e:'😋'},{l:'Eats well most days',d:'Occasionally leaves some food',s:7,e:'👌'},{l:'Picky eater',d:'Skips meals, needs coaxing',s:4,e:'😒'},{l:'Very poor appetite',d:'Refuses food often, disinterested',s:1,e:'😟'}],
    tip:{good:'Great appetite! Rotate proteins occasionally to keep things exciting.',bad:'Try warming food slightly or adding bone broth. Persistent refusal warrants a vet check.'}},
  { id:'weight', cat:'Body Weight', icon:'⚖️', q:'Does your dog look a healthy weight?', h:'You should feel ribs without pressing hard. A visible waist from above is ideal.',
    opts:[{l:'Ideal — can feel ribs',d:'Visible waist, tuck-up from side',s:10,e:'💪'},{l:'Slightly overweight',d:'Ribs hard to feel, waist less visible',s:6,e:'😐'},{l:'Overweight',d:'No waist, belly sags, waddles',s:3,e:'😟'},{l:'Underweight',d:'Ribs and spine clearly visible',s:3,e:'⚠️'}],
    tip:{good:'Perfect condition! Maintain current portions and exercise.',bad:'Adjust portions by 10-15%. More walks, less treats. A vet can set a target weight.'}},
  { id:'teeth', cat:'Dental Health', icon:'🦷', q:"How are your dog's teeth and breath?", h:'Dental disease affects 80% of dogs over age 3 and impacts overall health.',
    opts:[{l:'Clean teeth, fresh breath',d:'No tartar, pink gums',s:10,e:'😁'},{l:'Slight yellowing',d:'Mild breath, some buildup',s:6,e:'😐'},{l:'Tartar & bad breath',d:'Brown buildup, noticeably smelly',s:3,e:'🤢'},{l:'Red gums / loose teeth',d:'Painful, swollen, bleeding gums',s:1,e:'🚨'}],
    tip:{good:'Keep brushing or give dental chews 2-3x per week.',bad:'Schedule a vet dental cleaning. Raw carrots and dental sticks help between cleanings.'}},
  { id:'hydration', cat:'Hydration', icon:'💧', q:'How much water does your dog drink daily?', h:'Crucial in Indian summers — dehydration is very common and dangerous.',
    opts:[{l:'Drinks regularly throughout the day',d:'Healthy, consistent amount',s:10,e:'👍'},{l:'Drinks only when reminded',d:'Not very enthusiastic about water',s:6,e:'🤔'},{l:'Excessive thirst',d:'Drinks way more than normal',s:3,e:'⚠️'},{l:'Barely drinks',d:'Have to force or add water to food',s:2,e:'😰'}],
    tip:{good:'Great hydration! Add ice cubes to water on hot days for a fun treat.',bad:'Mix water into food. Try buttermilk (chaas) or frozen curd cubes. Excessive thirst may signal diabetes — see a vet.'}},
  { id:'eyes_ears', cat:'Eyes & Ears', icon:'👀', q:"How do your dog's eyes and ears look?", h:'Clear eyes and clean ears indicate strong immune health.',
    opts:[{l:'Bright eyes, clean ears',d:'No discharge, redness, or odor',s:10,e:'🌟'},{l:'Slight discharge',d:'Occasional eye gunk or ear wax',s:6,e:'😐'},{l:'Frequent discharge',d:'Watery eyes, dirty ears regularly',s:3,e:'😟'},{l:'Infected / inflamed',d:'Redness, swelling, bad smell',s:1,e:'🚨'}],
    tip:{good:'Looking great! Wipe ears weekly with a damp cloth to keep them clean.',bad:'Clean ears with vet-approved solution. Chronic issues may indicate allergies — a vet visit is recommended.'}},
  { id:'exercise', cat:'Exercise & Activity', icon:'🎾', q:'How much exercise does your dog get daily?', h:'Regular activity is essential for physical and mental wellbeing.',
    opts:[{l:'45+ min of active play or walks',d:'Daily structured exercise',s:10,e:'🏆'},{l:'20–45 min moderate walks',d:'Regular but not intense',s:7,e:'🚶'},{l:'Under 20 min',d:'Short walks, mostly indoors',s:4,e:'😔'},{l:'Almost no exercise',d:'Stays indoors all day',s:1,e:'😴'}],
    tip:{good:'Excellent routine! Mix in mental games like puzzle toys and sniff walks.',bad:'Start with 2 short walks daily, even 15 min each. Morning walks before Indian summer heat are best.'}},
  { id:'diet', cat:'Diet Quality', icon:'🥗', q:'What does your dog primarily eat?', h:'Diet is the single biggest factor affecting every health metric.',
    opts:[{l:'Fresh / vet-approved home meals',d:'Balanced recipes, quality ingredients',s:10,e:'🌟'},{l:'Premium kibble',d:'Well-known quality brand',s:7,e:'👍'},{l:'Budget kibble',d:'Basic dry food, economy brand',s:4,e:'😐'},{l:'Table scraps / random',d:'No plan, whatever is available',s:2,e:'😰'}],
    tip:{good:'Top marks on diet! Keep rotating proteins for complete nutrition.',bad:'Switching to fresh food can improve coat, energy, and digestion in just 2 weeks. Try Doglicious!'}},
];

function scoreClass(s) {
  if (s >= 8) return 'c-great';
  if (s >= 6) return 'c-ok';
  if (s >= 4) return 'c-warn';
  return 'c-bad';
}

function heroClass(pct) {
  if (pct >= 80) return 'excellent';
  if (pct >= 60) return 'good';
  if (pct >= 40) return 'fair';
  return 'poor';
}

function verdict(pct, name) {
  if (pct >= 80) return { v: 'Excellent Health!', t: `${name} is thriving — keep up the amazing care!` };
  if (pct >= 60) return { v: 'Good Health',       t: `${name} is doing well with a few areas to improve.` };
  if (pct >= 40) return { v: 'Needs Attention',   t: `${name} could be healthier — small changes make a big difference.` };
  return           { v: 'Health Alert',            t: `${name} needs help — let's turn things around together.` };
}

const CIRC = 534;

export default function HealthQuiz() {
  const navigate = useNavigate();
  const [navScrolled,    setNavScrolled]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // wizard: -1 = dog info, 0..9 = questions
  const [step,   setStep]   = useState(-1);
  const [ans,    setAns]    = useState({});
  const [dog,    setDog]    = useState({ name: '', breed: '', age: '', weight: '' });

  // dog info form
  const [dName,   setDName]   = useState('');
  const [dBreed,  setDBreed]  = useState('');
  const [dAge,    setDAge]    = useState('');
  const [dWeight, setDWeight] = useState('');

  // result
  const [result,   setResult]   = useState(null);
  const [aiTip,    setAiTip]    = useState(null);
  const [counter,  setCounter]  = useState(0);
  const [ringOff,  setRingOff]  = useState(CIRC);
  const [barsReady,setBarsReady]= useState(false);

  // cta
  const [ctaName,  setCtaName]  = useState('');
  const [ctaPhone, setCtaPhone] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');

  const resultRef = useRef(null);
  const cardRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Animate ring + counter when result appears
  useEffect(() => {
    if (!result) return;
    const pct = result.score;
    setTimeout(() => setRingOff(CIRC - (pct / 100) * CIRC), 100);
    setTimeout(() => setBarsReady(true), 200);
    let c = 0;
    const iv = setInterval(() => {
      c += 2;
      if (c >= pct) { c = pct; clearInterval(iv); }
      setCounter(c);
    }, 20);
    if (resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return () => clearInterval(iv);
  }, [result]);

  const scrollCard = () => {
    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  const submitDog = () => {
    if (!dName.trim()) { alert("Please enter your dog's name."); return; }
    if (!dBreed)       { alert('Please select a breed.'); return; }
    if (!dAge)         { alert('Please select age.'); return; }
    setDog({ name: dName.trim(), breed: dBreed, age: dAge, weight: dWeight });
    setStep(0);
    scrollCard();
  };

  const pick = (qId, idx) => setAns(prev => ({ ...prev, [qId]: idx }));

  const next = () => {
    if (ans[QS[step].id] === undefined) return;
    setStep(s => s + 1);
    scrollCard();
  };

  const prev = () => { setStep(s => s - 1); scrollCard(); };

  const showResult = () => {
    if (ans[QS[step].id] === undefined) return;
    let total = 0;
    const bd = QS.map(q => {
      const idx = ans[q.id];
      const pts = q.opts[idx].s;
      total += pts;
      return { cat: q.cat, icon: q.icon, score: pts, max: 10, tip: pts >= 7 ? q.tip.good : q.tip.bad };
    });
    const score = Math.round(total);
    setResult({ score, bd, dog });
    setAiTip(null);
    fetchAI(score, bd, dog);
  };

  const fetchAI = async (score, bd, dogInfo) => {
    const low  = bd.filter(b => b.score <= 5).map(b => b.cat).join(', ') || 'none';
    const high = bd.filter(b => b.score >= 8).map(b => b.cat).join(', ') || 'none';
    const prompt = `You are a canine health expert in India. A ${dogInfo.age} ${dogInfo.breed} named ${dogInfo.name} (${dogInfo.weight || 'unknown'}kg) scored ${score}/100 on a health quiz. Weak areas: ${low}. Strong areas: ${high}. Give a warm, personalised 2-3 sentence health insight. Include one India-specific actionable tip (mention a local ingredient, seasonal advice, or common Indian dog health issue). Address the dog by name. No bullet points or lists.`;
    try {
      const res = await fetch('/api/ai-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAiTip(data.tip || fallback(dogInfo.name));
    } catch {
      setAiTip(fallback(dogInfo.name));
    }
  };

  const fallback = (name) =>
    `${name} can benefit from adding fresh seasonal veggies like lauki (bottle gourd) and pumpkin to meals — they are gentle on the gut and packed with fibre. In Indian summers, freeze some curd cubes as a cool, probiotic treat!`;

  const restart = () => {
    setStep(-1); setAns({}); setResult(null); setAiTip(null);
    setCounter(0); setRingOff(CIRC); setBarsReady(false);
    setDName(''); setDBreed(''); setDAge(''); setDWeight('');
    setDog({ name: '', breed: '', age: '', weight: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doWA = () => {
    if (!ctaName || !ctaPhone) { alert('Please enter your name and WhatsApp number.'); return; }
    const msg = encodeURIComponent(
      `🐾 *Doglicious — Dog Health Score Result*\n\nHi! My dog scored ${result.score}/100 on the health quiz.\n\n🐕 Dog: ${result.dog.name}\n🧬 Breed: ${result.dog.breed}\n🎂 Age: ${result.dog.age}\n⚖️ Weight: ${result.dog.weight || 'N/A'} kg\n\nI'd like to book a ₹99 fresh food sample!\n\n👤 Name: ${ctaName}\n📱 Phone: ${ctaPhone}`
    );
    window.open(`https://wa.me/919889887980?text=${msg}`, '_blank');
  };

  const doMail = () => {
    if (!ctaName || !ctaPhone) { alert('Please enter your name and WhatsApp number.'); return; }
    const subj = encodeURIComponent(`[HEALTH QUIZ LEAD] ${ctaName} — ${result.dog.breed} scored ${result.score}/100`);
    const body = encodeURIComponent(`Owner: ${ctaName}\nPhone: ${ctaPhone}\nEmail: ${ctaEmail || 'N/A'}\nDog: ${result.dog.name}\nBreed: ${result.dog.breed}\nAge: ${result.dog.age}\nWeight: ${result.dog.weight || 'N/A'} kg\nHealth Score: ${result.score}/100`);
    window.open(`mailto:woof@doglicious.in?subject=${subj}&body=${body}`, '_blank');
  };

  const openTool = (idx) => navigate('/', { state: { openTool: idx } });

  const total = QS.length + 1;
  const done  = step + 1;
  const pct   = Math.round((done / total) * 100);
  const curQ  = step >= 0 && step < QS.length ? QS[step] : null;
  const isLast = step === QS.length - 1;

  return (
    <>
      <Navbar navScrolled={navScrolled} mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen} openModal={() => {}} openTool={openTool} logoImg={logoImg} />

      {/* Hero */}
      <section className="hq-hero">
        <div className="hq-hero-badge">❤️ Free — Takes 2 Minutes</div>
        <h1>Check Your Dog's <em>Health Score</em></h1>
        <p>Answer 10 quick questions and get an instant personalised health report — designed for Indian pet parents.</p>
        <div className="hq-stats">
          <div className="hq-stat"><b>10</b><span>Quick questions</span></div>
          <div className="hq-stat"><b>2 min</b><span>To complete</span></div>
          <div className="hq-stat"><b>Free</b><span>Always</span></div>
        </div>
      </section>

      {/* Trust */}
      <div className="hq-trust">
        <div><div className="hq-ti">🩺</div><div className="hq-tt">Vet-Designed Quiz</div></div>
        <div><div className="hq-ti">🇮🇳</div><div className="hq-tt">India Climate Adjusted</div></div>
        <div><div className="hq-ti">📊</div><div className="hq-tt">Instant Health Report</div></div>
      </div>

      {/* Quiz */}
      {!result && (
        <section className="hq-qz">
          <div className="hq-qz-head"><h2>Dog Health Score Quiz</h2><p>Be honest — there are no wrong answers!</p></div>

          {/* Progress */}
          <div className="hq-prog">
            <div className="hq-prog-top">
              <span className="hq-pl">{step === -1 ? 'Getting started...' : curQ ? `${curQ.icon} ${curQ.cat}` : ''}</span>
              <span className="hq-pc">{done} / {total}</span>
            </div>
            <div className="hq-prog-bar"><div className="hq-prog-fill" style={{ width: `${pct}%` }} /></div>
          </div>

          <div className="hq-card" ref={cardRef}>
            {/* Dog info */}
            {step === -1 && (
              <div>
                <div className="hq-ql">Let's start</div>
                <div className="hq-qt">First, tell us about your dog</div>
                <div className="hq-qh">This helps us personalise your health report with breed and age-specific insights.</div>
                <div className="hq-df"><label>🐾 Dog's name</label>
                  <input className="hq-input" type="text" placeholder="e.g. Bruno" value={dName} onChange={e => setDName(e.target.value)} /></div>
                <div className="hq-df"><label>🧬 Breed</label>
                  <select className="hq-select" value={dBreed} onChange={e => setDBreed(e.target.value)}>
                    <option value="">Select breed...</option>
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select></div>
                <div className="hq-df"><label>🎂 Age</label>
                  <select className="hq-select" value={dAge} onChange={e => setDAge(e.target.value)}>
                    <option value="">Select age...</option>
                    <option value="Puppy (0-12 months)">Puppy (0–12 months)</option>
                    <option value="Young (1-3 years)">Young (1–3 years)</option>
                    <option value="Adult (3-7 years)">Adult (3–7 years)</option>
                    <option value="Senior (7+ years)">Senior (7+ years)</option>
                  </select></div>
                <div className="hq-df"><label>⚖️ Weight (kg)</label>
                  <input className="hq-input" type="number" placeholder="e.g. 15" value={dWeight} onChange={e => setDWeight(e.target.value)} /></div>
                <button className="hq-bn hq-bn-p" onClick={submitDog}>Start the Quiz →</button>
              </div>
            )}

            {/* Question */}
            {curQ && (
              <div>
                <div className="hq-ql">Question {step + 1} of {QS.length} — {curQ.icon} {curQ.cat}</div>
                <div className="hq-qt">{curQ.q}</div>
                <div className="hq-qh">{curQ.h}</div>
                <div className="hq-opts">
                  {curQ.opts.map((o, i) => (
                    <div key={i} className={`hq-opt${ans[curQ.id] === i ? ' on' : ''}`} onClick={() => pick(curQ.id, i)}>
                      <div className="hq-dot" />
                      <span className="hq-oe">{o.e}</span>
                      <div className="hq-oc">
                        <div className="hq-ol">{o.l}</div>
                        <div className="hq-od">{o.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className={`hq-bn ${isLast ? 'hq-bn-a' : 'hq-bn-p'}`}
                  disabled={ans[curQ.id] === undefined}
                  onClick={isLast ? showResult : next}
                >
                  {isLast ? '🐾 Get My Health Score' : 'Next Question →'}
                </button>
                <button className="hq-bb" onClick={step > 0 ? prev : () => setStep(-1)}>
                  ← {step > 0 ? 'Previous' : 'Back'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="hq-res" ref={resultRef}>
          <div className={`hq-sc-hero ${heroClass(result.score)}`}>
            <div className="hq-sc-label">Your Dog's Health Score</div>
            <div className="hq-ring-w">
              <svg viewBox="0 0 200 200">
                <circle className="hq-rbg" cx="100" cy="100" r="85" />
                <circle className="hq-rfill" cx="100" cy="100" r="85"
                  strokeDasharray="534" strokeDashoffset={ringOff} />
              </svg>
              <div className="hq-sc-num">
                <div className="hq-big">{counter}</div>
                <div className="hq-of">/ 100</div>
              </div>
            </div>
            <div className="hq-sc-verdict">{verdict(result.score, result.dog.name).v}</div>
            <div className="hq-sc-tag">{verdict(result.score, result.dog.name).t}</div>
          </div>

          <div className="hq-bdw">
            <h3>Health Breakdown</h3>
            {result.bd.map((b, i) => (
              <div className="hq-bdc" key={i}>
                <div className="hq-bi">{b.icon}</div>
                <div className="hq-bc">
                  <div className="hq-bl">{b.cat}</div>
                  <div className="hq-bbar">
                    <div className={`hq-bf ${scoreClass(b.score)}`}
                      style={{ width: barsReady ? `${(b.score / b.max) * 100}%` : '0%' }} />
                  </div>
                </div>
                <div className="hq-bs">{b.score}/10</div>
              </div>
            ))}

            {/* Tips for weak areas */}
            {result.bd.filter(b => b.score < 7).length > 0 && (
              <div className="hq-tips-card">
                <h4>🎯 Top Priorities to Improve</h4>
                {result.bd.filter(b => b.score < 7).sort((a, b) => a.score - b.score).slice(0, 4).map((w, i) => (
                  <div className="hq-tip-row" key={i}>
                    <div className="hq-te">{w.icon}</div>
                    <div className="hq-tc">
                      <div className="hq-th">{w.cat} ({w.score}/10)</div>
                      <div className="hq-td">{w.tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fresh nudge */}
            <div className="hq-nudge">
              <div className="hq-ni">🥬</div>
              <div>
                <div className="hq-nt">Switch to fresh food → improves health score</div>
                <div className="hq-nd">Dogs on fresh, home-style food show better coat, digestion, and energy within 2 weeks. Backed by nutrition science.</div>
              </div>
            </div>

            {/* AI insight */}
            <div className="hq-ai-card">
              <div className="hq-ai-h">
                <span className="hq-ai-badge">✨ AI</span>
                <span className="hq-ai-t">Personalised Health Insight</span>
              </div>
              <div className="hq-ai-b">
                {aiTip === null ? (
                  <><div className="hq-ai-sh" style={{ width: '100%' }} /><div className="hq-ai-sh" style={{ width: '82%' }} /><div className="hq-ai-sh" style={{ width: '60%' }} /></>
                ) : aiTip}
              </div>
            </div>

            {/* CTA */}
            <div className="hq-cta">
              <div className="hq-cp">₹99</div>
              <div className="hq-ch">Improve Your Dog's Score</div>
              <div className="hq-cs">Book a Doglicious fresh food sample.<br />Talk to our pet nutrition expert.</div>
              <div className="hq-cta-form">
                <input className="hq-ci" type="text"  placeholder="Your name"       value={ctaName}  onChange={e => setCtaName(e.target.value)} />
                <input className="hq-ci" type="tel"   placeholder="WhatsApp number" value={ctaPhone} onChange={e => setCtaPhone(e.target.value)} />
                <input className="hq-ci" type="email" placeholder="Email (optional)" value={ctaEmail} onChange={e => setCtaEmail(e.target.value)} />
              </div>
              <div className="hq-cta-btns">
                <button className="hq-cb hq-cb-wa" onClick={doWA}>💬 WhatsApp</button>
                <button className="hq-cb hq-cb-bk" onClick={doMail}>📧 Book Now</button>
              </div>
            </div>

            <button className="hq-retake" onClick={restart}>🔄 Retake Quiz</button>
          </div>
        </section>
      )}

      <Footer openModal={() => {}} openTool={openTool} />
    </>
  );
}
