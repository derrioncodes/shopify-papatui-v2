


// class CollectionFilters extends HTMLElement {
//     constructor() {
//         super();
//     }

//     get sectionId() {
//         return this.dataset.sectionId;
//     }

//     connectedCallback() {
//         this.filterInputs = this.querySelectorAll("input");
//         this.handleClick = this.handleClick.bind(this);

//         this.filterInputs.forEach((input) => {
//             input.addEventListener("change", this.handleClick);
//         });
//     }



//     handleClick(event) {
//         const input = event.currentTarget;
//         const name = input.name;     // e.g. "filter.v.option.Scent"
//         const value = input.value;   // e.g. "Vanilla"

//         // Start from the CURRENT URL
//         const base = new URL(window.location.href);
//         const params = new URLSearchParams(base.search);

//         if (input.checked) {
//             // allow multiple values for the same key
//             params.append(name, value);
//         } else {
//             // remove ONLY one occurrence of this name=value pair
//             const next = new URLSearchParams();
//             for (const [k, v] of params.entries()) {
//                 if (k === name && v === value) continue; // skip just one match
//                 next.append(k, v);
//             }
//             // replace the set
//             for (const key of Array.from(params.keys())) params.delete(key);
//             for (const [k, v] of next.entries()) params.append(k, v);
//         }

//         // Build fetch URL (with section_id) and clean history URL (without it)
//         const fetchUrl = new URL(base.pathname, window.location.origin);
//         const fetchParams = new URLSearchParams(params);
//         fetchParams.set("section_id", this.sectionId);
//         fetchUrl.search = fetchParams.toString();

//         const historyUrl = new URL(base.pathname, window.location.origin);
//         historyUrl.search = params.toString();

//         fetch(fetchUrl.toString())
//             .then(r => r.text())
//             .then(html => {
//                 const temp = document.createElement("div");
//                 temp.innerHTML = html;

//                 // Replace ONLY the product/grid area; leave filters/accordions alone
//                 const next = temp.querySelector(".collection-container");
//                 const current = document.querySelector(".collection-container");
//                 if (next && current) current.innerHTML = next.innerHTML;

//                 // Update the address bar
//                 window.history.pushState({}, "", historyUrl.toString());
//             })
//             .catch(console.error);
//     }




// }

// customElements.define("collection-filters", CollectionFilters)







// class CollectionFilters extends HTMLElement {
//     constructor() {
//         super();
//     }

//     get sectionId() {
//         return this.dataset.sectionId;
//     }

//     connectedCallback() {
//         this.filterInputs = this.querySelectorAll("input");
//         this.handleClick = this.handleClick.bind(this);

//         this.filterInputs.forEach((input) => {
//             input.addEventListener("change", this.handleClick);
//         });
//     }



//     handleClick(event) {
//         const input = event.currentTarget;
//         const name = input.name;     // e.g. "filter.v.option.Scent"
//         const value = input.value;   // e.g. "Vanilla"



//         // Start from the CURRENT URL
//         const base = new URL(window.location.href);
//         const params = new URLSearchParams(base.search);

//         if (input.checked) {
//             // allow multiple values for the same key
//             params.append(name, value);
//         } else {
//             // remove ONLY one occurrence of this name=value pair
//             const next = new URLSearchParams();
//             for (const [k, v] of params.entries()) {
//                 if (k === name && v === value) continue; // skip just one match
//                 next.append(k, v);
//             }
//             // replace the set
//             for (const key of Array.from(params.keys())) params.delete(key);
//             for (const [k, v] of next.entries()) params.append(k, v);
//         }

//         // Build fetch URL (with section_id) and clean history URL (without it)
//         const fetchUrl = new URL(base.pathname, window.location.origin);
//         const fetchParams = new URLSearchParams(params);
//         fetchParams.set("section_id", this.sectionId);
//         fetchUrl.search = fetchParams.toString();

//         const historyUrl = new URL(base.pathname, window.location.origin);
//         historyUrl.search = params.toString();

//         fetch(fetchUrl.toString())
//             .then(r => r.text())
//             .then(html => {
//                 const temp = document.createElement("div");
//                 temp.innerHTML = html;

