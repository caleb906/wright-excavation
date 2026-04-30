/**
 * Wright Excavation — centralized analytics.
 * Drop <script src="/analytics.js"></script> into the <head> of any page.
 * Change the GA_ID below to update tracking everywhere at once.
 */
(function () {
  var GA_ID = 'G-2G7R6CJZJB';

  // Load gtag.js
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID);

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
