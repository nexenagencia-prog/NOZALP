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
const feedbackCurrent = document.querySelector('#feedback-current');
let activeFeedback = 0;
const showFeedback = (index) => {
  activeFeedback = (index + feedbackSlides.length) % feedbackSlides.length;
  feedbackSlides.forEach((slide, i) => {
    const active = i === activeFeedback;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  if (feedbackCurrent) feedbackCurrent.textContent = String(activeFeedback + 1).padStart(2, '0');
};
document.querySelector('[data-feedback-prev]')?.addEventListener('click', () => showFeedback(activeFeedback - 1));
document.querySelector('[data-feedback-next]')?.addEventListener('click', () => showFeedback(activeFeedback + 1));
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    if (!document.hidden && !feedbackCarousel?.matches(':hover') && !feedbackCarousel?.contains(document.activeElement)) {
      showFeedback(activeFeedback + 1);
    }
  }, 5000);
}