//                 // Replace ONLY the product/grid area; leave filters/accordions alone
//                 const next = temp.querySelector(".collection-container");
//                 const current = document.querySelector(".collection-container");
//                 if (next && current) current.innerHTML = next.innerHTML;

//                 // Update the address bar
//                 window.history.pushState({}, "", historyUrl.toString());
//             })
//             .catch(console.error);
//     }




// }

// customElements.define("collection-filters", CollectionFilters)


// class CollectionFilters extends HTMLElement {
//     constructor() {
//       super();
//     }
  
//     get sectionId() {
//       return this.dataset.sectionId;
//     }
  
//     connectedCallback() {
//       this.filterInputs = this.querySelectorAll("input");
//       this.handleChange = this.handleChange.bind(this);
//       this.pushAndRender = this.pushAndRender.bind(this);
//       this.syncPriceUI = this.syncPriceUI.bind(this);
//       this.attachPriceEvents = this.attachPriceEvents.bind(this);
  
//       // IMPORTANT: use a different name so we don't shadow the getter
//       const gridEl = document.querySelector(".collection-container");
//       this.gridSectionId =
//         gridEl?.dataset.gridSectionId || gridEl?.dataset.sectionId || null;
  
//       if (!this.gridSectionId) {
//         console.warn('Missing data-grid-section-id on .collection-container. Falling back to filter section id.');
//       }
  
//       // price refs
//       this.minRange = this.querySelector('input[type="range"][data-min-value]');
//       this.maxRange = this.querySelector('input[type="range"][data-max-value]');
//       this.fillEl   = this.querySelector('[data-price-fill]');
//       this.minNum   = this.querySelector('[data-price-min-input]');
//       this.maxNum   = this.querySelector('[data-price-max-input]');
  
//       // Ensure the active thumb gets pointer events
//       const bringToFront = (el) => {
//         if (!this.minRange || !this.maxRange) return;
//         this.minRange.style.zIndex = '2';
//         this.maxRange.style.zIndex = '3';
//         el.style.zIndex = '4';
//       };
//       [this.minRange, this.maxRange].forEach((el) => {
//         if (!el) return;
//         el.addEventListener('pointerdown', () => bringToFront(el));
//         el.addEventListener('touchstart', () => bringToFront(el), { passive: true });
//         el.addEventListener('mousedown', () => bringToFront(el));
//       });
  
//       // Listeners
//       this.filterInputs.forEach((input) => {
//         if (input.type === "range") {
//           input.addEventListener("change", this.handleChange); // once
//           input.addEventListener("input", this.syncPriceUI);    // live UI
//         } else {
//           input.addEventListener("change", this.handleChange);
//         }
//       });
  
//       this.attachPriceEvents();
//       this.syncPriceUI(); // initial paint

//       console.log({
//         drawerSectionId: this.sectionId,           // from <collection-filters data-section-id>
//         gridSectionId: this.gridSectionId          // from .collection-container
//       });
//     }
  
//     attachPriceEvents() {
//       if (!this.minRange || !this.maxRange) return;
  
//       const onNumInput = () => {
//         const max = Number(this.maxRange.max);
//         const minVal = Math.max(0, Math.min(parseFloat(this.minNum.value || "0"), max));
//         const maxVal = Math.max(0, Math.min(parseFloat(this.maxNum.value || String(max)), max));
//         const newMin = Math.min(minVal, maxVal);
//         const newMax = Math.max(minVal, maxVal);
  
//         this.minRange.value = newMin;
//         this.maxRange.value = newMax;
  
//         this.syncPriceUI();
//         // trigger URL update in cents
//         this.handleChange({ currentTarget: this.minRange });
//         this.handleChange({ currentTarget: this.maxRange });
//       };
  
//       if (this.minNum) this.minNum.addEventListener("change", onNumInput);
//       if (this.maxNum) this.maxNum.addEventListener("change", onNumInput);
//     }
  
//     syncPriceUI() {
//       if (!this.minRange || !this.maxRange) return;
  
//       let minVal = Number(this.minRange.value);
//       let maxVal = Number(this.maxRange.value);
//       if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];
//       this.minRange.value = minVal;
//       this.maxRange.value = maxVal;
  
