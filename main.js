/* wheredoiclick.ai — one small vanilla file. No libraries.
   All page copy lives in index.html; this file only adds behaviour + motion. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var mq = function (q) { return window.matchMedia(q); };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)').matches;
  var finePointer = mq('(hover: hover) and (pointer: fine)').matches;
  var isMobile = function () { return mq('(max-width: 767px)').matches; };
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var header = $('#site-header');
  var hero = $('#top');

  /* ---------- Header: transparent over hero, solid on scroll ---------- */
  var topSentinel = $('.top-sentinel');
  if (hasIO && topSentinel && header) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-solid', !entries[0].isIntersecting);
    }).observe(topSentinel);
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('#nav-toggle');
  var menu = $('#nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    mq('(min-width: 960px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Active section in nav ---------- */
  var navLinks = $$('.nav-links a');
  if (hasIO && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var activeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var link = byId[en.target.id];
        if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) activeIO.observe(el);
    });
    // clear highlight when back in the hero
    if (hero) activeIO.observe(hero);
  }

  /* ---------- Hero visibility: pause ambient motion off-screen + sticky mobile bar ---------- */
  var heroSentinel = $('.hero-sentinel');
  var mbar = $('#mbar');
  var mbarDismissed = false;
  try { mbarDismissed = sessionStorage.getItem('mbar-dismissed') === '1'; } catch (e) {}

  function setMbar(show) {
    if (!mbar) return;
    var visible = show && !mbarDismissed && isMobile();
    if (visible) mbar.hidden = false;
    // next frame so the slide-up transition runs
    requestAnimationFrame(function () { mbar.classList.toggle('is-visible', visible); });
    document.body.classList.toggle('has-mbar', visible);
  }
  var pastHero = false;
  if (hasIO && heroSentinel && hero) {
    new IntersectionObserver(function (entries) {
      var en = entries[0];
      // sentinel covers the page from the top down to the trust strip,
      // so it stops intersecting exactly when the visitor is past the hero
      pastHero = !en.isIntersecting && en.boundingClientRect.bottom <= 0;
      hero.classList.toggle('is-offscreen', pastHero);
      setMbar(pastHero);
    }).observe(heroSentinel);
    mq('(max-width: 767px)').addEventListener('change', function () { setMbar(pastHero); });
  }
  var mbarClose = $('#mbar-close');
  if (mbarClose) {
    mbarClose.addEventListener('click', function () {
      mbarDismissed = true;
      try { sessionStorage.setItem('mbar-dismissed', '1'); } catch (e) {}
      setMbar(false);
      mbar.hidden = true;
    });
  }

  /* ---------- Hero status pills flip through messages ---------- */
  if (!reduceMotion) {
    $$('.status[data-messages]').forEach(function (pill, i) {
      var msgs = pill.getAttribute('data-messages').split('|');
      var text = $('.status-text', pill);
      var idx = 0;
      setTimeout(function () {
        setInterval(function () {
          if (hero && hero.classList.contains('is-offscreen')) return;
          text.classList.add('is-out');
          setTimeout(function () {
            idx = (idx + 1) % msgs.length;
            text.textContent = msgs[idx];
            text.classList.remove('is-out');
          }, 260);
        }, 3200);
      }, i * 1600);
    });
  }

  /* ---------- Pattern A fallback: no CSS scroll-driven animations (desktop only) ---------- */
  var supportsSDA = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  if (!reduceMotion && !supportsSDA && hero) {
    var copy = $('.hero-copy', hero);
    var visual = $('.hero-visual', hero);
    var stickyMQ = mq('(min-width: 960px) and (min-height: 680px)');
    var ticking = false;
    var update = function () {
      ticking = false;
      if (!stickyMQ.matches) { copy.style.cssText = ''; visual.style.cssText = ''; return; }
      var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.8)));
      var o = String(1 - p);
      copy.style.opacity = o;
      copy.style.transform = 'translateY(' + (-40 * p) + 'px)';
      visual.style.opacity = o;
      visual.style.transform = 'scale(' + (1 - 0.1 * p) + ')';
      copy.style.visibility = visual.style.visibility = p >= 1 ? 'hidden' : '';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Pattern C: reveal once + count-up ---------- */
  function formatNum(n, decimals) {
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 700, start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var step = function (ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      el.textContent = prefix + formatNum(target * ease(t), decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = prefix + formatNum(0, decimals) + suffix;
    requestAnimationFrame(step);
  }

  var reveals = $$('.reveal');
  if (!reduceMotion && hasIO && reveals.length) {
    // stagger siblings inside [data-stagger] containers
    var gap = isMobile() ? 40 : 70;
    $$('[data-stagger]').forEach(function (group) {
      $$(':scope > .reveal', group).forEach(function (el, i) {
        el.style.setProperty('--stagger', (i * gap) + 'ms');
      });
    });
    doc.classList.add('motion-ok');
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        $$('[data-count]', el).forEach(countUp);
        // clear the stagger delay once revealed so later hover/transitions aren't delayed
        setTimeout(function () { el.style.removeProperty('--stagger'); }, 1400);
        obs.unobserve(el);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Pattern D: cursor spotlight (project cards) + magnetic WhatsApp CTA ---------- */
  if (finePointer && !reduceMotion) {
    $$('.project').forEach(function (card) {
      card.addEventListener('pointerenter', function () { card.classList.add('is-lit'); });
      card.addEventListener('pointerleave', function () { card.classList.remove('is-lit'); });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    var magnet = $('[data-magnetic]');
    var zone = magnet && magnet.closest('.magnet-zone');
    if (magnet && zone) {
      var MAX = 8;
      zone.addEventListener('pointermove', function (e) {
        var r = magnet.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var clamp = function (v) { return Math.max(-MAX, Math.min(MAX, v)); };
        magnet.style.setProperty('--tx', clamp(dx * 0.2) + 'px');
        magnet.style.setProperty('--ty', clamp(dy * 0.3) + 'px');
      });
      zone.addEventListener('pointerleave', function () {
        magnet.style.setProperty('--tx', '0px');
        magnet.style.setProperty('--ty', '0px');
      });
    }
  }
})();
