const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  menu?.classList.toggle('is-open', !isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menu');
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelector('#year').textContent = new Date().getFullYear();



// Alterna a cobrança exibida nos cards de planos.
const billingToggleButtons = document.querySelectorAll('[data-billing]');
billingToggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const isAnnual = button.dataset.billing === 'annual';
    billingToggleButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('.plan-price[data-annual]').forEach((price) => {
      price.querySelector('strong').textContent = isAnnual ? price.dataset.annual : price.dataset.monthly;
    });
    document.querySelectorAll('.plan-period[data-annual]').forEach((period) => {
      period.textContent = isAnnual ? period.dataset.annual : period.dataset.monthly;
    });
  });
});


// Make the footer return link scroll reliably even when the page is already scrolled.
document.querySelector('.back-top')?.addEventListener('click', (event) => {
  event.preventDefault();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', location.pathname + location.search + '#topo');
});


// Feedbacks da NOZA: rotação automática, com pausas ao interagir.
const feedbackCarousel = document.querySelector('.feedback-carousel');
const feedbackSlides = [...document.querySelectorAll('.feedback-slide')];
let activeFeedback = 0;
const showFeedback = (index) => {
  activeFeedback = (index + feedbackSlides.length) % feedbackSlides.length;
  feedbackSlides.forEach((slide, i) => {
    const active = i === activeFeedback;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
};
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    if (!document.hidden && !feedbackCarousel?.matches(':hover') && !feedbackCarousel?.contains(document.activeElement)) {
      showFeedback(activeFeedback + 1);
    }
  }, 5000);
}


const businessExtras = { hours: 0, guests: 0 };
function updateBusinessPlan() {
  const card = document.querySelector('#business-plan');
  if (!card) return;
  const annual = document.querySelector('[data-billing="annual"]').getAttribute('aria-pressed') === 'true';
  const base = 19900;
  const extra = (businessExtras.hours + businessExtras.guests) * 990;
  const money = cents => (cents / 100).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  card.querySelector('.plan-price strong').textContent = ((base + extra) / 100).toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2});
  document.querySelector('#business-hours').textContent = businessExtras.hours + 'h';
  document.querySelector('#business-guests').textContent = businessExtras.guests;
  const capacity = (10 + businessExtras.hours) + 'h/mês · até ' + (5 + businessExtras.guests) + ' convidados';
  document.querySelector('#business-quota').textContent = capacity + ' por reunião';
  document.querySelector('#business-summary').textContent = capacity + ' · ' + money(base + extra) + '/mês' + (annual ? ' · base anual: ' + money(base * 12) + '; adicionais: ' + money(extra) + '/mês' : '');
  card.querySelectorAll('[data-step="-1"]').forEach(button => {button.disabled = businessExtras[button.dataset.addon] === 0;});
}
document.querySelectorAll('[data-addon]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.addon;
    businessExtras[key] = Math.max(0, businessExtras[key] + Number(button.dataset.step));
    updateBusinessPlan();
  });
});
document.querySelectorAll('[data-billing]').forEach(button => button.addEventListener('click', updateBusinessPlan));
updateBusinessPlan();

// Mantém a personalização na landing page, inclusive pelo teclado.
document.querySelector('#business-plan .plan-select')?.addEventListener('click', (event) => {
  event.preventDefault();
  const customizer = document.querySelector('#business-customizer');
  customizer?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  customizer?.querySelector('[data-addon="hours"][data-step="1"]')?.focus({ preventScroll: true });
});

