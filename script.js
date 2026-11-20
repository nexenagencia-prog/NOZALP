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

// Demonstração de scores na landing page. Dados fictícios, sem conexão com conta ou reuniões reais.
(() => {
  const root = document.querySelector('#scores-performance');
  if (!root) return;
  const slider = root.querySelector('#scores-demo-progress');
  const buttons = [...root.querySelectorAll('[data-skill]')];
  const examples = [
    {name:'Comunicação',score:59,feedback:'Sua mensagem apresenta uma estrutura compreensível. Em alguns momentos, explicações longas podem reduzir a clareza do ponto central.',next:'Comece pela ideia principal, confirme se ela foi compreendida e só depois aprofunde os detalhes.'},
    {name:'Clareza',score:59,feedback:'A intenção da fala está bem definida, mas termos genéricos podem abrir espaço para interpretações diferentes.',next:'Use exemplos concretos e encerre cada explicação com uma conclusão objetiva.'},
    {name:'Escuta',score:56,feedback:'Você acolhe parte das respostas, mas pode explorar melhor o contexto antes de apresentar sua solução.',next:'Faça uma pergunta de aprofundamento e resuma o que ouviu antes de argumentar.'},
    {name:'Objetividade',score:64,feedback:'Sua condução tende a manter o foco, embora alguns argumentos possam ser mais curtos e diretos.',next:'Defina o objetivo da fala e apresente um único argumento por vez.'},
    {name:'Perguntas',score:58,feedback:'As perguntas ajudam a conduzir a conversa, mas algumas podem investigar melhor os critérios de decisão.',next:'Experimente perguntar quais condições precisam ser atendidas para avançar.'},
    {name:'Argumentação',score:52,feedback:'Os argumentos mostram benefícios, mas podem se conectar melhor às prioridades declaradas pelo interlocutor.',next:'Relacione cada benefício a uma necessidade mencionada durante a reunião.'},
    {name:'Condução',score:61,feedback:'Você mantém uma sequência de conversa consistente, mas pode tornar os próximos passos mais explícitos.',next:'Ao encerrar um tópico, confirme o acordo e indique a próxima ação com clareza.'}
  ];
  let selected=0;
  function update(){
    const progress=Number(slider.value)/100;
    const scores=examples.map(x=>Math.round(x.score*progress));
    const average=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
    root.querySelector('#scores-demo-total').textContent=average;
    root.querySelector('#scores-demo-ring').style.setProperty('--score',average);
    root.querySelector('#scores-demo-progress-value').textContent=slider.value+'%';
    buttons.forEach((btn,i)=>{btn.querySelector('strong').textContent=scores[i]+'%';btn.querySelector('i b').style.width=scores[i]+'%';btn.classList.toggle('is-active',i===selected);btn.setAttribute('aria-pressed',String(i===selected));});
    root.querySelector('#scores-demo-feedback-title').textContent=examples[selected].name+' · '+scores[selected]+'/100';
    root.querySelector('#scores-demo-feedback-text').textContent=progress===0?'Este é o ponto inicial da simulação. Avance o controle para visualizar um diagnóstico ilustrativo desta Skill.':examples[selected].feedback;
    root.querySelector('#scores-demo-next').textContent=progress===0?'Ajuste o progresso para visualizar uma ação prática de desenvolvimento.':examples[selected].next;
  }
  slider.addEventListener('input',update);
  buttons.forEach((btn,i)=>btn.addEventListener('click',()=>{selected=i;update();}));
  update();
})();
