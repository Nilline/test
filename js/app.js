(() => {
    "use strict";
    const flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(2 == webP.height);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = true === support ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    function addLoadedClass() {
        window.addEventListener("load", (function() {
            setTimeout((function() {
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Проснулся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if ("error" !== this._dataValue) {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && 27 == e.which && "Escape" === e.code && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && 9 == e.which && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") ? true : false;
                if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Открыл попап`);
                } else this.popupLogging(`Ой ой, такого попапа нет.Проверьте корректность ввода. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрыл попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && 0 === focusedIndex) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
        }
    }
    flsModules.popup = new Popup({});
    let gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
        } else FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false
    }) {
        const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
        if (formFields.length) formFields.forEach((formField => {
            if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
        }));
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (targetElement.dataset.placeholder) targetElement.placeholder = "";
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                formValidate.removeError(targetElement);
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (targetElement.dataset.placeholder) targetElement.placeholder = targetElement.dataset.placeholder;
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                if (targetElement.hasAttribute("data-validate")) formValidate.validateInput(targetElement);
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if ("email" === formRequiredItem.dataset.required) {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function formSubmit(options = {
        validate: true
    }) {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (0 === error) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) {
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        await response.json();
                        form.classList.remove("_sending");
                        formSent(form);
                    } else {
                        alert("Ошибка");
                        form.classList.remove("_sending");
                    }
                } else if (form.hasAttribute("data-dev")) {
                    e.preventDefault();
                    formSent(form);
                }
            } else {
                e.preventDefault();
                const formError = form.querySelector("._form-error");
                if (formError && form.hasAttribute("data-goto-error")) gotoBlock(formError, true, 1e3);
            }
        }
        function formSent(form) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            setTimeout((() => {
                if (flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? flsModules.popup.open(popup) : null;
                }
            }), 0);
            formValidate.formClean(form);
            formLogging(`Форма отправлена!`);
        }
        function formLogging(message) {
            FLS(`[Формы]: ${message}`);
        }
    }
    let addWindowScrollEvent = false;
    function pageNavigation() {
        document.addEventListener("click", pageNavigationAction);
        document.addEventListener("watcherCallback", pageNavigationAction);
        function pageNavigationAction(e) {
            if ("click" === e.type) {
                const targetElement = e.target;
                if (targetElement.closest("[data-goto]")) {
                    const gotoLink = targetElement.closest("[data-goto]");
                    const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
                    const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
                    const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 1800;
                    const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
                    gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
                    e.preventDefault();
                }
            } else if ("watcherCallback" === e.type && e.detail) {
                const entry = e.detail.entry;
                const targetElement = entry.target;
                if ("navigator" === targetElement.dataset.watch) {
                    document.querySelector(`[data-goto]._navigator-active`);
                    let navigatorCurrentItem;
                    if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`); else if (targetElement.classList.length) for (let index = 0; index < targetElement.classList.length; index++) {
                        const element = targetElement.classList[index];
                        if (document.querySelector(`[data-goto=".${element}"]`)) {
                            navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                            break;
                        }
                    }
                    if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null; else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
                }
            }
        }
        if (getHash()) {
            let goToHash;
            if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`; else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
            goToHash ? gotoBlock(goToHash, true, 500, 20) : null;
        }
    }
    function headerScroll() {
        addWindowScrollEvent = true;
        const header = document.querySelector("header.header");
        const headerShow = header.hasAttribute("data-scroll-show");
        const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
        const startPoint = header.dataset.scroll ? header.dataset.scroll : header.scrollHeight;
        let scrollDirection = 0;
        let timer;
        document.addEventListener("windowScroll", (function(e) {
            const scrollTop = window.scrollY;
            clearTimeout(timer);
            if (scrollTop >= startPoint) {
                !header.classList.contains("_header-scroll") ? header.classList.add("_header-scroll") : null;
                if (headerShow) {
                    if (scrollTop > scrollDirection) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null; else !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    timer = setTimeout((() => {
                        !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    }), headerShowTimer);
                }
            } else {
                header.classList.contains("_header-scroll") ? header.classList.remove("_header-scroll") : null;
                if (headerShow) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
            }
            scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
        }));
    }
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function script_debounce(delay, fn) {
        let timerId;
        return (...args) => {
            if (timerId) clearTimeout(timerId);
            timerId = setTimeout((() => {
                fn(...args);
                timerId = null;
            }), delay);
        };
    }
    const script_onWindowResize = cb => {
        if (!cb && !isFunction(cb)) return;
        const handleResize = () => {
            cb();
        };
        window.addEventListener("resize", script_debounce(15, handleResize));
        handleResize();
    };
    function marquee() {
        const $marqueeArray = document.querySelectorAll("[data-marquee]");
        const CLASS_NAMES = {
            wrapper: "marquee-wrapper",
            inner: "marquee-inner",
            item: "marquee-item"
        };
        if (!$marqueeArray.length) return;
        const {head} = document;
        const buildMarquee = marqueeNode => {
            if (!marqueeNode) return;
            const $marquee = marqueeNode;
            const $childElements = $marquee.children;
            if (!$childElements.length) return;
            $marquee.classList.add(CLASS_NAMES.wrapper);
            Array.from($childElements).forEach(($childItem => $childItem.classList.add(CLASS_NAMES.item)));
            const htmlStructure = `<div class="${CLASS_NAMES.inner}">${$marquee.innerHTML}</div>`;
            $marquee.innerHTML = htmlStructure;
        };
        const getElSize = ($el, isVertical) => {
            if (isVertical) return $el.getBoundingClientRect().height;
            return $el.getBoundingClientRect().width;
        };
        $marqueeArray.forEach(($wrapper => {
            if (!$wrapper) return;
            buildMarquee($wrapper);
            const $marqueeInner = $wrapper.firstElementChild;
            let cacheArray = [];
            if (!$marqueeInner) return;
            const spaceBetween = parseFloat($wrapper.getAttribute("data-marquee-space")) || 30;
            const speed = parseFloat($wrapper.getAttribute("data-marquee-speed")) / 10 || 100;
            const isMousePaused = $wrapper.hasAttribute("data-marquee-pause-mouse-enter");
            const direction = $wrapper.getAttribute("data-marquee-direction");
            const isVertical = "bottom" === direction || "top" === direction;
            const animName = `marqueeAnimation-${Math.floor(1e7 * Math.random())}`;
            let sumSize = 0;
            let index = 0;
            const initEvents = () => {
                $marqueeInner.addEventListener("animationiteration", onAnimationEnd);
                if (!isMousePaused) return;
                $marqueeInner.addEventListener("mouseenter", onChangePaused);
                $marqueeInner.addEventListener("mouseleave", onChangePaused);
            };
            const setBaseStyles = maxSizeEl => {
                let baseStyle = "display: flex; flex-wrap: nowrap;";
                if (isVertical) baseStyle += `\n\t\t  \tflex-direction: column;\n\t\t\tposition: relative;\n\t\t\ttop: -${$marqueeInner.scrollHeight / 2}px`; else if ("right" === direction) baseStyle += `\n\t\t  \tposition: relative;\n\t\t\tleft: -${maxSizeEl}px;`;
                $marqueeInner.style.cssText = baseStyle;
            };
            const setdirectionAnim = totalWidth => {
                switch (direction) {
                  case "right":
                  case "bottom":
                    return totalWidth;

                  default:
                    return -totalWidth;
                }
            };
            const changeFirstToLast = () => {
                switch (direction) {
                  case "right":
                  case "bottom":
                    $marqueeInner.insertBefore($marqueeInner.lastElementChild, $marqueeInner.firstElementChild);
                    return;

                  default:
                    $marqueeInner.appendChild($marqueeInner.firstElementChild);
                }
            };
            const animation = repeat => {
                if (repeat) changeFirstToLast();
                let $elSize = 0;
                switch (direction) {
                  case "right":
                  case "bottom":
                    $elSize = getElSize($marqueeInner.lastElementChild, isVertical);
                    break;

                  default:
                    $elSize = getElSize($marqueeInner.firstElementChild, isVertical);
                }
                const totalSize = $elSize + spaceBetween;
                const $style = document.createElement("style");
                const keyFrameCss = `@keyframes ${animName} {\n\t\t\t\t\t100% {\n\t\t\t\t\t\ttransform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(totalSize)}px);\n\t\t\t\t\t}\n\t\t\t\t}`;
                $style.classList.add(animName);
                $style.innerHTML = keyFrameCss;
                head.append($style);
                $marqueeInner.style.animation = `${animName} ${totalSize / speed}s infinite linear`;
            };
            const addDublicateElements = () => {
                const $parentNodeWidth = getElSize($wrapper, isVertical);
                let $childrenEl = Array.from($marqueeInner.children);
                if (!$childrenEl.length) return;
                if (!cacheArray.length) cacheArray = $childrenEl.map(($item => $item)); else $childrenEl = [ ...cacheArray ];
                const ArraySizeElements = $childrenEl.map(($item => {
                    if (isVertical) $item.style.marginBottom = `${spaceBetween}px`; else {
                        $item.style.marginRight = `${spaceBetween}px`;
                        $item.style.flexShrink = 0;
                    }
                    return getElSize($item, isVertical);
                }));
                const maxSizeEl = Math.max(...ArraySizeElements) + spaceBetween;
                for (;sumSize < $parentNodeWidth; index += 1) {
                    if (!$childrenEl[index]) index = 0;
                    const $cloneNone = $childrenEl[index].cloneNode(true);
                    const $lastElement = $marqueeInner.children[$marqueeInner.children.length - 1];
                    $marqueeInner.append($cloneNone);
                    sumSize += getElSize($lastElement, isVertical) + spaceBetween;
                }
                setBaseStyles(maxSizeEl);
            };
            const onAnimationEnd = e => {
                const {animationName} = e;
                head.querySelector(`.${animationName}`)?.remove();
                animation("repeat");
            };
            const init = () => {
                addDublicateElements();
                animation();
                initEvents();
            };
            const onResize = () => {
                head.querySelector(`.${animName}`)?.remove();
                init();
            };
            const onChangePaused = e => {
                const {type} = e;
                e.target.style.animationPlayState = "mouseenter" === type ? "paused" : "running";
            };
            script_onWindowResize(onResize);
        }));
    }
    function gridKeywords() {
        const $wrappers = document.querySelectorAll("[data-grid-keywords-wrapper]");
        if (!$wrappers.length) return;
        const BASE_STYLES = {
            inner: `\n\t\t\toverflow: hidden;\n\t\t\tposition: relative;\n\t\t`,
            sizer: `\n\t\t\topacity: 0;\n\t\t\tvisibility: hidden;\n\t\t`,
            words: `\n\t\t\tdisplay: block;\n\t\t\tposition: absolute;\n\t\t\tleft: 0;\n\t\t\ttop: 0;\n\t\t\twhite-sapce: nowrap;\n\t\t\twidth: inherit;\n\t\t\twill-change: transform;\n\t\t\theight: 100%;\n\t\t`
        };
        const BASE_EASING = {
            easeOut: time => {
                const decelerationFactor = 2.4;
                return 1 - Math.pow(1 - time, decelerationFactor);
            },
            easeIn: time => {
                const accelerationFactor = 2.4;
                return Math.pow(time, accelerationFactor);
            },
            easeInOut: time => {
                const accelerationFactor = 2.4;
                const decelerationFactor = 2.4;
                const acceleration = Math.pow(time, accelerationFactor);
                const deceleration = 1 - Math.pow(1 - time, decelerationFactor);
                return acceleration * (1 - time) + deceleration * time;
            }
        };
        $wrappers.forEach(($wrapper => {
            if (!$wrapper) return;
            const $inner = $wrapper.querySelector("[data-grid-keywords]");
            const duration = parseFloat($wrapper.getAttribute("data-grid-keywords-speed")) || 2e3;
            const delay = parseFloat($wrapper.getAttribute("data-grid-keywords-delay")) || 500;
            const direction = $wrapper.getAttribute("data-grid-keywords-direction") || "bottom";
            const ease = $wrapper.getAttribute("data-grid-keywords-ease") || "easeOut";
            const DISTANCE = "top" === direction ? -120 : 120;
            const translateYStart = -1 * DISTANCE;
            let index = 0;
            let pause = false;
            const updateTextContent = () => {
                const $words = Array.from($inner.children);
                if (!$words.length) return;
                const $sizer = $inner.querySelector("[data-grid-keywords-sizer]");
                if ($sizer) {
                    const largestWord = $words.reduce(((largest, current) => {
                        const width = current.offsetWidth;
                        if (width > largest.width) return {
                            element: current,
                            width
                        };
                        return largest;
                    }), {
                        element: null,
                        width: 0
                    });
                    const clone = $sizer.cloneNode(true);
                    clone.removeAttribute("data-grid-keywords-sizer");
                    $inner.appendChild(clone);
                    $words.push(clone);
                    $sizer.textContent = largestWord.element.textContent;
                    $inner.style = BASE_STYLES.inner;
                    $sizer.style = BASE_STYLES.sizer;
                    $words.forEach(($word => {
                        if (!$word.hasAttribute("data-grid-keywords-sizer")) $word.style = BASE_STYLES.words;
                    }));
                    const onChangeElements = ($el, transformValue, opacityValue) => {
                        $el.style.transform = `translate3D(0,${transformValue}%,0)`;
                        $el.style.opacity = opacityValue;
                    };
                    const initAnimElement = () => {
                        if (!index) setTimeout((() => {
                            index = $words.length - 1;
                            onChangeElements($words[index], 0, 1);
                            setTimeout((() => {
                                index = 1;
                                requestAnimationFrame(step);
                            }), delay);
                        }), 0); else requestAnimationFrame(step);
                        let startTime;
                        function step(timestamp) {
                            if (!startTime) startTime = timestamp;
                            const progress = (timestamp - startTime) / duration;
                            const prevIndex = index - 1 || $words.length - 1;
                            let timeOut = null;
                            if (progress <= 1) {
                                const easedProgress = BASE_EASING[ease](progress, 1);
                                const newYPercentStart = DISTANCE * easedProgress - DISTANCE;
                                const newYPercentEnd = DISTANCE * easedProgress;
                                onChangeElements($words[index], newYPercentStart, 1 * progress);
                                onChangeElements($words[prevIndex], newYPercentEnd, 1 - 2 * progress);
                                requestAnimationFrame(step);
                            } else {
                                onChangeElements($words[index], 0, 1);
                                onChangeElements($words[prevIndex], DISTANCE, 0);
                                timeOut = setTimeout((() => {
                                    index += 1;
                                    if (index >= $words.length) index = 1;
                                    initAnimElement();
                                }), delay);
                                if (pause) clearInterval(timeOut);
                            }
                        }
                    };
                    setTimeout((() => {
                        pause = true;
                        setTimeout((() => {
                            pause = false;
                            initAnimElement();
                        }), 2500);
                    }), 4e3);
                    const init = () => {
                        $words.forEach((($item, index) => {
                            if (index) onChangeElements($item, translateYStart, 0);
                        }));
                        initAnimElement();
                    };
                    init();
                }
            };
            updateTextContent();
        }));
    }
    document.addEventListener("DOMContentLoaded", marquee);
    document.addEventListener("DOMContentLoaded", gridKeywords);
    window["FLS"] = false;
    isWebp();
    addLoadedClass();
    menuInit();
    formFieldsInit({
        viewPass: false
    });
    formSubmit();
    pageNavigation();
    headerScroll();
})();