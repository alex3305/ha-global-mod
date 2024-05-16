'use strict';

export class GlobalMod {

    static instance;

    hass;

    config;

    styles;
    
    constructor(hass) {
        GlobalMod.instance = this;

        GlobalMod.instance.hass = hass;
        GlobalMod.instance.config = GlobalMod.instance.hass.themes.themes[GlobalMod.StyleClass];
        GlobalMod.instance.styles = [];
        
        window.addEventListener('location-changed', () => GlobalMod.instance.applyStyles(), false);
        GlobalMod.instance.applyStyles();
    }

    static get ActiveClass() { return 'active'; }
    
    static get StyleClass() { return 'global-mod'; }

    static get Version() { return '0.0.4'; }

    async addStyleElement(tree, cssStyle) {
        let style;

        try {
            style = tree.querySelector(`style.${GlobalMod.StyleClass}`);
        } catch (e) { }

        if (!style) {
            style = document.createElement('style');
            
            style.classList?.add(GlobalMod.StyleClass);
            style.classList?.add(GlobalMod.ActiveClass);
            style.setAttribute('type', 'text/css');
            style.textContent = cssStyle;
            
            tree.appendChild(style);
            return style;
        }

        style.classList.add(GlobalMod.ActiveClass);
    }

    async applyStyles(styles, config) {
        for (const style of GlobalMod.instance.styles) {
            if (style) {
                style.classList.remove(GlobalMod.ActiveClass);
            }
        }

        for (const path in GlobalMod.instance.config) {
            const current = window.location.pathname.toLowerCase();

            if (current.includes(path.toLowerCase())) {
                for (const rule of GlobalMod.instance.config[path]) {
                    if (!rule.selector) {
                        throw new Error(`No rule specified for ${path}`);
                    }
                    
                    // const selector = `home-assistant$home-assistant-main$${rule.selector}`;
                    const tree = await GlobalMod.instance.selectTree(rule.selector, 1, 5);
                    const style = await GlobalMod.instance.addStyleElement(tree, rule.style);
                    GlobalMod.instance.styles.push(style);
                }
            }
        }

        for (const style of GlobalMod.instance.styles) {
            if (style && !style.classList.contains(GlobalMod.ActiveClass)) {
                style.remove();
            }
        }
    }

    async selectTree(selector, iterations, maxIterations) {
        let components = selector.split('$');
        let tree;

        try {
            for (let i = 0; i < components.length; i++) {
                if (components[i]) {
                    tree = tree ? tree.querySelector(components[i]) : 
                                document.querySelector(components[i]);

                    if (i + 1 < components.length) {
                        tree = tree.shadowRoot;
                    }
                }
            }
        } catch (e) {
            if (iterations === maxIterations) {
                throw new Error("No Element Found");
            }

            await new Promise((resolve) => setTimeout(resolve, iterations * 100));
            return await GlobalMod.instance.selectTree(selector, iterations + 1, maxIterations);
        }
        
        return tree;
    }
}

new GlobalMod(document.querySelector('home-assistant').hass);
console.info(`%c Global Mod %c ${GlobalMod.Version}`, "color:white;background:purple;", "");
