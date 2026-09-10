/* ==========================================================================
   ANALYTICS — off until you fill in the two values below.

   Nothing loads, no request is made and no cookie is set while `provider` is
   empty, so the site ships safely in this state.

   PICK A PROVIDER
   ---------------
   "plausible"   Recommended. No cookies, so no consent banner is required and
                 there is nothing to disclose beyond a normal privacy note.
                 Sign up at plausible.io, add alfonsedanner.com, then set
                 id: "alfonsedanner.com"   (the domain IS the id here)

   "cloudflare"  Free and also cookieless. Cloudflare dashboard ->
                 Web Analytics -> add a site -> copy the beacon token.
                 id: "<the token>"

   "ga4"         Google Analytics 4. Free and familiar, but it DOES set cookies:
                 you then need a privacy policy, and a cookie-consent banner for
                 visitors in the EU/UK. Only choose this if you want the Google
                 reporting specifically.
                 id: "G-XXXXXXXXXX"

   "umami"       Self-hosted or umami.is. Set BOTH id and host.
                 id: "<website id>", host: "https://cloud.umami.is"
   ========================================================================== */

window.SITE_ANALYTICS = {
  provider: "",
  id:       "",
  host:     ""
};

(function () {
  'use strict';
  var cfg = window.SITE_ANALYTICS || {};

  // No-op helper so trackEvent() is always safe to call, configured or not.
  window.trackEvent = function () {};

  if (!cfg.provider || !cfg.id) return;

  // Never count our own previews — otherwise every local test and every look at
  // the staging build inflates the numbers the client is trying to read.
  var host = location.hostname;
  if (location.protocol === 'file:' ||
      host === 'localhost' || host === '127.0.0.1' || host === '' ||
      /\.local$/.test(host) || /^192\.168\./.test(host)) return;

  var head = document.head || document.documentElement;
  function load(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    head.appendChild(s);
    return s;
  }

  switch (cfg.provider) {
    case 'plausible':
      load('https://plausible.io/js/script.tagged-events.js', { 'data-domain': cfg.id });
      window.trackEvent = function (name, props) {
        if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
      };
      break;

    case 'cloudflare':
      load('https://static.cloudflareinsights.com/beacon.min.js',
           { 'data-cf-beacon': JSON.stringify({ token: cfg.id }) });
      // Cloudflare Web Analytics has no custom-event API; pageviews only.
      break;

    case 'ga4':
      load('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.id));
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', cfg.id);
      window.trackEvent = function (name, props) { window.gtag('event', name, props || {}); };
      break;

    case 'umami':
      if (!cfg.host) return;
      load(cfg.host.replace(/\/$/, '') + '/script.js', { 'data-website-id': cfg.id });
      window.trackEvent = function (name, props) {
        if (window.umami && window.umami.track) window.umami.track(name, props || {});
      };
      break;

    default:
      return;
  }

  /* ---------------------------------------------------------------- events
     The question worth answering is "which clip sent someone here, and did
     they then do anything?" Pageviews answer the first half; these answer the
     second. Derived from what was clicked, so no markup has to carry tags.   */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;

    if (a.matches('[data-link="bookAmazon"]')) return window.trackEvent('Book link');

    var href = a.getAttribute('href') || '';
    if (href.indexOf('topic=RGD+InnerPower+Launch+List') > -1) return window.trackEvent('Launch list');
    if (href.indexOf('topic=Media') > -1) return window.trackEvent('Interview request');
    if (href.indexOf('topic=Speaking') > -1) return window.trackEvent('Speaking inquiry');

    if (a.closest('.social-row')) {
      return window.trackEvent('Social click', { network: a.getAttribute('aria-label') || 'unknown' });
    }
    if (a.hasAttribute('download')) {
      return window.trackEvent('Press download', { file: href.split('/').pop() });
    }
  }, true);

  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'contact-form') {
      var t = e.target.querySelector('#topic');
      window.trackEvent('Contact form', { topic: t ? t.value : 'unknown' });
    }
  }, true);

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest && e.target.closest('.clip__thumb');
    if (thumb) window.trackEvent('Clip play', { title: (thumb.getAttribute('aria-label') || '').replace(/^Play:\s*/, '') });
  }, true);
})();
