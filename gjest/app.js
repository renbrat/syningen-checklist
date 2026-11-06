/* Gjestesiden for Syningen.
   Henter teksten fra innhold/<språk>.md og bygger siden. Ingen eksterne forespørsler,
   ingen cookies. Valgt språk huskes i localStorage hvis nettleseren tillater det. */
(function () {
  'use strict';

  var VERSJON = '2 · 2026-11-06';
  var SPRAK = ['no', 'de', 'en'];
  var HTML_LANG = { no: 'nb', de: 'de', en: 'en' };
  var LAGRET = 'syningen-gjest-sprak';
  var cache = {};

  /* ---------- språkvalg ---------- */
  function fraUrl() {
    try {
      var l = new URLSearchParams(location.search).get('lang');
      return SPRAK.indexOf(l) >= 0 ? l : null;
    } catch (e) { return null; }
  }
  function lagret() {
    try {
      var l = localStorage.getItem(LAGRET);
      return SPRAK.indexOf(l) >= 0 ? l : null;
    } catch (e) { return null; }
  }
  function lagre(l) {
    try { localStorage.setItem(LAGRET, l); } catch (e) { /* privat modus o.l. */ }
  }
  function fraNettleser() {
    var liste = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < liste.length; i++) {
      var k = String(liste[i]).toLowerCase().slice(0, 2);
      if (k === 'nb' || k === 'nn' || k === 'no') return 'no';
      if (k === 'de') return 'de';
      if (k === 'en') return 'en';
      if (k === 'sv' || k === 'da') return 'no';
    }
    return 'en';
  }

  /* ---------- liten Markdown-leser ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, url) {
      var ekstern = /^https:\/\//.test(url);
      if (!ekstern && !/^#[\w-]+$/.test(url)) return txt;
      return '<a href="' + url + '"' + (ekstern ? ' rel="noopener noreferrer"' : '') + '>' + txt + '</a>';
    });
    return s;
  }

  function parse(tekst) {
    tekst = tekst.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
    var linjer = tekst.split('\n');
    var ui = {}, seksjoner = [], sek = null, sub = null, i = 0;

    // Innstillinger (key: value) før første «##»
    for (; i < linjer.length && !/^## /.test(linjer[i]); i++) {
      var m = linjer[i].match(/^([a-z_]+):\s*(.*)$/);
      if (m) ui[m[1]] = m[2].trim();
    }

    function blokker() { return (sub || sek).blokker; }

    for (; i < linjer.length; i++) {
      var l = linjer[i], m2;
      if ((m2 = l.match(/^## (.+?)\s*\{#([\w-]+)\}\s*$/))) {
        sek = { id: m2[2], tittel: m2[1], blokker: [], subs: [] }; sub = null; seksjoner.push(sek); continue;
      }
      if ((m2 = l.match(/^### (.+?)\s*\{#([\w-]+)\}\s*$/))) {
        sub = { id: m2[2], tittel: m2[1], blokker: [] }; sek.subs.push(sub); continue;
      }
      if (!sek || /^\s*$/.test(l)) continue;
      var b = blokker();
      if ((m2 = l.match(/^\[\[(ring|kontakt)(?::([\w-]+))?\]\]\s*$/))) { b.push({ t: 'makro', navn: m2[1], hvem: m2[2] || 'hoved' }); continue; }
      if ((m2 = l.match(/^!\[([^\]]*)\]\(([\w./-]+)\)\s*$/))) { b.push({ t: 'bilde', alt: m2[1], src: m2[2] }); continue; }
      if ((m2 = l.match(/^>\s?(!\s)?(.*)$/))) {
        var forrige = b[b.length - 1];
        if (forrige && forrige.t === 'callout' && !m2[1] && linjer[i - 1] && /^>/.test(linjer[i - 1])) forrige.tekst += ' ' + m2[2];
        else b.push({ t: 'callout', warn: !!m2[1], tekst: m2[2] });
        continue;
      }
      if ((m2 = l.match(/^- (.*)$/))) {
        var f = b[b.length - 1];
        if (f && f.t === 'ul') f.items.push(m2[1]); else b.push({ t: 'ul', items: [m2[1]] });
        continue;
      }
      if ((m2 = l.match(/^\d+\. (.*)$/))) {
        var f2 = b[b.length - 1];
        if (f2 && f2.t === 'ol') f2.items.push(m2[1]); else b.push({ t: 'ol', items: [m2[1]] });
        continue;
      }
      var f3 = b[b.length - 1];
      if (f3 && f3.t === 'p' && linjer[i - 1] && !/^\s*$/.test(linjer[i - 1])) f3.tekst += ' ' + l.trim();
      else b.push({ t: 'p', tekst: l.trim() });
    }
    return { ui: ui, seksjoner: seksjoner };
  }

  /* ---------- kontakt ---------- */
  function kontakt(hvem) {
    var k = (window.SYNINGEN_KONTAKT || {});
    var p = k[hvem];
    if (p && p.telefon) return p;
    if (hvem !== 'hoved' && k.hoved && k.hoved.telefon) return k.hoved;
    return null;
  }
  function telLenke(tlf) { return String(tlf).replace(/[^\d+]/g, ''); }

  function makro(b, lang, ui) {
    var p = kontakt(b.hvem);
    if (!p) return '<p class="callout">' + esc(ui.ingen_kontakt || '') + '</p>';
    var rolle = p.rolle && p.rolle[lang] ? '<span class="krolle">' + esc(p.rolle[lang]) + '</span>' : '';
    var tel = telLenke(p.telefon);
    var ring = '<a class="btn call" href="tel:' + tel + '"><span aria-hidden="true">☎</span> ' + esc((ui.ring || 'Ring {navn}').replace('{navn}', p.navn.split(' ')[0] || '').trim()) + '</a>';
    if (b.navn === 'ring') {
      return '<div class="kontakt kort"><p class="knavn">' + esc(p.navn) + ' · <span class="ktlf">' + esc(p.telefon) + '</span></p>' + ring + '</div>';
    }
    return '<div class="kontakt"><p class="knavn">' + esc(p.navn) + '</p>' + rolle +
      '<p class="ktlf">' + esc(p.telefon) + '</p>' +
      '<div class="kbtns">' + ring + '<a class="btn" href="sms:' + tel + '">' + esc(ui.sms || 'SMS') + '</a></div></div>';
  }

  /* ---------- bygg HTML ---------- */
  function blokkHtml(b, lang, ui) {
    switch (b.t) {
      case 'p': return '<p>' + inline(b.tekst) + '</p>';
      case 'ul': return '<ul>' + b.items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>';
      case 'ol': return '<ol class="steps">' + b.items.map(function (x) { return '<li><span>' + inline(x) + '</span></li>'; }).join('') + '</ol>';
      case 'callout': return '<p class="callout' + (b.warn ? ' warn' : '') + '">' + (b.warn ? '<span class="ico" aria-hidden="true">!</span>' : '') + '<span>' + inline(b.tekst) + '</span></p>';
      case 'bilde': return '<figure class="fig" hidden><img data-src="' + esc(b.src) + '" alt="' + esc(b.alt) + '"><figcaption>' + esc(b.alt) + '</figcaption></figure>';
      case 'makro': return makro(b, lang, ui);
    }
    return '';
  }

  function render(lang, data) {
    var ui = data.ui;
    document.documentElement.lang = HTML_LANG[lang];
    document.title = (ui.tittel || 'Syningen');
    setTekst('hopp', ui.hopp);
    setTekst('overline', ui.overline);
    setTekst('tittel', ui.tittel);
    setTekst('ingress', ui.ingress);
    setTekst('toc-h', ui.innholdsliste);
    setTekst('skrivut', ui.skriv_ut);
    setTekst('ver', (ui.versjon || 'Versjon') + ' ' + VERSJON);
    var spr = document.getElementById('sprak');
    spr.setAttribute('aria-label', ui.sprakvalg || 'Språk');

    var toc = '', main = '';
    data.seksjoner.forEach(function (s, n) {
      var klasse = s.id === 'problemer' ? ' class="hot"' : '';
      toc += '<li><a href="#' + s.id + '"' + klasse + '><span class="num">' + (n + 1) + '</span>' + inline(s.tittel) + '</a></li>';

      var h = '<section class="sek sek-' + s.id + '" id="' + s.id + '" aria-labelledby="' + s.id + '-h">';
      h += '<h2 id="' + s.id + '-h"><span class="num" aria-hidden="true">' + (n + 1) + '</span>' + inline(s.tittel) + '</h2>';
      h += s.blokker.map(function (b) { return blokkHtml(b, lang, ui); }).join('');
      if (s.subs.length > 3) {
        h += '<nav class="subnav" aria-label="' + esc(ui.i_denne_delen || '') + ': ' + esc(s.tittel) + '"><ul>' +
          s.subs.map(function (u) { return '<li><a href="#' + u.id + '">' + inline(u.tittel) + '</a></li>'; }).join('') + '</ul></nav>';
      }
      s.subs.forEach(function (u) {
        h += '<div class="sub" id="' + u.id + '"><h3>' + inline(u.tittel) + '</h3>' +
          u.blokker.map(function (b) { return blokkHtml(b, lang, ui); }).join('') + '</div>';
      });
      h += '<p class="up"><a href="#toc">↑ ' + esc(ui.til_toppen || '') + '</a></p></section>';
      main += h;
    });

    document.getElementById('toc-list').innerHTML = toc;
    var m = document.getElementById('innhold');
    m.innerHTML = main;

    // Bilder vises bare hvis filen finnes. Mangler den, forblir figuren skjult.
    Array.prototype.forEach.call(m.querySelectorAll('img[data-src]'), function (img) {
      img.addEventListener('load', function () { img.parentNode.hidden = false; });
      img.addEventListener('error', function () { img.parentNode.remove(); });
      img.src = img.getAttribute('data-src');
    });

    Array.prototype.forEach.call(spr.querySelectorAll('button'), function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function setTekst(id, t) { var el = document.getElementById(id); if (el && t) el.textContent = t; }

  function feil(lang) {
    var meld = {
      no: 'Innholdet kunne ikke lastes. Se Airbnb-meldingen din, eller prøv igjen senere.',
      de: 'Der Inhalt konnte nicht geladen werden. Schauen Sie in Ihre Airbnb-Nachricht oder versuchen Sie es später noch einmal.',
      en: 'The content could not be loaded. See your Airbnb message, or try again later.'
    };
    document.getElementById('innhold').innerHTML = '<p class="callout warn">' + esc(meld[lang]) + '</p>';
  }

  function vis(lang, flytt) {
    var ferdig = function (data) {
      render(lang, data);
      if (location.hash.length > 1 && !flytt) {
        var maal = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (maal) maal.scrollIntoView();
      }
    };
    if (cache[lang]) return ferdig(cache[lang]);
    fetch('innhold/' + lang + '.md', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { cache[lang] = parse(t); ferdig(cache[lang]); })
      .catch(function () { feil(lang); });
  }

  function start() {
    var lang = fraUrl() || lagret() || fraNettleser();
    document.getElementById('sprak').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      var l = btn.getAttribute('data-lang');
      lagre(l);
      try {
        var u = new URL(location.href);
        if (u.searchParams.has('lang')) { u.searchParams.set('lang', l); history.replaceState(null, '', u); }
      } catch (err) { /* ikke viktig */ }
      vis(l, true);
    });
    document.getElementById('skrivut').addEventListener('click', function () { window.print(); });
    vis(lang, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
