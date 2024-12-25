customElements.define(
    'x-icon',
    class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            const name = this.getAttribute('name');
            const img = document.createElement('img');
            img.src = import.meta.resolve(`bootstrap-icons/icons/${name}.svg`);
            img.alt = name;
            img.loading = 'lazy';
            this.shadowRoot.appendChild(img);
        }
    });

customElements.define(
    "x-math",
    class extends HTMLElement {
        async connectedCallback() {
            const [
                { TeX },
                { CHTML },
                { browserAdaptor },
                { RegisterHTMLHandler },
                { AssistiveMmlHandler },
                { AllPackages },
                { mathjax },
            ] = await Promise.all([
                import("mathjax-full/mjs/input/tex.js"),
                import("mathjax-full/mjs/output/chtml.js"),
                import("mathjax-full/mjs/adaptors/browserAdaptor.js"),
                import("mathjax-full/mjs/handlers/html.js"),
                import("mathjax-full/mjs/a11y/assistive-mml.js"),
                import("mathjax-full/mjs/input/tex/AllPackages.js"),
                import("mathjax-full/mjs/mathjax.js"),
            ]);
            const tex = new TeX({ packages: AllPackages });
            const chtml = new CHTML();
            const adaptor = browserAdaptor();
            const handler = RegisterHTMLHandler(adaptor);
            AssistiveMmlHandler(handler);
            const html = mathjax.document(document, {
                InputJax: tex,
                OutputJax: chtml,
            });
            const shadow = this.attachShadow({ mode: "closed" });
            shadow.appendChild(
                html.convert(this.innerHTML, {
                    display: this.attributes.display ?? false,
                }),
            );
            shadow.appendChild(chtml.styleSheet(html));
        }
    },
);
customElements.define(
    "x-code",
    class extends HTMLElement {
        async connectedCallback() {
            const { codeToHtml } = await import("shiki");
            const shadow = this.attachShadow({ mode: "closed" });
            shadow.innerHTML = await codeToHtml(this.innerHTML, {
                theme: this.getAttribute("theme") ?? "vitesse-light",
                lang: this.getAttribute("lang") ?? "text",
            });
        }
    },
);
customElements.define(
    "x-graph",
    class extends HTMLElement {
        async connectedCallback() {
            const { default: mermaid } = await import("mermaid");
            mermaid.initialize({ startOnLoad: false });
            const code = this.innerHTML.replace("&gt;", ">").replace("&lt;", "<");
            const { svg } = await mermaid.render("graphDiv", code);
            const shadow = this.attachShadow({ mode: "closed" });
            shadow.innerHTML = svg;
        }
    },
);
