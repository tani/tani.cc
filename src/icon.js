class XIcon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        const name = this.getAttribute('name');
        const img = document.createElement('img');
        img.src = `https://cdn.jsdelivr.net/npm/bootstrap-icons@1/icons/${name}.svg`;
        img.alt = name;
        img.loading = 'lazy';
        this.shadowRoot.appendChild(img);
    }
}
customElements.define('x-icon', XIcon);
