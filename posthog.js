/* Visitor analytics (PostHog, EU region): page views, unique visitors and traffic source.

   Set up to be cookieless: persistence is "memory", so nothing is written to cookies or
   to the browser's storage, in line with the privacy policy ("no cookies for tracking").
   A visitor is counted per page load, so unique-visitor numbers are approximate.
   Autocapture is off; the only events are page views plus the ones we add on purpose.
   The key below is PostHog's public send-only key. It cannot read any data.
*/
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_Cfxph7jqUFJULhKxjmmKkRdfQgLxejjcBWDhDQbL7vYs',{
  api_host:'https://eu.i.posthog.com',
  person_profiles:'identified_only',
  persistence:'memory',
  autocapture:false,
  disable_session_recording:true
});