// Scores demonstrativos com animação automática. Não são dados reais de usuários.
(() => {
  const root=document.querySelector('#scores-performance');
  if(!root) return;
  const buttons=[...root.querySelectorAll('[data-skill]')];
  const examples=[
    {name:'Comunicação',score:76,good:'Você apresentou o objetivo da conversa com clareza e conectou os principais argumentos ao contexto.',gap:'Faltaram pausas para confirmar a compreensão e algumas explicações ficaram longas. Esses pontos impedem um resultado próximo de 100.',next:'Resuma a ideia central em uma frase, faça uma pausa e pergunte se o interlocutor deseja aprofundar.'},
    {name:'Oratória',score:70,good:'Você manteve um ritmo compreensível, articulou as ideias principais e demonstrou segurança na maior parte da apresentação.',gap:'Por que 70 e não 100? Houve variações de ritmo, poucas pausas estratégicas e momentos em que a mensagem perdeu ênfase. Isso reduziu o impacto e a retenção dos argumentos.',next:'Pratique pausas após ideias importantes, varie a entonação e encerre cada argumento com uma conclusão objetiva.'},
    {name:'Escuta',score:68,good:'Você ouviu as respostas e retomou alguns pontos relevantes durante a conversa.',gap:'Em momentos importantes, apresentou a solução antes de explorar completamente as necessidades. Faltaram perguntas de aprofundamento.',next:'Reformule o que ouviu e faça uma pergunta adicional antes de propor uma solução.'},
    {name:'Objetividade',score:82,good:'Você manteve o foco e apresentou argumentos diretos na maior parte da reunião.',gap:'Algumas respostas repetiram informações já explicadas. A redução dessas repetições aumentaria a precisão.',next:'Apresente um ponto por vez e conclua cada tópico com uma ação ou decisão clara.'},
    {name:'Perguntas',score:64,good:'Você fez perguntas relevantes para compreender o cenário inicial.',gap:'Faltaram perguntas sobre critérios de decisão, prioridades e possíveis obstáculos. Por isso o diagnóstico não chega a 100.',next:'Pergunte quais condições precisam ser atendidas para que o interlocutor avance.'},
    {name:'Argumentação',score:73,good:'Você apresentou benefícios concretos e sustentou sua proposta com exemplos.',gap:'Parte dos argumentos não foi conectada diretamente às preocupações manifestadas pelo interlocutor.',next:'Antes de defender um benefício, relacione-o a uma necessidade que a outra pessoa tenha mencionado.'},
    {name:'Condução',score:79,good:'Você organizou a conversa e manteve uma sequência lógica de assuntos.',gap:'O fechamento deixou próximos passos sem responsáveis ou prazos claramente definidos.',next:'Finalize cada reunião confirmando quem fará o quê e quando.'}
  ];
  let selected=1,progress=0,raf=0,started=false,startTime=0;
  const duration=3800;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render(){
    const scores=examples.map(x=>Math.round(x.score*progress));
    const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    root.querySelector('#scores-demo-total').textContent=avg;
    root.querySelector('#scores-demo-ring').style.setProperty('--score',avg);
    buttons.forEach((btn,i)=>{
      btn.querySelector('strong').textContent=scores[i]+'%';
      btn.querySelector('i b').style.width=scores[i]+'%';
      btn.classList.toggle('is-active',i===selected);
      btn.setAttribute('aria-pressed',String(i===selected));
    });
    const skill=examples[selected];
    root.querySelector('#scores-demo-feedback-title').textContent=skill.name+' · '+scores[selected]+'/100';
    root.querySelector('#scores-demo-feedback-text').textContent=skill.good;
    root.querySelector('#scores-demo-gap').textContent=skill.gap;
    root.querySelector('#scores-demo-next').textContent=skill.next;
    root.querySelector('#scores-demo-animation-status').textContent=progress>=1?'Diagnóstico ilustrativo concluído':'Analisando competências...';
  }
  function tick(now){
    if(!startTime)startTime=now;
    const t=Math.min(1,(now-startTime)/duration);
    progress=1-Math.pow(1-t,3);
    render();
    if(t<1)raf=requestAnimationFrame(tick);else{progress=1;render();raf=0;}
  }
  function play(){
    cancelAnimationFrame(raf);raf=0;startTime=0;progress=0;render();
    if(reduceMotion){progress=1;render();return;}
    raf=requestAnimationFrame(tick);
  }
  buttons.forEach((btn,i)=>btn.addEventListener('click',()=>{selected=i;render();}));
  root.querySelector('#scores-demo-replay').addEventListener('click',play);
  render();
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)&&!started){started=true;play();observer.disconnect();}
    },{threshold:0.18});
    observer.observe(root.querySelector('.scores-demo-panel'));
  }else{play();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else if(!document.hidden&&started&&progress<1)play();});
})();
