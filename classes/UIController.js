/** @fileoverview UI-controller med korrekt typning och null-säkerhet */

/* =========================
   UIController
   ========================= */

/**
 * Hanterar UI-relaterad logik för applikationen.
 * @constructor
 * @param {string} outputElementId
 * @param {string} containerId
 */
function UIController(outputElementId, containerId){
    /** @type {string} */
    this.outputElementId = outputElementId;

    /** @type {?HTMLElement} */
    this.container = /** @type {?HTMLElement} */ (document.getElementById(containerId));

    /** @type {!Object<string,string>} */
    this.currencies = {};
}

/* =========================
   VISA LAND
   ========================= */

/**
 * Renderar information om ett land i UI:t.
 * @param {{
 *   name: { common: string },
 *   flags: { png: string },
 *   currencies: (?Object<string,{name:string}>|undefined)
 * }} country
 * @param {{ latitude: number, longitude: number }=} position
 */
UIController.prototype.renderCountry = function(country, position){
    /** @type {?HTMLElement} */
    const output = /** @type {?HTMLElement} */ (document.getElementById(this.outputElementId));
    if(!output) return;
    output.innerHTML = "";

    const container = document.createElement("div");

    const title = document.createElement("h3");
    title.innerText = country.name.common;

    /** @type {!HTMLImageElement} */
    const flag = /** @type {!HTMLImageElement} */ (document.createElement("img"));
    flag.src = country.flags.png;
    flag.alt = country.name.common + " flag";

    container.appendChild(title);
    container.appendChild(flag);

    if(position){
        const coords = document.createElement("p");
        coords.innerText =
            "Lat: " + position.latitude.toFixed(4) +
            ", Lng: " + position.longitude.toFixed(4);
        container.appendChild(coords);
    }

    output.appendChild(container);
};

/* =========================
   SKAPA VALUTADROPDOWNS
   ========================= */

/**
 * Renderar och fyller dropdownlistor för bas- och målvalutor.
 *
 * @param {!Array<{
 *   name: { common: string },
 *   flags: { png: string },
 *   currencies: (?Object<string,{name:string}>|undefined)
 * }>} countries
 * @param {?{
 *   name: { common: string },
 *   flags: { png: string },
 *   currencies: (?Object<string,{name:string}>|undefined)
 * }} userCountry
 * @param {{ loadRate: function():void }} app
 * @param {!Object<string,number>} availableRates
 */
UIController.prototype.renderCurrencies =
function(countries, userCountry, app, availableRates){
    /** @type {?HTMLSelectElement} */
    const baseSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("baseCurrency"));

    /** @type {?HTMLSelectElement} */
    const targetSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("targetCurrency"));

    /** @type {?HTMLInputElement} */
    const baseInput = /** @type {?HTMLInputElement} */ (document.getElementById("inB"));

    /** @type {?HTMLInputElement} */
    const targetInput = /** @type {?HTMLInputElement} */ (document.getElementById("inM"));

    const bv = document.getElementById("bv");
    const mv = document.getElementById("mv");

    if(!baseSelect || !targetSelect || !availableRates) return;

    baseSelect.innerHTML = "";
    targetSelect.innerHTML = "";
    this.currencies = {};

    // Bygg lista med valutor som finns i både countries och availableRates
    countries.forEach(country => {
        if(!country.currencies) return;
        for(let code in country.currencies){
            code = code.toUpperCase();
            if(!this.currencies[code] && availableRates[code]){
                this.currencies[code] = country.currencies[code].name;
            }
        }
    });

    // Placeholder
    const placeholderBase = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
    placeholderBase.value = "";
    placeholderBase.textContent = "-- Välj basvaluta --";
    placeholderBase.disabled = true;
    placeholderBase.selected = true;
    baseSelect.appendChild(placeholderBase);

    const placeholderTarget = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
    placeholderTarget.value = "";
    placeholderTarget.textContent = "-- Välj målvaluta --";
    placeholderTarget.disabled = true;
    placeholderTarget.selected = true;
    targetSelect.appendChild(placeholderTarget);

    // Fyll dropdowns med valutor
    Object.keys(this.currencies).sort().forEach(code => {
        const optBase = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
        optBase.value = code;
        optBase.textContent = code + " - " + this.currencies[code];
        baseSelect.appendChild(optBase);

        const optTarget = /** @type {!HTMLOptionElement} */ (document.createElement("option"));
        optTarget.value = code;
        optTarget.textContent = code + " - " + this.currencies[code];
        targetSelect.appendChild(optTarget);
    });

    // Sätt standardvaluta baserat på användarens land
    if(userCountry && userCountry.currencies){
        const userCurrency = Object.keys(userCountry.currencies)[0].toUpperCase();
        if(availableRates[userCurrency]){
            baseSelect.value = userCurrency;
            if(bv) bv.innerText = userCurrency + " - " + this.currencies[userCurrency];
        }
    }

    // Event listeners
    baseSelect.addEventListener("change", () => {
        if(bv && baseSelect.value) bv.innerText = baseSelect.value + " - " + this.currencies[baseSelect.value];
        if(baseInput) baseInput.value = "";
        if(targetInput) targetInput.value = "";
        if(baseSelect.value && targetSelect.value && app) app.loadRate();
    });

    targetSelect.addEventListener("change", () => {
        if(mv && targetSelect.value) mv.innerText = targetSelect.value + " - " + this.currencies[targetSelect.value];
        if(baseInput) baseInput.value = "";
        if(targetInput) targetInput.value = "";
        if(baseSelect.value && targetSelect.value && app) app.loadRate();
    });
};

/* =========================
   UPPDATERA DROPDOWNS
   ========================= */

/**
 * Uppdaterar valda valutor i dropdownlistorna.
 * @param {string} base
 * @param {string} target
 */
UIController.prototype.updateCurrencyDropdowns =
function(base, target){
    /** @type {?HTMLSelectElement} */
    const baseSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("baseCurrency"));

    /** @type {?HTMLSelectElement} */
    const targetSelect = /** @type {?HTMLSelectElement} */ (document.getElementById("targetCurrency"));

    const bv = document.getElementById("bv");
    const mv = document.getElementById("mv");

    if(baseSelect) baseSelect.value = base;
    if(targetSelect) targetSelect.value = target;

    if(bv && this.currencies[base]) bv.innerText = base + " - " + this.currencies[base];
    if(mv && this.currencies[target]) mv.innerText = target + " - " + this.currencies[target];
};