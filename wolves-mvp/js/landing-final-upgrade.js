(()=>{
const sectionMap={
  'Inicio':'inicio','Problema':'problema','Solución':'solucion','ODS':'ods','Cómo funciona':'funciona','Equipo':'equipo','Planes SaaS':'planes-saas','Contacto':'contacto'
};
const guestItems=['Inicio','Problema','Solución','ODS','Cómo funciona','Equipo','Planes SaaS','Contacto'];
const plans={
  Bronce:{price:'$499',limit:'Hasta 300 estudiantes',features:['Alertas basicas del DECE','Wallet de Eight-Coins basicos','Sin chatbot de IA']},
  Plata:{price:'$999',limit:'Hasta 1000 estudiantes',features:['Bot Wolf AI activo','Retos mensuales','Libro mayor blockchain visible']},
  Oro:{price:'$2499',limit:'Estudiantes ilimitados',features:['Avatares NFT personalizables','Soporte DECE 24/7','Descarga completa de reportes CSV']}
};
function install(){
  if(typeof S==='undefined'||typeof e!=='function')return;
  window.pub=publicLanding;
  window.menu=guestMenu;
  render();
}
function guestMenu(){
  if(S.role!=='guest')return originalMenu();
  if(!active||!guestItems.includes(active))active='Inicio';
  e('roleMenu').innerHTML=guestItems.map(item=>`<button data-m="${item}" class="${item===active?'active guest-scroll-active':''}">◆ ${item}</button>`).join('');
  document.querySelectorAll('[data-m]').forEach(btn=>{
    btn.onclick=()=>{
      active=btn.dataset.m;
      render();
      setTimeout(()=>scrollToPublicSection(sectionMap[active]),70);
    };
  });
}
function originalMenu(){
  const arr=menus[S.role];
  if(!active||!arr.includes(active))active=arr[0];
  e('roleMenu').innerHTML=arr.map(m=>`<button data-m="${m}" class="${m===active?'active':''}">◆ ${m}</button>`).join('');
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{active=b.dataset.m;render()});
}
function publicLanding(){
  e('publicView').innerHTML=`
    <div class="landing-final">
      <section class="landing-final-hero landing-final-section" data-section="inicio">
        <div>
          <span class="landing-kicker">● Salud emocional escolar</span>
          <h1>Bienestar que <strong>protege la manada</strong></h1>
          <p>Wolves es la primera plataforma gamificada de contencion emocional escolar en tiempo real. Ayudamos a colegios y estudiantes a conectarse, detectar alertas de vulnerabilidad y potenciar habitos saludables mediante tecnologia empatica.</p>
          <div class="landing-final-actions">
            <button class="primary-btn" data-demo-role="student">Probar como alumno</button>
            <button class="ghost-btn" data-scroll-target="planes-saas">Ver licencias SaaS ↓</button>
            <button class="ghost-btn" data-scroll-target="contacto">Contactar administrador</button>
          </div>
        </div>
        <div class="landing-final-art"><img src="assets/LOBO INICIO.png" alt="Mascota Wolves"></div>
      </section>

      <section class="landing-final-section" data-section="problema">
        <h2 class="section-title-final">Problema vs. Solucion</h2>
        <div class="final-grid-2">
          <article class="landing-info-card problem"><h3>El Problema</h3><p>La desconexion escolar, el estres por examenes y la rumiacion cognitiva pueden pasar desapercibidos. Sin datos oportunos, el DECE llega tarde a estudiantes que necesitan acompanamiento.</p></article>
          <article class="landing-info-card solution" data-section="solucion"><h3>La Solucion Wolves</h3><p>Wolves conecta registro emocional, retos de bienestar, Wolf AI simulado, alertas tempranas y reportes para que la institucion pueda actuar con claridad y cuidado.</p></article>
        </div>
      </section>

      <section class="landing-final-section" data-section="ods">
        <h2 class="section-title-final">Compromiso ODS</h2>
        <div class="final-grid-3">
          <article class="landing-info-card"><h3>ODS 3</h3><p>Salud y Bienestar de los jovenes con autorregulacion, apoyo preventivo y deteccion temprana.</p></article>
          <article class="landing-info-card"><h3>ODS 4</h3><p>Educacion de Calidad con destrezas socioemocionales integradas al entorno escolar.</p></article>
          <article class="landing-info-card"><h3>ODS 9</h3><p>Innovacion educativa con IA, gamificacion, datos y blockchain conceptual responsable.</p></article>
        </div>
      </section>

      <section class="landing-final-section" data-section="funciona">
        <h2 class="section-title-final">Como funciona WOLVES</h2>
        <div class="mini-feature-row">
          <article class="landing-info-card"><h3>1. Mood Check</h3><p>El estudiante registra su emocion escolar y fortalece su racha semanal.</p></article>
          <article class="landing-info-card"><h3>2. Wolf AI</h3><p>El chat empatico orienta y detecta palabras de riesgo critico.</p></article>
          <article class="landing-info-card"><h3>3. DECE</h3><p>El psicologo recibe alertas, agenda citas y guarda seguimientos.</p></article>
          <article class="landing-info-card"><h3>4. Recompensas</h3><p>La constancia desbloquea Eight-Coins, NFTs y logros educativos.</p></article>
        </div>
      </section>

      <section class="landing-final-section" data-section="equipo">
        <h2 class="section-title-final">Equipo Wolves</h2>
        <div class="final-grid-3 team-grid-final">
          <article class="landing-info-card team-card-final"><img class="team-photo-final" src="assets/MAITE.png" alt="Maite Bravo"><h3>Maite Bravo</h3><p>Lider del proyecto y vision de bienestar estudiantil.</p></article>
          <article class="landing-info-card team-card-final"><img class="team-photo-final" src="assets/HAZEL.png" alt="Hazel Yanez"><h3>Hazel Yanez</h3><p>Experiencia de usuario, comunidad y validacion escolar.</p></article>
          <article class="landing-info-card team-card-final"><img class="team-photo-final" src="assets/DAVID.png" alt="David"><h3>David</h3><p>Tecnologia, desarrollo funcional e innovacion educativa WOLVES.</p></article>
        </div>
      </section>

      <section class="landing-final-section" data-section="planes-saas" id="planes-saas">
        <h2 class="section-title-final">Modelos de Suscripcion Institucional</h2>
        <div class="final-grid-3">${Object.entries(plans).map(([name,data])=>planCard(name,data)).join('')}</div>
      </section>

      <section class="landing-final-section contact-final" data-section="contacto">
        <article class="landing-info-card">
          <h2>Contacto</h2>
          <p>Para activar WOLVES en una institucion, selecciona un plan y envia una solicitud. El administrador recibe el registro demo para revisar cupos, presupuesto y activacion.</p>
          <button class="primary-btn" data-plan-contact="Plata">Solicitar contacto institucional</button>
        </article>
        <article class="landing-info-card contact-admin-card">
          <h3>Administrador WOLVES</h3>
          <p><strong>Correo demo:</strong> admin@wolves.com</p>
          <p><strong>Respuesta esperada:</strong> activacion de licencia, configuracion de usuarios y panel DECE.</p>
        </article>
      </section>
    </div>`;
  bindLandingFinal();
}
function planCard(name,data){
  return `<article class="landing-plan-card ${name==='Plata'?'featured':''}">${name==='Plata'?'<span class="landing-plan-tag">Recomendado</span>':''}<h3>Plan ${name}</h3><div class="landing-plan-price">${data.price}<span> USD / ano</span></div><p>${data.limit}</p><ul>${data.features.map(f=>`<li>${f}</li>`).join('')}</ul><button class="primary-btn" data-plan-contact="${name}">Contratar ${name}</button></article>`;
}
function bindLandingFinal(){
  document.querySelectorAll('[data-demo-role]').forEach(btn=>btn.onclick=()=>role(btn.dataset.demoRole));
  document.querySelectorAll('[data-scroll-target]').forEach(btn=>btn.onclick=()=>scrollToPublicSection(btn.dataset.scrollTarget));
  document.querySelectorAll('[data-plan-contact]').forEach(btn=>btn.onclick=()=>openPlanContact(btn.dataset.planContact));
}
function scrollToPublicSection(id){
  const target=document.querySelector(`[data-section="${id}"]`)||document.getElementById(id);
  if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
}
function openPlanContact(plan){
  const modal=document.getElementById('planContactModal')||document.body.appendChild(Object.assign(document.createElement('dialog'),{id:'planContactModal',className:'plan-contact-modal'}));
  modal.innerHTML=`<div class="modal-head"><div><strong>Contactar administrador WOLVES</strong><span>Solicitud institucional para Plan ${plan}</span></div><button class="icon-btn" data-close-plan>×</button></div>
    <form id="planContactForm" class="plan-contact-grid">
      <label>Plan seleccionado<select id="contactPlan"><option ${plan==='Bronce'?'selected':''}>Bronce</option><option ${plan==='Plata'?'selected':''}>Plata</option><option ${plan==='Oro'?'selected':''}>Oro</option></select></label>
      <label>Institucion<input id="contactSchool" required value="Eight Academy"></label>
      <label>Responsable<input id="contactName" required placeholder="Nombre del responsable"></label>
      <label>Correo institucional<input id="contactEmail" type="email" required placeholder="rectorado@colegio.edu.ec"></label>
      <label>Telefono<input id="contactPhone" required placeholder="099 000 0000"></label>
      <label>Numero de estudiantes<input id="contactStudents" type="number" min="1" required placeholder="300"></label>
      <label class="full">Mensaje<textarea id="contactMessage" placeholder="Deseo activar WOLVES y coordinar una demostracion con el administrador."></textarea></label>
      <div class="admin-contact-box full"><strong>Ruta de contacto demo:</strong> esta solicitud se guarda para el administrador en la simulacion local y puede revisarse desde el panel administrador. Correo de referencia: admin@wolves.com.</div>
      <button class="primary-btn full" type="submit">Enviar solicitud al administrador</button>
    </form>`;
  modal.showModal();
  modal.querySelector('[data-close-plan]').onclick=()=>modal.close();
  modal.querySelector('#planContactForm').onsubmit=(ev)=>{
    ev.preventDefault();
    S.planRequests=S.planRequests||[];
    S.planRequests.unshift({id:uid(),plan:contactPlan.value,institution:contactSchool.value,responsible:contactName.value,email:contactEmail.value,phone:contactPhone.value,students:contactStudents.value,message:contactMessage.value||'Solicitud de activacion WOLVES',status:'Nueva',date:new Date().toLocaleString()});
    save();
    toast(`Solicitud del Plan ${contactPlan.value} enviada al administrador`);
    modal.close();
  };
}
if(document.readyState==='complete')install();else addEventListener('load',install);
})();