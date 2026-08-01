/* alfonsedanner.com — site behaviour. No dependencies. */
(function () {
  'use strict';

  var LINKS = window.SITE_LINKS || {};

  /* ---------------------------------------------------------------- links
     Any element with data-link="key" gets its href from links.js.
     Empty value -> the element (or its wrapper marked data-link-wrap)
     is removed, so the site never renders a dead link.                     */
  function wireLinks() {
    document.querySelectorAll('[data-link]').forEach(function (el) {
      var key = el.getAttribute('data-link');
      var val = LINKS[key];

      if (key === 'email') {
        if (!val) { removeLink(el); return; }
        el.href = 'mailto:' + val;
        if (el.hasAttribute('data-link-text')) el.textContent = val;
        return;
      }

      if (!val) { removeLink(el); return; }
      el.href = val;
      if (/^https?:/i.test(val)) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }
      if (el.hasAttribute('data-link-text')) el.textContent = val.replace(/^https?:\/\//, '');
    });
  }

  function removeLink(el) {
    var wrap = el.closest('[data-link-wrap]');
    (wrap || el).remove();
  }

  /* If every social handle is still blank, drop the empty icon rows entirely
     rather than leaving a gap where they used to be. */
  function pruneEmptyRows() {
    document.querySelectorAll('.social-row, .btn-row, .footer-links, .info-list').forEach(function (row) {
      if (row.querySelector('a, button')) return;
      var heading = row.previousElementSibling;
      if (heading && heading.hasAttribute('data-row-heading')) heading.remove();
      row.remove();
    });
  }

  /* ------------------------------------------------------------ mobile nav */
  function wireNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) toggle.click();
    });
  }

  /* ------------------------------------------------------------ sticky head */
  function wireHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------------- scroll reveal */
  function wireReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* ----------------------------------------------------------------- video
     Click-to-play so the 40 MB trailer is never downloaded until asked for. */
  function wireVideo() {
    document.querySelectorAll('.video-frame').forEach(function (frame) {
      var video = frame.querySelector('video');
      var btn = frame.querySelector('.video-frame__play');
      if (!video || !btn) return;

      btn.addEventListener('click', function () {
        video.setAttribute('controls', '');
        frame.classList.add('is-playing');
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* user can hit the native control */ });
      });
      video.addEventListener('ended', function () { frame.classList.remove('is-playing'); });
    });
  }

  /* ------------------------------------------------------------------ form */
  function wireForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-visible ' + (kind === 'error' ? 'is-error' : 'is-ok');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: silently accept and drop obvious bot submissions.
      if (form.querySelector('[name="_company"]') && form.querySelector('[name="_company"]').value) {
        say('Thanks — your message is on its way.');
        form.reset();
        return;
      }

      var data = new FormData(form);
      var endpoint = LINKS.formEndpoint;

      if (!endpoint) {
        // Fallback: hand off to the visitor's mail client, fully pre-filled.
        var to = LINKS.email || '';
        var subject = '[' + (data.get('topic') || 'Website') + '] ' + (data.get('name') || 'New inquiry');
        var body =
          'Name: ' + (data.get('name') || '') + '\n' +
          'Email: ' + (data.get('email') || '') + '\n' +
          'Topic: ' + (data.get('topic') || '') + '\n\n' +
          (data.get('message') || '');
        window.location.href =
          'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        say('Opening your email app with the message ready to send.');
        return;
      }

      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Sending…'; }

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed: ' + res.status);
          form.reset();
          say('Thank you — your message is on its way. Expect a reply within 2–3 business days.');
        })
        .catch(function () {
          say('Something went wrong sending that. Please email ' + (LINKS.email || 'us') + ' directly.', 'error');
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || 'Send Message'; }
        });
    });
  }

  /* ------------------------------------------------------------------ year */
  function wireYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function init() {
    wireLinks();
    pruneEmptyRows();
    wireNav();
    wireHeader();
    wireReveal();
    wireVideo();
    wireForm();
    wireYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
