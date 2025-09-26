


class CollectionFilters extends HTMLElement {
    constructor() {
        super();
    }

    get sectionId() {
        return this.dataset.sectionId;
    }

    connectedCallback() {
        this.filterInputs = this.querySelectorAll("input");
        this.handleClick = this.handleClick.bind(this);

        this.filterInputs.forEach((input) => {
            input.addEventListener("change", this.handleClick);
        });
    }

    

    handleClick(event) {
        const input = event.currentTarget;
        const name = input.name;     // e.g. "filter.v.option.Scent"
        const value = input.value;   // e.g. "Vanilla"

        // Start from the CURRENT URL
        const base = new URL(window.location.href);
        const params = new URLSearchParams(base.search);

        if (input.checked) {
            // allow multiple values for the same key
            params.append(name, value);
        } else {
            // remove ONLY one occurrence of this name=value pair
            const next = new URLSearchParams();
            for (const [k, v] of params.entries()) {
                if (k === name && v === value) continue; // skip just one match
                next.append(k, v);
            }
            // replace the set
            for (const key of Array.from(params.keys())) params.delete(key);
            for (const [k, v] of next.entries()) params.append(k, v);
        }

        // Build fetch URL (with section_id) and clean history URL (without it)
        const fetchUrl = new URL(base.pathname, window.location.origin);
        const fetchParams = new URLSearchParams(params);
        fetchParams.set("section_id", this.sectionId);
        fetchUrl.search = fetchParams.toString();

        const historyUrl = new URL(base.pathname, window.location.origin);
        historyUrl.search = params.toString();

        fetch(fetchUrl.toString())
            .then(r => r.text())
            .then(html => {
                const temp = document.createElement("div");
                temp.innerHTML = html;

                // Replace ONLY the product/grid area; leave filters/accordions alone
                const next = temp.querySelector(".collection-container");
                const current = document.querySelector(".collection-container");
                if (next && current) current.innerHTML = next.innerHTML;

                // Update the address bar
                window.history.pushState({}, "", historyUrl.toString());
            })
            .catch(console.error);
    }




}

customElements.define("collection-filters", CollectionFilters)