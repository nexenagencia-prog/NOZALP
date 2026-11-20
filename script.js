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
    {name:"Comunicação",score:76,good:"Você explicou sua proposta, mas a reação do interlocutor indicou uma dúvida que não foi explorada: como a solução resolveria o problema dele na prática.",gap:"O que limitou sua nota: você continuou detalhando funcionalidades sem confirmar se a pessoa havia entendido o benefício. Quando isso acontece, o cliente pode ouvir bastante e ainda não perceber valor.",next:"Como a IA ajuda: ela destaca essa mudança de assunto e sugere uma pergunta como: “Qual parte dessa solução faria mais diferença no seu dia a dia?”. Assim, você deixa de apenas apresentar e passa a construir relevância."},
    {name:"Oratória",score:70,good:"Sua fala transmitiu segurança, mas um argumento importante perdeu força porque você acelerou justamente no momento de explicar o principal benefício.",gap:"Por que 70 e não 100? O ritmo ficou rápido, faltaram pausas depois das ideias centrais e a entonação não diferenciou o essencial do secundário. Não é falta de conteúdo, é uma oportunidade de aumentar o impacto da mensagem.",next:"Como a IA ajuda: ela identifica trechos de fala acelerada e aponta onde pausar, enfatizar ou simplificar. Na próxima apresentação, você pode testar: apresentar o benefício, fazer uma pausa e perguntar “Isso faz sentido para o seu cenário?”."},
    {name:"Escuta",score:68,good:"O cliente mencionou preocupação com o tempo de implantação. Você respondeu com mais benefícios, mas não investigou o que aquela preocupação significava para ele.",gap:"O que impediu uma nota maior: a resposta veio antes da compreensão completa. Uma objeção aparentemente técnica pode esconder uma prioridade operacional que você ainda não conhece.",next:"Como a IA ajuda: ela recupera a preocupação verbalizada e sugere uma pergunta mais útil: “O maior risco para vocês é o prazo ou a adaptação da equipe?”. Você ganha contexto antes de tentar convencer."},
    {name:"Objetividade",score:82,good:"Você conduziu a conversa com foco, mas voltou ao mesmo argumento três vezes. Repetir uma boa ideia nem sempre aumenta sua força.",gap:"O que faltou para 100: alguns detalhes prolongaram a explicação sem acrescentar informação decisiva. Isso pode dispersar a atenção no momento de escolher um próximo passo.",next:"Como a IA ajuda: ela destaca repetições e ajuda a condensar o raciocínio em três partes: problema identificado, benefício relevante e decisão necessária. Menos informação desnecessária, mais clareza."},
    {name:"Perguntas",score:64,good:"Você perguntou sobre necessidades gerais, mas não descobriu quais critérios o cliente usaria para tomar a decisão.",gap:"Por que a pontuação ficou em 64: sem conhecer prioridades, prazo e possíveis impedimentos, sua argumentação depende mais de suposições do que de respostas concretas.",next:"Como a IA ajuda: ela aponta lacunas na investigação e sugere perguntas como: “O que precisa acontecer para você considerar essa proposta viável?”. A conversa passa a revelar critérios reais, não apenas opiniões."},
    {name:"Argumentação",score:73,good:"Você destacou a economia oferecida pela solução. O cliente, porém, falou duas vezes sobre o risco de mudar o processo atual. Seu argumento era válido, mas não respondia à preocupação principal.",gap:"Por que não foi 100: houve um desencontro entre o benefício apresentado e a objeção expressa. Quando o argumento não encontra a necessidade, a negociação pode ficar parada mesmo com uma boa oferta.",next:"Como a IA ajuda: ela conecta a objeção ao argumento e sugere mudar o foco: “Antes de falar em economia, posso mostrar como a implantação preserva a rotina da equipe?”. Você passa a responder ao que realmente foi dito."},
    {name:"Condução",score:79,good:"A reunião avançou bem e houve interesse na proposta, mas terminou sem um compromisso claro sobre a próxima etapa.",gap:"O que limitou a performance: o interlocutor concordou com os benefícios, porém ninguém definiu responsável, data ou critério para continuar. Uma conversa positiva não é o mesmo que um avanço confirmado.",next:"Como a IA ajuda: ela identifica decisões pendentes e ajuda a formular um fechamento concreto: “Podemos agendar uma validação com sua equipe para quinta-feira?”. O objetivo é transformar interesse em próximo passo definido."}
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
