//------------------------------------------------------------------------------------------
// Common Tab Control APIs
//------------------------------------------------------------------------------------------
var MainTab = {
    tabs: [],
    getTabs: function () {
        return this.tabs;
    },
    init: function () {
        this.tabs = document.querySelectorAll('.p-tabview-nav a[role="tab"]');
        this.tabs.forEach(a => {
            a['visit'] = false;
        });
        this.tabs[0]['visit'] = true;
        this.tabs[this.tabs.length - 1]['visit'] = true;
    },

    find: function (key) {
        let panel = document.querySelector('.p-tabview-panels div[bf-container="' + key + '"]');
        let anchor = document.querySelector('[aria-controls="' + panel.id + '"]');
        return {"anchor": anchor, "panel": panel};
    },
    hide: function (key) {
        if (top.BizFormStudio) return;
        let tab = this.find(key);
        tab.anchor.style.display = "none";
        tab.anchor['visit'] = false;
    },
    show: function (key) {
        let tab = this.find(key);
        tab.anchor.style.display = "block";
    },
    display: function (key, val) {
        if (val === true) {
            this.show(key);
        } else {
            this.hide(key);
        }
    },
    isShown: function (key) {
        let tab = this.find(key);
        return tab.anchor.style.display !== "none";
    },
    getActiveIndex: function () {
        let activeIndex = 0;
        this.tabs.forEach((a, index) => {
            if (a.ariaSelected == 'true') {
                activeIndex = index;
            }
        });
        return activeIndex;
    },
    getActivePanel: function () {
        let index = this.getActiveIndex();
        let panelId = this.tabs[index].getAttribute('aria-controls');
        return document.querySelector('#' + panelId);
    },
    getAvailablePanels: function () {
        let panels = [];
        _.forEach(this.tabs, (t) => {
            if (t.style.display != 'none') {
                let panelId = t.getAttribute('aria-controls');
                panels.push(document.querySelector('#' + panelId));
            }
        });
        return panels;
    },
    doValidation: function (panels) {
        let targetPanels = [];
        if (typeof panels !== 'undefined') {
            _.forEach(panels, (key) => {
                const t = this.find(key);
                if (t && t.anchor.style.display != 'none') {
                    targetPanels.push(t.panel);
                }
            });
        } else {
            targetPanels = this.getAvailablePanels();
        }
        const currentPanel = this.getActivePanel();
        let hasError = false;
        _.forEach(targetPanels, (panel) => {
            this.setActiveById(panel.id);
            hasError = $B.Validation.doValidation($B.storage.formId, undefined, panel, false, true, false);
            if (hasError) {
                return false;
            }
        });
        if (!hasError) {
            this.setActiveById(currentPanel.id);
        }
        return hasError;
    },
    setActiveById: function (id) {
        const anchor = document.querySelector('[aria-controls="' + id + '"]');
        if (anchor) {
            anchor.click();
        }
    },
    gotoNext: function () {
        let activeIndex = this.getActiveIndex();
        if (activeIndex + 1 < this.tabs.length) {
            for (let index = activeIndex + 1; index < this.tabs.length; index++) {
                if (this.tabs[index].style.display != 'none') {
                    this.tabs[index].click();
                    this.setVisit(index);
                    break;
                }
            }
        }
    },
    gotoPrevious: function () {
        let activeIndex = this.getActiveIndex();
        if (-1 < activeIndex - 1) {
            for (let index = activeIndex - 1; -1 < index; index--) {
                if (this.tabs[index].style.display != 'none') {
                    this.tabs[index].click();
                    this.setVisit(index);
                    break;
                }
            }
        }
    },
    getUnvisitedTabs: function () {
        return _.filter(this.tabs, a => {
            return !a['visit']
        });
    },
    setVisit: function (index) {
        this.tabs[index]['visit'] = true;
    }
};

