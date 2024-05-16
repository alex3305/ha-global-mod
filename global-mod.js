class GlobalMod {

    static version = '0.0.3';

    static styleClass = 'global-mod';

    static activeClass = 'active';

    static instance;

    hass;

    config;

    styles;
    
    constructor(hass) {
        GlobalMod.instance = this;

        GlobalMod.instance.hass = hass;
        GlobalMod.instance.config = GlobalMod.instance.hass.themes.themes[GlobalMod.styleClass];
        GlobalMod.instance.styles = [];
        
        window.addEventListener('location-changed', () => GlobalMod.instance.applyStyles(), false);
        GlobalMod.instance.applyStyles();
    }

    async addStyleElement(tree, cssStyle) {
        let style;

        try {
            style = tree.querySelector(`style.${GlobalMod.styleClass}`);
        } catch (error) { }

        if (!style) {
            style = document.createElement('style');
            
            style.classList.add(GlobalMod.styleClass);
            style.classList.add(GlobalMod.activeClass);
            style.setAttribute('type', 'text/css');
            style.textContent = cssStyle;
            
            try {
                // TODO add retry
                tree.appendChild(style);
            } catch (error) { }
            return style;
        }

        style.classList.add(GlobalMod.activeClass);
    }

    async applyStyles(styles, config) {
        for (const style of GlobalMod.instance.styles) {
            if (style) {
                style.classList.remove(GlobalMod.activeClass);
            }
        }

        for (const path in GlobalMod.instance.config) {
            const current = window.location.pathname.toLowerCase();

            if (current.includes(path.toLowerCase())) {
                for (const rule of GlobalMod.instance.config[path]) {
                    const tree = await GlobalMod.instance.selectTree(rule.selector);
                    const style = await GlobalMod.instance.addStyleElement(tree, rule.style);
                    GlobalMod.instance.styles.push(style);
                }
            }
        }

        for (const style of GlobalMod.instance.styles) {
            if (style && !style.classList.contains(GlobalMod.activeClass)) {
                style.remove();
            }
        }
    }

    async selectTree(selector) {
        let components = selector.split('$');
        let tree;

        for (let i = 0; i < components.length; i++) {
            if (components[i]) {
                tree = tree ? tree.querySelector(components[i]) : 
                            document.querySelector(components[i]);

                if (i + 1 < components.length) {
                    tree = tree.shadowRoot;
                }
            }
        }
        
        return tree;
    }
}

new GlobalMod(document.querySelector('home-assistant').hass);
console.info(`%c Global Mod %c ${GlobalMod.version}`, "color:white;background:purple;", "");