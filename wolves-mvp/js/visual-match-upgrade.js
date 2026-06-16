(()=>{
const WOLVES_ASSETS={
  heroWolf:'assets/LOBO INICIO.png',
  moods:{
    Alegre:'assets/ALEGRE.png',
    Tranquilo:'assets/TRANQUILO.png',
    Triste:'assets/TRISTE.png',
    Ansioso:'assets/ANSIOSO.png',
    Enojado:'assets/ENOJADO.png'
  }
};

function safePlan(name,price,subtitle,features,featured){
  if(typeof plan==='function') return plan(name,price,subtitle,features,featured);
  return `<article class="plan-card ${featured?'featured':''}"><h3>Plan ${name}</h3><strong>${price}</strong><span>USD / año</span><p>${subtitle}</p><ul>${features.map(f=>`<li>${f}</li>`).join('')}</ul><button class="primary-btn buy-plan" data-plan="${name}">Contratar ${name}</button></article>`;
}

function bindVisualLanding(){
  if(typeof bindLanding==='function') bindLanding();
  document.querySelectorAll('.buy-plan').forEach(btn=>{
    btn.addEventListener('click',()=>{
      if(typeof toast==='function') toast(`Contrato ${btn.dataset.plan} simulado correctamente. WOLVES activará la licencia institucional.`);
    });
  });
}

function mondayOf(date){
  const d=new Date(date);
  const day=d.getDay()||7;
  d.setDate(d.getDate()-day+1);
  d.setHours(0,0,0,0);
  return d;
}
function isoDate(date){return date.toISOString().slice(0,10);}
function activeUserEmail(){return typeof user==='function'?user().email:S.currentUser;}
function moodForDay(dayIndex){
  const start=mondayOf(new Date());
  const target=new Date(start);
  target.setDate(start.getDate()+dayIndex);
  const date=isoDate(target);
  return (S.moods||[]).filter(m=>m.student===activeUserEmail()&&m.date===date).slice(-1)[0]||null;
}
function streakGrid(){
  const days=['Lun','Mar','Mié','Jue','Vie'];
  return days.map((day,index)=>{
    const entry=moodForDay(index);
    if(!entry)return `<div class="visual-week-cell pending"><strong>${day}</strong><span class="week-dash">-</span></div>`;
    const img=WOLVES_ASSETS.moods[entry.emotion]||WOLVES_ASSETS.moods.Alegre;
    return `<div class="visual-week-cell done"><strong>${day}</strong><img src="${img}" alt="${entry.emotion}"><span class="week-check">✓</span></div>`;
  }).join('');
}

window.addEventListener('load',()=>{
  if(typeof e!=='function') return;

  pub=window.pub=function pubVisualWolves(){
    e('publicView').innerHTML=`
      <section class="real-hero">
        <div class="real-hero-copy">
          <span class="landing-kicker"><i></i> Salud emocional escolar</span>
          <h1>Bienestar que<br><strong>protege la manada</strong></h1>
          <p>Wolves es la primera plataforma gamificada de contención emocional escolar en tiempo real. Ayudamos a colegios y estudiantes a conectarse, detectar alertas de vulnerabilidad y potenciar hábitos saludables mediante tecnología empática.</p>
          <div class="landing-actions">
            <button class="primary-btn guest-student">Probar como alumno</button>
            <button class="ghost-btn guest-mood">Iniciar Mood Check</button>
            <button class="ghost-btn guest-ai">Hablar con Wolf AI</button>
            <button class="ghost-btn scroll-plans">Ver Licencias SaaS</button>
          </div>
        </div>
        <div class="real-hero-art"><img src="${WOLVES_ASSETS.heroWolf}" alt="Mascota Wolves"></div>
      </section>
      <section class="compare-grid real-compare">
        <article class="compare-card problem-card"><span>⚠</span><h2>El Problema</h2><p>La desconexión escolar, el estrés por exámenes y la rumiación cognitiva pasan desapercibidos hasta que es tarde. Los colegios carecen de datos en tiempo real y flujos preventivos de apoyo inmediato.</p></article>
        <article class="compare-card solution-card"><span>🛡</span><h2>La Solución: Wolves</h2><p>Contención activa mediante inteligencia artificial empática, registros diarios de humor, retos interactivos de respiración y una red blockchain transparente que premia la constancia del alumno y alerta al DECE.</p></article>
      </section>
      <section class="ods-upgrade"><h2>Compromiso ODS de la ONU</h2><div class="section-grid">
        <article class="card"><h3>ODS 3</h3><p>Salud y Bienestar de los jóvenes mediante autorregulación escolar.</p></article>
        <article class="card"><h3>ODS 4</h3><p>Educación de Calidad integrando destrezas socioemocionales.</p></article>
        <article class="card"><h3>ODS 9</h3><p>Innovación educativa con IA, gamificación y analítica preventiva.</p></article>
      </div></section>
      <section id="planes-saas" class="plans-upgrade"><h2>Modelos de Suscripción Institucional</h2><div class="plans-grid">
        ${safePlan('Bronce','$499','Hasta 300 estudiantes',['Alertas básicas del DECE','Wallet de Eight-Coins básicos','Sin chatbot de IA'])}
        ${safePlan('Plata','$999','Hasta 1000 estudiantes',['Bot Wolf AI activo','Retos mensuales','Libro mayor blockchain visible'],1)}
        ${safePlan('Oro','$2499','Estudiantes ilimitados',['Avatares NFT personalizables','Soporte DECE 24/7','Descarga completa de reportes CSV'])}
      </div></section>`;
    bindVisualLanding();
  };

  mood=window.mood=function moodVisualWolves(){
    const current=typeof emotion==='string'?emotion:'Alegre';
    const rows=[
      ['Alegre','Alegre, me siento feliz'],
      ['Tranquilo','Tranquilo'],
      ['Triste','Triste'],
      ['Ansioso','Ansioso'],
      ['Enojado','Enojado']
    ];
    return `<section class="mood-upgrade real-mood">
      <div class="mood-title"><h2>Registra tu Emoción Hoy</h2><p>¿Cómo te sientes hoy? Cada registro fortalece la manada y te acerca a recompensas especiales.</p></div>
      <div class="emotion-grid real-emotion-grid">
        ${rows.map(([name,text])=>`<button class="choice emo emotion mood-choice real-emotion-card ${current===name?'active':''}" data-e="${name}" data-emotion="${name}"><img src="${WOLVES_ASSETS.moods[name]}" alt="${name}"><strong>${name}</strong><small>${text}</small><span class="select-ring"></span></button>`).join('')}
      </div>
      <article class="card mood-form">
        <label>Intensidad de la emoción (1 a 5)<input id="intensity" type="range" min="1" max="5" value="3"></label>
        <div class="range-labels"><span>1 - Muy Leve</span><span>2 - Leve</span><span>3 - Moderada</span><span>4 - Fuerte</span><span>5 - Extrema</span></div>
        <label>Comentario explicativo (opcional)<textarea id="comment" placeholder="Describe brevemente el motivo escolar o personal de tu emoción..."></textarea></label>
        <button class="primary-btn" id="saveMood">Registrar emoción hoy</button>
      </article>
      <article class="card full visual-streak-card">
        <h3>Representación de tu racha de registros de lunes a viernes</h3>
        <div class="visual-school-week">${streakGrid()}</div>
        <div class="streak-note"><strong>⚠ Nota de racha escolar:</strong> Los fines de semana (sábado y domingo) <b>no se contabilizan</b> en la racha de Wolves. Obtendrás <b>+2 Eight-Coins</b> por cada registro diario de Lunes a Viernes. Completa los 5 días consecutivos de la semana para el superbóno de <b>+10 Eight-Coins</b>. Si fallas un solo día escolar, el contador de racha semanal se reinicia automáticamente a 0.</div>
      </article>
    </section>`;
  };

  if(typeof render==='function') render();
});
})();
