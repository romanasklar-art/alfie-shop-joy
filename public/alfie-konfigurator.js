/**
 * Alfie Store — vizuální konfigurátor výšivek
 * Vložte do Upgates: Editor kódu → custom JS (nebo šablona produktu)
 *
 * Jak to funguje:
 * - Skryje původní Upgates selectboxy pro výšivky
 * - Zobrazí vizuální konfigurátor se seznamem umístění
 * - Každé umístění má vlastní upload obrázku
 * - Výběr zapisuje zpět do původních selectů → Upgates počítá cenu a zpracuje objednávku normálně
 * - Náhled nahraného obrázku s odstraněním pozadí (přes Supabase Edge Function)
 */
(function () {
  'use strict';

  // ─── Konfigurace ─────────────────────────────────────────────────────────────

  // URL vaší Supabase Edge Function pro odstranění pozadí
  const BG_REMOVAL_URL = 'https://sjiqmswnhkmrsuysnzrn.supabase.co/functions/v1/remove-background';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaXFtc3duaGttcnN1eXNuenJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDUzNDAsImV4cCI6MjA5MDk4MTM0MH0.rmpDUep4w562y8KA4YnhCyYifqINhfvre4L_PRY0GhI';

  // ─── Produkty ────────────────────────────────────────────────────────────────

  const PRODUKTY = {
    tricko: {
      slugy: ['panske-tricko', 'damske-tricko', 'tricko'],
      zony: [
        { id: 'srdce',   nazev: 'Vlevo u srdce',              info: '13×13 cm · přední strana', typ: 'mala',  select: 'Výšivka (13x13 cm)',      value: 'Vlevo u srdce',              barva: '#ff2600', predni: true  },
        { id: 'hrudnik', nazev: 'Uprostřed hrudníku',          info: '25×15 cm · přední strana', typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed hrudníku',         barva: '#1D9E75', predni: true  },
        { id: 'lem-p',   nazev: 'Vpravo dole · přední lem',    info: '13×13 cm · přední strana', typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u předního lemu', barva: '#7F77DD', predni: true  },
        { id: 'krk',     nazev: 'Za krkem',                    info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Za krkem',                   barva: '#BA7517', predni: false },
        { id: 'zada',    nazev: 'Uprostřed zad',               info: '25×15 cm · zadní strana',  typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed zad',              barva: '#1D9E75', predni: false },
        { id: 'lem-z',   nazev: 'Vpravo dole · zadní lem',     info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u zadního lemu', barva: '#7F77DD', predni: false },
      ],
      kolize: [['srdce', 'hrudnik']],
    },
    mikina: {
      slugy: ['mikina', 'panska-mikina', 'damska-mikina'],
      zony: [
        { id: 'srdce',   nazev: 'Vlevo u srdce',           info: '13×13 cm · přední strana', typ: 'mala',  select: 'Výšivka (13x13 cm)',      value: 'Vlevo u srdce',      barva: '#ff2600', predni: true  },
        { id: 'hrudnik', nazev: 'Uprostřed hrudníku',       info: '25×15 cm · přední strana', typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed hrudníku', barva: '#1D9E75', predni: true  },
        { id: 'krk',     nazev: 'Za krkem',                 info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Za krkem',           barva: '#BA7517', predni: false },
        { id: 'zada',    nazev: 'Uprostřed zad',             info: '25×15 cm · zadní strana',  typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed zad',      barva: '#1D9E75', predni: false },
        { id: 'lem-z',   nazev: 'Vpravo dole · zadní lem',  info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u zadního lemu', barva: '#7F77DD', predni: false },
      ],
      kolize: [['srdce', 'hrudnik']],
    },
    detske: {
      slugy: ['detske', 'detska-mikina', 'detske-tricko'],
      zony: [
        { id: 'hrudnik',   nazev: 'Uprostřed hrudníku',          info: '13×13 cm · přední strana', typ: 'mala',  select: 'Výšivka (13x13 cm)',      value: 'Uprostřed hrudníku',         barva: '#ff2600', predni: true  },
        { id: 'lem-p',     nazev: 'Vpravo dole · přední lem',    info: '13×13 cm · přední strana', typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u předního lemu', barva: '#7F77DD', predni: true  },
        { id: 'hrudnik-v', nazev: 'Uprostřed hrudníku (velká)',  info: '25×15 cm · přední strana', typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed hrudníku',         barva: '#1D9E75', predni: true  },
        { id: 'krk',       nazev: 'Za krkem',                    info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Za krkem',                   barva: '#BA7517', predni: false },
        { id: 'zada',      nazev: 'Uprostřed zad',               info: '25×15 cm · zadní strana',  typ: 'velka', select: 'Velká výšivka (25x15 cm)', value: 'Uprostřed zad',              barva: '#1D9E75', predni: false },
        { id: 'lem-z',     nazev: 'Vpravo dole · zadní lem',     info: '13×13 cm · zadní strana',  typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u zadního lemu', barva: '#7F77DD', predni: false },
      ],
      kolize: [['hrudnik', 'hrudnik-v']],
    },
    taska_velka: {
      slugy: ['platena-taska', 'taska-s-vysivkou'],
      zony: [
        { id: 'predni', nazev: 'Přední strana', info: '20×20 cm', typ: 'mala',  select: 'Výšivka (13x13 cm)',      value: 'Vlevo u srdce',              barva: '#ff2600', predni: true  },
        { id: 'zadni',  nazev: 'Zadní strana',  info: '20×20 cm', typ: 'navic', select: 'Výšivka navíc (13x13 cm)', value: 'Vpravo dole u zadního lemu', barva: '#1D9E75', predni: false },
      ],
      kolize: [],
    },
    polstar: {
      slugy: ['polstar', 'povlak-na-polstar'],
      zony: [
        { id: 'prirodni', nazev: 'Přírodní strana', info: '20×20 cm', typ: 'mala',  select: 'Výšivka polštáře', value: 'Přírodní strana', barva: '#ff2600', predni: true  },
        { id: 'barvena',  nazev: 'Barevná strana',  info: '20×20 cm', typ: 'navic', select: 'Výšivka polštáře', value: 'Barevná strana',  barva: '#1D9E75', predni: false },
      ],
      kolize: [],
    },
    zastera: {
      slugy: ['zastera'],
      zony: [
        { id: 'mala',  nazev: 'Malá výšivka',  info: '13×13 cm · přední strana', typ: 'mala',  select: 'Velikost výšivky na zástěru', value: 'Malá výšivka (13x13 cm)',          barva: '#ff2600', predni: true },
        { id: 'velka', nazev: 'Velká výšivka',  info: '25×15 cm · přední strana', typ: 'velka', select: 'Velikost výšivky na zástěru', value: 'Velká výšivka (25x15 cm) (+500 Kč)', barva: '#1D9E75', predni: true },
      ],
      kolize: [['mala', 'velka']],
    },
  };

  // ─── Pomocné funkce ──────────────────────────────────────────────────────────

  function getProduktTyp() {
    var slug = window.location.pathname;
    for (var _i = 0, _a = Object.entries(PRODUKTY); _i < _a.length; _i++) {
      var _b = _a[_i], typ = _b[0], data = _b[1];
      if (data.slugy.some(function(s) { return slug.includes(s); })) return { typ: typ, data: data };
    }
    return null;
  }

  function najdiSelect(labelText) {
    var labels = document.querySelectorAll('.col-form-label, label');
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      if (label.textContent.trim().includes(labelText)) {
        var row = label.closest('.form-row, .form-group, tr, div');
        if (row) {
          var sel = row.querySelector('select.configurationObject, select');
          if (sel) return sel;
        }
      }
    }
    return null;
  }

  function nastavSelect(selectEl, value) {
    if (!selectEl) return false;
    for (var i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].text.trim().startsWith(value)) {
        selectEl.value = selectEl.options[i].value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  function resetSelect(selectEl) {
    if (!selectEl) return;
    selectEl.value = selectEl.options[0] ? selectEl.options[0].value : '';
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ─── Odstranění pozadí přes Supabase Edge Function ──────────────────────────

  function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function odstranitPozadi(file) {
    try {
      var base64 = await fileToBase64(file);
      var resp = await fetch(BG_REMOVAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (!resp.ok) return null;
      var data = await resp.json();
      if (data.success && data.image) return data.image;
      return null;
    } catch (e) {
      console.error('BG removal error:', e);
      return null;
    }
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  function buildCSS() {
    if (document.getElementById('alfie-konfig-css')) return;
    var style = document.createElement('style');
    style.id = 'alfie-konfig-css';
    style.textContent = '\
      #alfie-konfig { margin: 16px 0; font-family: inherit; }\
      #alfie-konfig .ak-zona-list { list-style: none; padding: 0; margin: 0 0 12px; }\
      #alfie-konfig .ak-zona-item {\
        display: flex; flex-direction: column;\
        border: 1px solid #e0ddd6; border-radius: 10px;\
        margin-bottom: 8px; overflow: hidden;\
        transition: border-color .15s;\
        background: #fff;\
      }\
      #alfie-konfig .ak-zona-item.aktivni { border-color: #ff2600; }\
      #alfie-konfig .ak-zona-item.blokovana { opacity: .35; pointer-events: none; }\
      #alfie-konfig .ak-zona-header {\
        display: flex; align-items: center; gap: 10px;\
        padding: 10px 14px; cursor: pointer; user-select: none;\
      }\
      #alfie-konfig .ak-zona-radio {\
        width: 18px; height: 18px; border-radius: 50%;\
        border: 2px solid #ccc; flex-shrink: 0;\
        display: flex; align-items: center; justify-content: center;\
        transition: border-color .15s;\
      }\
      #alfie-konfig .ak-zona-item.aktivni .ak-zona-radio {\
        border-color: #ff2600; background: #ff2600;\
      }\
      #alfie-konfig .ak-zona-radio::after {\
        content: ""; width: 7px; height: 7px;\
        border-radius: 50%; background: #fff; display: none;\
      }\
      #alfie-konfig .ak-zona-item.aktivni .ak-zona-radio::after { display: block; }\
      #alfie-konfig .ak-zona-dot {\
        width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;\
      }\
      #alfie-konfig .ak-zona-text { flex: 1; }\
      #alfie-konfig .ak-zona-nazev { font-size: 14px; font-weight: 600; color: #1a1a1a; }\
      #alfie-konfig .ak-zona-info { font-size: 12px; color: #888; margin-top: 1px; }\
      #alfie-konfig .ak-zona-badge {\
        font-size: 11px; font-weight: 600; padding: 2px 8px;\
        border-radius: 20px; flex-shrink: 0;\
      }\
      #alfie-konfig .ak-badge-zdarma { background: #e8f5e9; color: #2e7d32; }\
      #alfie-konfig .ak-badge-priplatek { background: #fff3e0; color: #e65100; }\
      #alfie-konfig .ak-upload-sekce {\
        padding: 0 14px 12px;\
        display: none; flex-direction: column; gap: 8px;\
      }\
      #alfie-konfig .ak-zona-item.aktivni .ak-upload-sekce { display: flex; }\
      #alfie-konfig .ak-upload-label {\
        display: flex; align-items: center; gap: 8px;\
        padding: 8px 12px; border: 1.5px dashed #ccc; border-radius: 8px;\
        cursor: pointer; font-size: 13px; color: #555;\
        transition: border-color .15s;\
      }\
      #alfie-konfig .ak-upload-label:hover { border-color: #ff2600; color: #ff2600; }\
      #alfie-konfig .ak-upload-label input { display: none; }\
      #alfie-konfig .ak-nahled {\
        display: flex; align-items: center; gap: 10px;\
        padding: 8px; border: 1px solid #e0ddd6; border-radius: 8px;\
        background: #f9f8f5;\
      }\
      #alfie-konfig .ak-nahled img {\
        width: 56px; height: 56px; object-fit: contain;\
        border-radius: 6px; background: #fff;\
      }\
      #alfie-konfig .ak-nahled-info { flex: 1; }\
      #alfie-konfig .ak-nahled-nazev { font-size: 12px; font-weight: 500; color: #333; }\
      #alfie-konfig .ak-nahled-stav { font-size: 11px; color: #888; margin-top: 2px; }\
      #alfie-konfig .ak-btn-bg {\
        font-size: 11px; padding: 4px 10px; border-radius: 6px;\
        border: 1px solid #ddd; background: #fff; cursor: pointer;\
        color: #555; transition: all .15s;\
      }\
      #alfie-konfig .ak-btn-bg:hover { border-color: #ff2600; color: #ff2600; }\
      #alfie-konfig .ak-btn-bg.nacitam { opacity: .6; pointer-events: none; }\
      #alfie-konfig .ak-sekce-nadpis {\
        font-size: 11px; font-weight: 600; color: #aaa;\
        letter-spacing: .05em; text-transform: uppercase;\
        margin: 14px 0 6px;\
      }\
      #alfie-konfig .ak-poznamka { margin-top: 12px; }\
      #alfie-konfig .ak-poznamka-label {\
        font-size: 13px; font-weight: 600; color: #333;\
        margin-bottom: 6px; display: block;\
      }\
      #alfie-konfig .ak-poznamka textarea {\
        width: 100%; box-sizing: border-box;\
        padding: 10px 12px; border: 1px solid #e0ddd6; border-radius: 10px;\
        font-size: 13px; color: #333; resize: vertical; min-height: 72px;\
        font-family: inherit; line-height: 1.5;\
        transition: border-color .15s;\
        background: #fff !important;\
        -webkit-text-fill-color: #333 !important;\
      }\
      #alfie-konfig .ak-poznamka textarea:focus {\
        outline: none; border-color: #ff2600;\
        background: #fff !important;\
      }\
      #alfie-konfig .ak-poznamka textarea::placeholder {\
        color: #aaa !important;\
        -webkit-text-fill-color: #aaa !important;\
        opacity: 1;\
      }\
      #alfie-konfig .ak-kolize-msg {\
        font-size: 12px; color: #c62828; background: #ffebee;\
        border-radius: 8px; padding: 8px 12px; margin-bottom: 8px;\
        display: none;\
      }\
    ';
    document.head.appendChild(style);
  }

  // ─── Stavba UI ───────────────────────────────────────────────────────────────

  function buildKonfigurator(produktData) {
    var zony = produktData.zony;
    var kolize = produktData.kolize;
    var vybrane = {};

    var selectLabels = [];
    zony.forEach(function(z) { if (selectLabels.indexOf(z.select) === -1) selectLabels.push(z.select); });
    var selectEls = {};
    selectLabels.forEach(function(label) {
      var sel = najdiSelect(label);
      if (sel) {
        selectEls[label] = sel;
        var row = sel.closest('.form-row, .form-group, tr');
        if (row) row.style.display = 'none';
      }
    });

    var originalUploadBtn = document.querySelector('.vnca-upload, .vnca-a');
    if (originalUploadBtn) {
      var row = originalUploadBtn.closest('.form-row, .form-group, div.row');
      if (row) row.style.display = 'none';
      else originalUploadBtn.style.display = 'none';
    }

    var poznamkaOriginal = null;
    var labels = document.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.includes('Poznámka')) {
        var pRow = labels[i].closest('.form-row, .form-group');
        if (pRow) {
          pRow.style.display = 'none';
          poznamkaOriginal = pRow.querySelector('input, textarea');
        }
        break;
      }
    }

    var wrapper = document.createElement('div');
    wrapper.id = 'alfie-konfig';

    var predniZony = zony.filter(function(z) { return z.predni; });
    var zadniZony  = zony.filter(function(z) { return !z.predni; });

    function badgeHTML(zona) {
      if (zona.typ === 'velka') return '<span class="ak-zona-badge ak-badge-priplatek">+500 Kč</span>';
      if (zona.typ === 'navic') return '<span class="ak-zona-badge ak-badge-priplatek">+300 Kč</span>';
      var pocetMalych = Object.keys(vybrane).filter(function(id) {
        var z = zony.find(function(x) { return x.id === id; });
        return z && z.typ === 'mala';
      }).length;
      return pocetMalych === 0
        ? '<span class="ak-zona-badge ak-badge-zdarma">v ceně</span>'
        : '<span class="ak-zona-badge ak-badge-priplatek">+300 Kč</span>';
    }

    function zonaHTML(zona) {
      return '\
        <li class="ak-zona-item" data-id="' + zona.id + '">\
          <div class="ak-zona-header">\
            <div class="ak-zona-radio"></div>\
            <div class="ak-zona-dot" style="background:' + zona.barva + '"></div>\
            <div class="ak-zona-text">\
              <div class="ak-zona-nazev">' + zona.nazev + '</div>\
              <div class="ak-zona-info">' + zona.info + '</div>\
            </div>\
            ' + badgeHTML(zona) + '\
          </div>\
          <div class="ak-upload-sekce">\
            <label class="ak-upload-label">\
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">\
                <path d="M8 2v8M5 5l3-3 3 3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>\
              </svg>\
              Nahrát kresbu pro toto umístění\
              <input type="file" accept="image/*,.pdf" data-zona="' + zona.id + '">\
            </label>\
            <div class="ak-nahled" id="nahled-' + zona.id + '" style="display:none">\
              <img id="nahled-img-' + zona.id + '" src="" alt="náhled">\
              <div class="ak-nahled-info">\
                <div class="ak-nahled-nazev" id="nahled-nazev-' + zona.id + '"></div>\
                <div class="ak-nahled-stav" id="nahled-stav-' + zona.id + '">Nahráno</div>\
              </div>\
              <button type="button" class="ak-btn-bg" data-zona="' + zona.id + '">Odstranit pozadí</button>\
            </div>\
          </div>\
        </li>';
    }

    function sekceHTML(titulek, zonyPole) {
      if (!zonyPole.length) return '';
      return '<div class="ak-sekce-nadpis">' + titulek + '</div>' +
        '<ul class="ak-zona-list">' + zonyPole.map(zonaHTML).join('') + '</ul>';
    }

    wrapper.innerHTML = '\
      <div class="ak-kolize-msg" id="ak-kolize-msg">\
        Vybraná umístění se vzájemně překrývají — vyberte pouze jedno.\
      </div>\
      ' + sekceHTML('Přední strana', predniZony) + '\
      ' + sekceHTML('Zadní strana', zadniZony) + '\
      <div class="ak-poznamka">\
        <label class="ak-poznamka-label" for="ak-poznamka-text">Poznámka k objednávce</label>\
        <textarea id="ak-poznamka-text"\
          placeholder=\'Např. "Vyšijte prosím jen tu kočičku vpravo" nebo "Odstraňte pozadí, nechte jen panáčka"\'\
          rows="3"></textarea>\
      </div>\
    ';

    var addToCart = document.querySelector('.pd-tocart, form[action*="cart"], .btn-add-to-cart');
    if (addToCart) {
      addToCart.before(wrapper);
    } else {
      var pd = document.querySelector('.pd-tocart, .product-detail');
      if (pd) pd.appendChild(wrapper);
    }

    // ─── Event listenery ──────────────────────────────────────────────────────

    wrapper.querySelectorAll('.ak-zona-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var item = header.closest('.ak-zona-item');
        var id = item.dataset.id;
        if (item.classList.contains('blokovana')) return;

        if (item.classList.contains('aktivni')) {
          item.classList.remove('aktivni');
          delete vybrane[id];
          var zona = zony.find(function(z) { return z.id === id; });
          if (zona) resetSelect(selectEls[zona.select]);
        } else {
          item.classList.add('aktivni');
          vybrane[id] = vybrane[id] || {};
          var zona = zony.find(function(z) { return z.id === id; });
          if (zona) nastavSelect(selectEls[zona.select], zona.value);
        }
        aktualizujKolize();
        aktualizujBadge();
      });
    });

    wrapper.querySelectorAll('input[type=file]').forEach(function(input) {
      input.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var id = input.dataset.zona;
        vybrane[id] = vybrane[id] || {};
        vybrane[id].file = file;
        vybrane[id].urlOriginal = URL.createObjectURL(file);

        var nahled = document.getElementById('nahled-' + id);
        var img = document.getElementById('nahled-img-' + id);
        var nazev = document.getElementById('nahled-nazev-' + id);
        var stav = document.getElementById('nahled-stav-' + id);

        img.src = vybrane[id].urlOriginal;
        nazev.textContent = file.name;
        stav.textContent = 'Nahráno';
        nahled.style.display = 'flex';

        var originalInput = document.querySelector('.vnca-upload input[type=file], input[type=file][name*="upload"], input[type=file][name*="image"]');
        if (originalInput) {
          var dt = new DataTransfer();
          Object.values(vybrane).forEach(function(v) { if (v.file) dt.items.add(v.file); });
          originalInput.files = dt.files;
          originalInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    wrapper.querySelectorAll('.ak-btn-bg').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        var id = btn.dataset.zona;
        if (!vybrane[id] || !vybrane[id].file) return;

        var stav = document.getElementById('nahled-stav-' + id);
        var img  = document.getElementById('nahled-img-' + id);

        btn.classList.add('nacitam');
        btn.textContent = 'Zpracovávám…';
        stav.textContent = 'Odstraňuji pozadí…';

        var url = await odstranitPozadi(vybrane[id].file);
        btn.classList.remove('nacitam');

        if (url) {
          vybrane[id].urlBezPozadi = url;
          img.src = url;
          stav.textContent = 'Pozadí odstraněno';
          btn.textContent = 'Vrátit originál';
          btn.onclick = function() {
            img.src = vybrane[id].urlOriginal;
            stav.textContent = 'Nahráno';
            btn.textContent = 'Odstranit pozadí';
            btn.onclick = null;
          };
        } else {
          stav.textContent = 'Nepodařilo se — zkuste znovu';
          btn.textContent = 'Odstranit pozadí';
        }
      });
    });

    var poznamkaTxt = wrapper.querySelector('#ak-poznamka-text');
    if (poznamkaTxt) {
      poznamkaTxt.addEventListener('input', function() {
        if (poznamkaOriginal && poznamkaOriginal.tagName) {
          poznamkaOriginal.value = poznamkaTxt.value;
          poznamkaOriginal.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }

    // ─── Kolize a badge ───────────────────────────────────────────────────────

    function aktualizujKolize() {
      var aktID = Object.keys(vybrane);
      var maKolizi = false;

      kolize.forEach(function(par) {
        var oba = par.every(function(id) { return aktID.indexOf(id) !== -1; });
        if (oba) maKolizi = true;

        par.forEach(function(id) {
          var jinyVybrany = par.some(function(x) { return x !== id && aktID.indexOf(x) !== -1; });
          var el = wrapper.querySelector('[data-id="' + id + '"]');
          if (!el) return;
          if (aktID.indexOf(id) === -1 && jinyVybrany) {
            el.classList.add('blokovana');
          } else {
            el.classList.remove('blokovana');
          }
        });
      });

      var msg = document.getElementById('ak-kolize-msg');
      if (msg) msg.style.display = maKolizi ? 'block' : 'none';
    }

    function aktualizujBadge() {
      var malychPocitadlo = 0;
      zony.forEach(function(zona) {
        var item = wrapper.querySelector('[data-id="' + zona.id + '"]');
        if (!item) return;
        var badge = item.querySelector('.ak-zona-badge');
        if (!badge) return;
        if (zona.typ === 'velka' || zona.typ === 'navic') return;
        var jeVybrana = !!vybrane[zona.id];
        if (jeVybrana) malychPocitadlo++;
        var jeZdarma = malychPocitadlo <= 1;
        badge.className = 'ak-zona-badge ' + (jeZdarma ? 'ak-badge-zdarma' : 'ak-badge-priplatek');
        badge.textContent = jeZdarma ? 'v ceně' : '+300 Kč';
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    if (!document.querySelector('.pd-tocart, .product-detail, [class*="product"]')) return;
    var produkt = getProduktTyp();
    if (!produkt) return;
    buildCSS();
    buildKonfigurator(produkt.data);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