//       if (this.minNum) this.minNum.value = String(minVal);
//       if (this.maxNum) this.maxNum.value = String(maxVal);
  
//       const maxAttr = Number(this.maxRange.max) || 1;
//       if (this.fillEl) {
//         const left = (minVal / maxAttr) * 100;
//         const right = (maxVal / maxAttr) * 100;
//         this.fillEl.style.left = left + '%';
//         this.fillEl.style.right = (100 - right) + '%';
//       }
//     }
  
//     handleChange(event) {
//       const input = event.currentTarget;
//       const base = new URL(window.location.href);
//       const params = new URLSearchParams(base.search);
  
//       if (input.type === "range") {
//         const name = input.name;                       // filter.v.price.gte|lte
//         const scale = Number(input.dataset.scale || 1);// 100
//         const dollars = parseFloat(input.value || "0");
//         const cents = Math.round(dollars * scale);
  
//         const maxDollars = Number(input.max || "0");
//         const maxCents = Math.round(maxDollars * scale);
  
//         const isMin = input.hasAttribute("data-min-value");
//         const isMax = input.hasAttribute("data-max-value");
  
//         // Set/delete current bound
//         if ((isMin && cents <= 0) || (isMax && dollars >= maxDollars)) {
//           params.delete(name);
//         } else {
//           params.set(name, String(cents));
//         }
  
//         // Ensure complementary bound exists
//         const minName = this.minRange?.name;
//         const maxName = this.maxRange?.name;
  
//         if (isMin) {
//           const minAtExtreme = cents <= 0;
//           const otherMissing = maxName && !params.has(maxName);
//           if (!minAtExtreme && otherMissing) params.set(maxName, String(maxCents));
//         }
//         if (isMax) {
//           const maxAtExtreme = dollars >= maxDollars;
//           const otherMissing = minName && !params.has(minName);
//           if (!maxAtExtreme && otherMissing) params.set(minName, "0");
//         }
  
//         // If both at extremes, remove both
//         const hasMin = minName && params.has(minName);
//         const hasMax = maxName && params.has(maxName);
//         const minIsZero = hasMin && params.get(minName) === "0";
//         const maxIsCeil = hasMax && params.get(maxName) === String(maxCents);
//         if (minIsZero && maxIsCeil) {
//           params.delete(minName);
//           params.delete(maxName);
//         }
  
//         this.pushAndRender(params);
//         return;
//       }
  
//       // checkbox/list/boolean
//       const name = input.name;
//       const value = input.value;
  
//       if (input.checked) {
//         params.append(name, value);
//       } else {
//         const next = new URLSearchParams();
//         for (const [k, v] of params.entries()) {
//           if (k === name && v === value) continue;
//           next.append(k, v);
//         }
//         for (const key of Array.from(params.keys())) params.delete(key);
//         for (const [k, v] of next.entries()) params.append(k, v);
//       }
  
//       this.pushAndRender(params);
//     }
  
//     pushAndRender(params) {
//       const base = new URL(window.location.href);
//       const sectionId = this.gridSectionId || this.sectionId; // grid first
  
//       const fetchUrl = new URL(base.pathname, window.location.origin);
//       const fetchParams = new URLSearchParams(params);
//       fetchParams.set("section_id", sectionId);
//       fetchUrl.search = fetchParams.toString();
  
//       const historyUrl = new URL(base.pathname, window.location.origin);
//       historyUrl.search = params.toString();
  
//       console.log('fetch section →', sectionId, 'URL →', fetchUrl.toString());
  
//       fetch(fetchUrl.toString())
//         .then(r => r.text())
//         .then(html => {
//           const temp = document.createElement("div");
//           temp.innerHTML = html;
//           const next = temp.querySelector(".collection-container");
//           const current = document.querySelector(".collection-container");
  
//           if (!next) console.warn('No .collection-container found in fetched HTML. Check section_id:', sectionId);
//           if (next && current) current.innerHTML = next.innerHTML;
  
//           window.history.pushState({}, "", historyUrl.toString());
//         })
//         .catch(console.error);
//     }
//   }
  
//   customElements.define("collection-filters", CollectionFilters);

// CHeclboxes

  








