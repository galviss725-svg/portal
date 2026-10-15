/* =========================================================
   NEXUS MEDIA — interactividad
   ========================================================= */
(function () {
  'use strict';

  // ---- Datos de contacto (únicos canales públicos) ----
  var WA_NUMBER = '573122443058';            // 312 244 3058 con indicativo de Colombia
  var EMAIL = 'nexusmedia.ees@gmail.com';
  var WA_DEFAULT = 'Hola Nexus Media, quiero información sobre sus servicios.';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openLink(url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function waUrl(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function mailUrl(subject, body) {
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  // ---- Enlaces de WhatsApp con mensaje predeterminado (data-wa) ----
  $$('[data-wa]').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-wa') || WA_DEFAULT);
  });
  var waMsg = $('#waMsg'), waQuick = $('#waQuick');
  function syncQuick() { waQuick.href = waUrl(waMsg.value.trim() || WA_DEFAULT); }
  waMsg.addEventListener('input', syncQuick); syncQuick();

  // ---- Calculadora interactiva de planes y presupuesto ----
  var baseSelect = $('#calcBasePlan');
  var addBoxes = $$('.calc-add');
  var totalDisplay = $('#calcTotal');
  var calcWaBtn = $('#calcWaBtn');

  function updateCalc() {
    if (!baseSelect || !totalDisplay) return;
    var baseVal = parseInt(baseSelect.value, 10) || 400000;
    var baseTitle = baseSelect.options[baseSelect.selectedIndex].text;
    var sum = baseVal;
    var chosenAddons = [];

    addBoxes.forEach(function (cb) {
      if (cb.checked) {
        sum += parseInt(cb.value, 10);
        chosenAddons.push(cb.getAttribute('data-label'));
      }
    });

    var formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(sum);
    totalDisplay.innerHTML = formatted + ' <small style="font-size:0.9rem;color:var(--muted)">COP / mes</small>';

    var msg = 'Hola Nexus Media, deseo cotizar el siguiente plan personalizado (' + formatted + ' COP/mes):\n• ' + baseTitle;
    if (chosenAddons.length) {
      msg += '\n• Adicionales: ' + chosenAddons.join(', ');
    }
    calcWaBtn.href = waUrl(msg);
  }

  if (baseSelect) {
    baseSelect.addEventListener('change', updateCalc);
    addBoxes.forEach(function (cb) { cb.addEventListener('change', updateCalc); });
    updateCalc();
  }

  $('#year').textContent = new Date().getFullYear();

  // ---- Navegación: fondo sólido al desplazarse + menú móvil ----
  var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  function onScroll() { nav.classList.toggle('is-solid', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Enlace activo según sección visible
  var links = $$('.nav__links a:not(.btn)');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  // ---- Animaciones al desplazarse ----
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Hero: secuencia de entrada + movimiento ambiental (GSAP) ----
  // Si GSAP no carga o el usuario prefiere menos movimiento, el hero queda visible y estático.
  (function heroMotion() {
    if (reduce || !window.gsap) return;
    var g = window.gsap;
    try {
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    // 1) Entrada coordinada (~2.6 s). Solo transform/opacity/clip-path.
    var tl = g.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__bg', { opacity: 0, duration: 1 }, 0)
      .from('.nav__logo', { opacity: 0, y: -14, duration: .7 }, .15)
      .from('.nav__links > *', { opacity: 0, y: -10, duration: .5, stagger: .06 }, .3)
      .from('#kicker', { clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: .8, ease: 'power2.inOut' }, .5)
      .from('.hero__line > span', { yPercent: 110, duration: .9, stagger: .14, ease: 'power4.out' }, .65)
      .from('#heroLead', { opacity: 0, y: 14, duration: .7 }, 1.15)
      .from('#heroBtns .btn', { opacity: 0, y: 18, scale: .94, duration: .6, stagger: .1 }, 1.3)
      .from('#heroWa', { opacity: 0, duration: .6 }, 1.5)
      .from('#heroSvcs .hs', { opacity: 0, y: 16, duration: .5, stagger: .08 }, 1.55)
      .from('#visual', { opacity: 0, x: 70, scale: .93, duration: 1.3, ease: 'power3.out' }, .55);

    // 2) Movimiento ambiental continuo y suave
    g.to('#visualTilt', { y: -9, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });

    // 3) Parallax de las formas diagonales con el scroll
    if (window.ScrollTrigger) {
      $$('#heroBg .beam').forEach(function (b) {
        g.to(b, { y: +b.dataset.speed, ease: 'none',
          scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true } });
      });
      g.to('#visual', { y: 50, ease: 'none',
        scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // 4) Interacción con el cursor (solo con ratón; limitada para evitar mareos)
    if (fine) {
      var hero = $('#inicio');
      var rx = g.quickTo('#visualTilt', 'rotationX', { duration: .9, ease: 'power3.out' });
      var ry = g.quickTo('#visualTilt', 'rotationY', { duration: .9, ease: 'power3.out' });
      var gx = g.quickTo('.glow--a', 'x', { duration: 1.4, ease: 'power3.out' });
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        ry(nx * 6); rx(-ny * 5); gx(nx * 40);
      });
      hero.addEventListener('mouseleave', function () { ry(0); rx(0); gx(0); });
    }
    } catch (err) {   // ante cualquier fallo, el hero queda visible
      g.set('#inicio *', { clearProps: 'all' });
    }
  })();

  // ---- Video showreel ----
  var reel = $('#reel'), reelBtn = $('#reelBtn'), reelBox = reel.closest('.reel__box');
  function reelState() {
    var p = !reel.paused;
    reelBox.classList.toggle('is-playing', p);
    reelBtn.setAttribute('aria-label', p ? 'Pausar video' : 'Reproducir video');
    reelBtn.innerHTML = '<svg class="ic ic--fill"><use href="' + (p ? '#i-pause' : '#i-play') + '"/></svg>';
  }
  reelBtn.addEventListener('click', function () { reel.paused ? reel.play() : reel.pause(); });
  reel.addEventListener('play', reelState); reel.addEventListener('pause', reelState);

  // ---- Utilidades de modales (<dialog>) ----
  function openDialog(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); document.body.style.overflow = 'hidden'; }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { document.body.style.overflow = ''; });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });   // clic fuera
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
  });

  // ---- Validación común ----
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validContact(v) {
    v = v.trim();
    if (emailRe.test(v)) return true;
    var digits = v.replace(/[\s()+-]/g, '');
    return /^\d{7,15}$/.test(digits);
  }
  function setErr(input, msg) {
    var f = input.closest('.field'), e = $('.err', f);
    f.classList.toggle('is-bad', !!msg);
    if (e) e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function check(form, ids) {
    var ok = true, first = null;
    ids.forEach(function (o) {
      var el = $(o.sel, form), v = el.value.trim(), msg = '';
      if (o.req && !v) msg = 'Este campo es obligatorio.';
      else if (o.contact && v && !validContact(v)) msg = 'Escribe un correo válido o un teléfono (7 a 15 dígitos).';
      else if (o.min && v && v.length < o.min) msg = 'Cuéntanos un poco más (mínimo ' + o.min + ' caracteres).';
      setErr(el, msg);
      if (msg) { ok = false; first = first || el; }
    });
    if (first) first.focus();
    return ok;
  }
  $$('.field input, .field textarea').forEach(function (el) {
    el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) setErr(el, ''); });
  });

  // ---- Formulario de contacto ----
  var cForm = $('#contactForm'), okMsg = $('#formOk');
  var cRules = [
    { sel: '#cName', req: true },
    { sel: '#cContact', req: true, contact: true },
    { sel: '#cMsg', req: true, min: 10 }
  ];
  function contactText() {
    var g = function (id) { return $(id, cForm).value.trim(); };
    var lines = ['Hola Nexus Media, soy ' + g('#cName') + '.'];
    if (g('#cService')) lines.push('Servicio de interés: ' + g('#cService'));
    if (g('#cPlan')) lines.push('Plan que quiero consultar: ' + g('#cPlan'));
    lines.push('', g('#cMsg'), '', 'Mi contacto: ' + g('#cContact'));
    return lines.join('\n');
  }
  function showOk(html) { okMsg.innerHTML = html; okMsg.hidden = false; }
  cForm.addEventListener('submit', function (e) {
    e.preventDefault(); okMsg.hidden = true;
    if (!check(cForm, cRules)) return;
    var url = waUrl(contactText());
    openLink(url);
    showOk('Listo, abrimos WhatsApp con tu mensaje redactado. Recuerda pulsar «Enviar» allí para que nos llegue. Si no se abrió, <a href="' + url + '" target="_blank" rel="noopener">haz clic aquí</a>.');
  });
  $('[data-send-mail]', cForm).addEventListener('click', function () {
    okMsg.hidden = true;
    if (!check(cForm, cRules)) return;
    window.location.href = mailUrl('Consulta desde la web — ' + $('#cName').value.trim(), contactText());
    showOk('Si no se abrió tu app de correo, escríbenos directamente a <b>' + EMAIL + '</b>.');
  });

  // Botones «Conocer servicio» / «Solicitar asesoría»: preseleccionan el servicio
  $$('[data-pick-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var s = a.getAttribute('data-pick-service');
      if (s) $('#cService').value = s;
    });
  });

  // ---- Modal de plan ----
  var pOk = $('#planOk'), pModal = $('#planModal'), pForm = $('#planForm'), currentPlan = { name: '', price: '' };
  var pRules = [{ sel: '#pName', req: true }, { sel: '#pContact', req: true, contact: true }];
  $$('[data-choose]').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = b.closest('.plan');
      currentPlan = { name: card.dataset.plan, price: $('.price strong', card).textContent + ' COP / mes' };
      $('#planTitle').textContent = currentPlan.name;
      $('#planPrice').textContent = currentPlan.price;
      $('#cPlan').value = $$('#cPlan option').map(function (o) { return o.value; }).filter(function (v) { return v.indexOf(currentPlan.name) === 0; })[0] || '';
      pOk.hidden = true; openDialog(pModal);
      setTimeout(function () { $('#pName').focus(); }, 60);
    });
  });
  function planText() {
    var lines = ['Hola Nexus Media, soy ' + $('#pName').value.trim() + '.',
      'Quiero contratar el plan ' + currentPlan.name + ' (' + currentPlan.price + ').'];
    var m = $('#pMsg').value.trim();
    if (m) lines.push('', m);
    lines.push('', 'Mi contacto: ' + $('#pContact').value.trim());
    return lines.join('\n');
  }
  pForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!check(pForm, pRules)) return;
    var u = waUrl(planText());
    openLink(u);
    pOk.innerHTML = 'Abrimos WhatsApp con tu mensaje. Pulsa «Enviar» allí para que nos llegue. Si no se abrió, <a href="' + u + '" target="_blank" rel="noopener">haz clic aquí</a>.';
    pOk.hidden = false;
  });
  $('[data-send-mail]', pForm).addEventListener('click', function () {
    if (!check(pForm, pRules)) return;
    window.location.href = mailUrl('Plan ' + currentPlan.name + ' — ' + $('#pName').value.trim(), planText());
    pOk.innerHTML = 'Si no se abrió tu app de correo, escríbenos a <b>' + EMAIL + '</b>.';
    pOk.hidden = false;
  });

  // ---- Portafolio: filtros ----
  var works = $$('.work'), filters = $$('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var k = f.dataset.filter;
      filters.forEach(function (x) { var on = x === f; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      works.forEach(function (w) {
        var show = k === 'all' || w.dataset.cats.split(' ').indexOf(k) > -1;
        w.classList.toggle('is-hidden', !show);
      });
    });
  });

  // ---- Portafolio: vista ampliada con navegación ----
  var lb = $('#lightbox'), lbMedia = $('#lbMedia'), lbIdx = 0, lbList = [];
  function renderLb() {
    var w = lbList[lbIdx];
    lbMedia.innerHTML = '';
    var el;
    if (w.dataset.type === 'video') {
      el = document.createElement('video');
      el.src = w.dataset.full; el.poster = w.dataset.poster || '';
      el.controls = true; el.autoplay = true; el.loop = true; el.muted = true; el.playsInline = true;
      el.setAttribute('aria-label', w.dataset.title);
    } else {
      el = document.createElement('img');
      el.src = w.dataset.full; el.alt = w.dataset.title;
    }
    lbMedia.appendChild(el);
    $('#lbTitle').textContent = w.dataset.title;
    $('#lbCat').textContent = w.dataset.catlabel;
    $('#lbDesc').textContent = w.dataset.desc;
    $('#lbCount').textContent = (lbIdx + 1) + ' / ' + lbList.length;
    $('#lbWa').href = waUrl('Hola Nexus Media, vi el proyecto «' + w.dataset.title + '» en su portafolio y quiero algo similar para mi marca.');
    var multi = lbList.length > 1;
    $('#lbPrev').hidden = $('#lbNext').hidden = !multi;
  }
  function stepLb(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; renderLb(); }
  works.forEach(function (w) {
    w.addEventListener('click', function () {
      lbList = works.filter(function (x) { return !x.classList.contains('is-hidden'); });
      lbIdx = lbList.indexOf(w); renderLb(); openDialog(lb);
    });
  });
  $('#lbPrev').addEventListener('click', function () { stepLb(-1); });
  $('#lbNext').addEventListener('click', function () { stepLb(1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });
  lb.addEventListener('close', function () { lbMedia.innerHTML = ''; });

  // ---- Textos legales (borrador para revisión) ----
  var legal = {
    privacidad: {
      t: 'Política de privacidad',
      b: '<p>Nexus Media respeta tu privacidad. Esta web no almacena automáticamente los datos que escribes en los formularios: al enviarlos, se abre WhatsApp o tu app de correo con el mensaje redactado y solo se envía cuando tú lo confirmas.</p><p>Usamos la información que nos compartes únicamente para responder tu consulta y preparar propuestas de nuestros servicios.</p><p>Para consultas sobre tus datos, escríbenos a ' + EMAIL + '.</p><p><em>Texto de referencia pendiente de revisión legal.</em></p>'
    },
    datos: {
      t: 'Tratamiento de datos personales',
      b: '<h4>Responsable</h4><p>Nexus Media — ' + EMAIL + '</p><h4>Finalidad</h4><p>Atender solicitudes de información, cotizaciones y contratación de servicios.</p><h4>Tus derechos</h4><p>Puedes conocer, actualizar, rectificar o solicitar la supresión de tus datos escribiéndonos al correo indicado.</p><p><em>Texto de referencia pendiente de revisión legal conforme a la normativa vigente de protección de datos en Colombia.</em></p>'
    }
  };
  $$('[data-legal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = legal[b.dataset.legal];
      $('#legalTitle').textContent = l.t; $('#legalBody').innerHTML = l.b;
      openDialog($('#legalModal'));
    });
  });
})();
