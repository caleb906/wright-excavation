/**
 * Wright Excavation — centralized analytics.
 * Drop <script src="/analytics.js"></script> into the <head> of any page.
 * Change the GA_ID below to update tracking everywhere at once.
 */
(function () {
  var GA_ID = 'G-2G7R6CJZJB';
  var CLARITY_ID = 'wlwwfxqoi1';

  // --- Filter dev / internal traffic before any GA call fires ---
  var host = location.hostname;
  var isDev =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.vercel.app') ||      // preview deployments
    location.protocol === 'file:' ||
    /[?&](debug_analytics|no_ga)=1/.test(location.search) || // manual override: ?no_ga=1
    window.localStorage.getItem('hoffmedia_no_ga') === '1';  // persistent opt-out per browser

  if (isDev) {
    // Stub gtag so any event calls in the page silently no-op
    window.gtag = function () {};
    if (window.console) console.info('[analytics] disabled on', host);
    return;
  }

  // Load gtag.js
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, {
    // Mark this traffic so GA can segment/filter it later if you set up a
    // matching Internal Traffic rule in Admin → Data Streams → Configure tag settings
    traffic_type: 'external'
  });

  // Microsoft Clarity
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);

  // Thank-you page = form submit success (Web3Forms redirects here)
  if (/thank[-_]?you/i.test(location.pathname)) {
    gtag('event', 'generate_lead', { form_location: '/thank-you', value: 1, currency: 'USD' });
    gtag('event', 'conversion', { send_to: GA_ID, event_category: 'lead', event_label: 'form_submission_success' });
  }

  function trim80(t) { return (t || '').trim().slice(0, 80); }

  function init() {
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
      el.addEventListener('click', function () {
        gtag('event', 'phone_click', {
          phone_number: el.getAttribute('href').replace('tel:', ''),
          link_text: trim80(el.textContent),
          page_location: location.pathname
        });
      });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
      el.addEventListener('click', function () {
        gtag('event', 'email_click', {
          email: el.getAttribute('href').replace('mailto:', ''),
          link_text: trim80(el.textContent),
          page_location: location.pathname
        });
      });
    });

    document.querySelectorAll('a[href^="http"]').forEach(function (el) {
      var href = el.getAttribute('href') || '';
      if (href && href.indexOf(location.hostname) === -1) {
        el.addEventListener('click', function () {
          gtag('event', 'outbound_click', { link_url: href, link_text: trim80(el.textContent) });
        });
      }
    });

    document.querySelectorAll('form').forEach(function (form) {
      var started = false;
      form.addEventListener('focusin', function () {
        if (started) return;
        started = true;
        gtag('event', 'form_start', {
          form_id: form.id || form.getAttribute('name') || 'form',
          form_location: location.pathname
        });
      });
      form.addEventListener('submit', function () {
        gtag('event', 'generate_lead', {
          form_id: form.id || form.getAttribute('name') || 'form',
          form_location: location.pathname
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
