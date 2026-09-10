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

  /* ------------------------------------------------------------ video grid
     Renders the media library from videos.js. Nothing from YouTube loads until
     a visitor actually clicks a clip — no iframes, no tracking, no 30 embeds
     fighting over the page on first paint.                                    */
  function wireVideoGrid() {
    var grid = document.getElementById('video-grid');
    if (!grid) return;

    var list = (window.SITE_VIDEOS || []).filter(function (v) {
      return v && (v.youtube || v.file) && v.title;
    });

    var empty = document.getElementById('video-empty');
    if (!list.length) { grid.remove(); return; }
    if (empty) empty.remove();

    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    function prettyDate(iso) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
      var parts = iso.split('-');
      var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
      if (isNaN(d)) return '';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
    }

    list.forEach(function (v) {
      var card = document.createElement('article');
      card.className = 'clip';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'clip__thumb';
      btn.setAttribute('aria-label', 'Play: ' + v.title);

      var img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';
      img.src = v.youtube
        ? 'https://i.ytimg.com/vi/' + encodeURIComponent(v.youtube) + '/hqdefault.jpg'
        : (v.poster || 'assets/img/video-poster.jpg');
      btn.appendChild(img);

      var play = document.createElement('span');
      play.className = 'clip__play';
      btn.appendChild(play);

      var body = document.createElement('div');
      body.className = 'clip__body';
      var h3 = document.createElement('h3');
      h3.textContent = v.title;
      body.appendChild(h3);
      if (v.blurb) {
        var p = document.createElement('p');
        p.textContent = v.blurb;
        body.appendChild(p);
      }
      var when = prettyDate(v.date);
      if (when) {
        var time = document.createElement('time');
        time.dateTime = v.date;
        time.textContent = when;
        body.appendChild(time);
      }

      btn.addEventListener('click', function () {
        var holder = document.createElement('div');
        holder.className = 'clip__player';
        if (v.youtube) {
          var f = document.createElement('iframe');
          f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtube) + '?autoplay=1&rel=0';
          f.title = v.title;
          f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
          f.referrerPolicy = 'strict-origin-when-cross-origin';
          f.setAttribute('allowfullscreen', '');
          holder.appendChild(f);
        } else {
          var vid = document.createElement('video');
          vid.src = v.file;
          vid.poster = v.poster || '';
          vid.controls = true;
          vid.autoplay = true;
          vid.playsInline = true;
          holder.appendChild(vid);
        }
        btn.replaceWith(holder);
      });

      card.appendChild(btn);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------ form */
  function wireForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    // Deep links like contact.html?topic=RGD+InnerPower+Launch+List arrive from the
    // Join the Launch List button; preselect that subject so the visitor doesn't
    // have to find it, but only if it is a subject the form actually offers.
    var wanted = new URLSearchParams(window.location.search).get('topic');
    var topic = form.querySelector('#topic');
    if (wanted && topic) {
      var match = Array.prototype.filter.call(topic.options, function (o) { return o.value === wanted; })[0];
      if (match) topic.value = match.value;
    }

    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-visible ' + (kind === 'error' ? 'is-error' : 'is-ok');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // The form carries `novalidate` so these messages are ours rather than the
      // browser's, which means the validity check has to be run by hand — without
      // it a blank or mistyped submission reports success and goes nowhere.
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          if (typeof form.reportValidity === 'function') form.reportValidity();
        }
        say('Please fill in your name, a valid email, and a message.', 'error');
        return;
      }

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

  /* ------------------------------------------------------- press-kit copy */
  function wireCopyButtons() {
    document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
      var target = document.querySelector(btn.getAttribute('data-copy'));
      if (!target) { btn.remove(); return; }

      btn.addEventListener('click', function () {
        var text = (target.innerText || target.textContent || '').trim();
        var done = function () {
          var was = btn.textContent;
          btn.textContent = 'Copied';
          btn.classList.add('is-done');
          setTimeout(function () { btn.textContent = was; btn.classList.remove('is-done'); }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, selectFallback);
        } else {
          selectFallback();
        }

        // No clipboard API (or it was refused): select the text so the
        // visitor can copy it themselves rather than leaving them stuck.
        function selectFallback() {
          try {
            var range = document.createRange();
            range.selectNodeContents(target);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            btn.textContent = 'Press ' + (/Mac|iP/.test(navigator.platform) ? '\u2318' : 'Ctrl') + '+C';
            btn.classList.add('is-done');
          } catch (e) { /* leave the button as it was */ }
        }
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
    wireVideoGrid();
    wireCopyButtons();
    wireForm();
    wireYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
