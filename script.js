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
