// Matomo
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
var _paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
    // Enter matomo link below
    var u = 'https://matomo-url-placeholder.com';
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    // Enter matomo site id below
    _paq.push(['setSiteId', 'matomo-site-id-placeholder']);
    var d = document; var g = d.createElement('script'); var s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.defer = true;
    g.src = u + 'matomo.js';
    s.parentNode.insertBefore(g, s);
})();
// End Matomo Code
