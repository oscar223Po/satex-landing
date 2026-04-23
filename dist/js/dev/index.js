//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/js/common/functions.js
var bodyLockStatus = true;
var bodyLockToggle = (delay = 500) => {
	if (document.documentElement.hasAttribute("data-fls-scrolllock")) bodyUnlock(delay);
	else bodyLock(delay);
};
var bodyUnlock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
		setTimeout(() => {
			lockPaddingElements.forEach((lockPaddingElement) => {
				lockPaddingElement.style.paddingRight = "";
			});
			document.body.style.paddingRight = "";
			document.documentElement.removeAttribute("data-fls-scrolllock");
		}, delay);
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
var bodyLock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
		const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
		lockPaddingElements.forEach((lockPaddingElement) => {
			lockPaddingElement.style.paddingRight = lockPaddingValue;
		});
		document.body.style.paddingRight = lockPaddingValue;
		document.documentElement.setAttribute("data-fls-scrolllock", "");
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
function getDigFromString(item) {
	return parseInt(item.replace(/[^\d]/g, ""));
}
function getDigFormat(item, sepp = " ") {
	return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${sepp}`);
}
function uniqArray(array) {
	return array.filter((item, index, self) => self.indexOf(item) === index);
}
//#endregion
//#region src/components/layout/menu/menu.js
function menuInit() {
	document.addEventListener("click", function(e) {
		if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
			bodyLockToggle();
			document.documentElement.toggleAttribute("data-fls-menu-open");
		}
	});
}
document.querySelector("[data-fls-menu]") && window.addEventListener("load", menuInit);
//#endregion
//#region src/components/layout/header/plugins/scroll/scroll.js
function headerScroll() {
	const header = document.querySelector("[data-fls-header-scroll]");
	const headerShow = header.hasAttribute("data-fls-header-scroll-show");
	const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
	const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("scroll", function(e) {
		const scrollTop = window.scrollY;
		if (document.documentElement.hasAttribute("data-fls-menu-open")) {
			scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
			return;
		}
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains("--header-scroll") && header.classList.add("--header-scroll");
			if (headerShow) {
				if (scrollTop > scrollDirection) header.classList.contains("--header-show") && header.classList.remove("--header-show");
				else !header.classList.contains("--header-show") && header.classList.add("--header-show");
				timer = setTimeout(() => {
					!header.classList.contains("--header-show") && header.classList.add("--header-show");
				}, headerShowTimer);
			}
		} else {
			header.classList.contains("--header-scroll") && header.classList.remove("--header-scroll");
			if (headerShow) header.classList.contains("--header-show") && header.classList.remove("--header-show");
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
document.querySelector("[data-fls-header-scroll]") && window.addEventListener("load", headerScroll);
//#endregion
//#region src/components/layout/dynamic/dynamic.js
var DynamicAdapt = class {
	constructor() {
		this.type = "max";
		this.init();
	}
	init() {
		this.objects = [];
		this.daClassname = "--dynamic";
		this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
		this.nodes.forEach((node) => {
			const dataArray = node.dataset.flsDynamic.trim().split(`,`);
			const object = {};
			object.element = node;
			object.parent = node.parentNode;
			object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
			const parentObjectSelector = dataArray[3] ? dataArray[3].trim() : null;
			const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
			if (objectSelector) {
				if (parentObjectSelector) `${parentObjectSelector}${objectSelector}`;
				const foundDestination = object.destinationParent.querySelector(objectSelector);
				if (foundDestination) object.destination = foundDestination;
			}
			object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
			object.place = dataArray[2] ? dataArray[2].trim() : `last`;
			object.index = this.indexInParent(object.parent, object.element);
			this.objects.push(object);
		});
		this.arraySort(this.objects);
		this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
		this.mediaQueries.forEach((media) => {
			const mediaSplit = media.split(",");
			const matchMedia = window.matchMedia(mediaSplit[0]);
			const mediaBreakpoint = mediaSplit[1];
			const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
			matchMedia.addEventListener("change", () => {
				this.mediaHandler(matchMedia, objectsFilter);
			});
			this.mediaHandler(matchMedia, objectsFilter);
		});
	}
	mediaHandler(matchMedia, objects) {
		if (matchMedia.matches) objects.forEach((object) => {
			if (object.destination) this.moveTo(object.place, object.element, object.destination);
		});
		else objects.forEach(({ parent, element, index }) => {
			if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
		});
	}
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname);
		const index = place === "last" || place === "first" ? place : parseInt(place, 10);
		if (index === "last" || index >= destination.children.length) destination.append(element);
		else if (index === "first") destination.prepend(element);
		else destination.children[index].before(element);
	}
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname);
		if (parent.children[index] !== void 0) parent.children[index].before(element);
		else parent.append(element);
	}
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}
	arraySort(arr) {
		if (this.type === "min") arr.sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) return 0;
				if (a.place === "first" || b.place === "last") return -1;
				if (a.place === "last" || b.place === "first") return 1;
				return 0;
			}
			return a.breakpoint - b.breakpoint;
		});
		else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) return 0;
					if (a.place === "first" || b.place === "last") return 1;
					if (a.place === "last" || b.place === "first") return -1;
					return 0;
				}
				return b.breakpoint - a.breakpoint;
			});
			return;
		}
	}
};
if (document.querySelector("[data-fls-dynamic]")) window.addEventListener("load", () => window.flsDynamic = new DynamicAdapt());
//#endregion
//#region src/components/layout/digcounter/digcounter.js
function digitsCounter() {
	function digitsCountersInit(digitsCountersItems) {
		let digitsCounters = digitsCountersItems ? digitsCountersItems : document.querySelectorAll("[data-fls-digcounter]");
		if (digitsCounters.length) digitsCounters.forEach((digitsCounter) => {
			if (digitsCounter.hasAttribute("data-fls-digcounter-go")) return;
			digitsCounter.setAttribute("data-fls-digcounter-go", "");
			digitsCounter.dataset.flsDigcounter = digitsCounter.innerHTML;
			digitsCounter.innerHTML = `0`;
			digitsCountersAnimate(digitsCounter);
		});
	}
	function digitsCountersAnimate(digitsCounter) {
		let startTimestamp = null;
		const duration = parseFloat(digitsCounter.dataset.flsDigcounterSpeed) ? parseFloat(digitsCounter.dataset.flsDigcounterSpeed) : 1e3;
		const raw = String(digitsCounter.dataset.flsDigcounter ?? "").trim();
		const startValue = getDigFromString(raw);
		const formatFromAttr = digitsCounter.dataset.flsDigcounterFormat;
		const useFormat = formatFromAttr !== void 0 && formatFromAttr !== "" || raw.includes(",");
		const format = formatFromAttr !== void 0 && formatFromAttr !== "" ? formatFromAttr : raw.includes(",") ? "," : " ";
		const startPosition = 0;
		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			const value = Math.floor(progress * (startPosition + startValue));
			digitsCounter.innerHTML = useFormat ? getDigFormat(value, format) : value;
			if (progress < 1) window.requestAnimationFrame(step);
			else digitsCounter.removeAttribute("data-fls-digcounter-go");
		};
		window.requestAnimationFrame(step);
	}
	function digitsCounterAction(e) {
		const entry = e.detail.entry;
		const targetElement = entry.target;
		if (targetElement.querySelectorAll("[data-fls-digcounter]").length && !targetElement.querySelectorAll("[data-fls-watcher]").length && entry.isIntersecting) digitsCountersInit(targetElement.querySelectorAll("[data-fls-digcounter]"));
	}
	document.addEventListener("watcherCallback", digitsCounterAction);
}
document.querySelector("[data-fls-digcounter]") && window.addEventListener("load", digitsCounter);
//#endregion
//#region src/components/forms/rating/rating.js
function formRating() {
	const ratings = document.querySelectorAll("[data-fls-rating]");
	if (ratings) ratings.forEach((rating) => {
		const ratingValue = +rating.dataset.flsRatingValue;
		formRatingInit(rating, +rating.dataset.flsRatingSize ? +rating.dataset.flsRatingSize : 5);
		ratingValue && formRatingSet(rating, ratingValue);
		document.addEventListener("click", formRatingAction);
	});
	function formRatingAction(e) {
		const targetElement = e.target;
		if (targetElement.closest(".rating__input")) {
			const currentElement = targetElement.closest(".rating__input");
			const ratingValue = +currentElement.value;
			const rating = currentElement.closest(".rating");
			rating.dataset.flsRating === "set" && formRatingGet(rating, ratingValue);
		}
	}
	function formRatingInit(rating, ratingSize) {
		let ratingItems = ``;
		for (let index = 0; index < ratingSize; index++) {
			index === 0 && (ratingItems += `<div class="rating__items">`);
			ratingItems += `
				<label class="rating__item">
					<input class="rating__input" type="radio" name="rating" value="${index + 1}">
				</label>`;
			index === ratingSize && (ratingItems += `</div">`);
		}
		rating.insertAdjacentHTML("beforeend", ratingItems);
	}
	function formRatingGet(rating, ratingValue) {
		formRatingSet(rating, ratingValue);
	}
	function formRatingSet(rating, value) {
		const ratingItems = rating.querySelectorAll(".rating__item");
		const resultFullItems = parseInt(value);
		const resultPartItem = value - resultFullItems;
		rating.hasAttribute("data-rating-title") && (rating.title = value);
		ratingItems.forEach((ratingItem, index) => {
			ratingItem.classList.remove("rating__item--active");
			ratingItem.querySelector("span") && ratingItems[index].querySelector("span").remove();
			if (index <= resultFullItems - 1) ratingItem.classList.add("rating__item--active");
			if (index === resultFullItems && resultPartItem) ratingItem.insertAdjacentHTML("beforeend", `<span style="width:${resultPartItem * 100}%"></span>`);
		});
	}
}
document.querySelector("[data-fls-rating]") && window.addEventListener("load", formRating);
//#endregion
//#region src/components/effects/watcher/watcher.js
var ScrollWatcher = class {
	constructor(props) {
		let defaultConfig = { logging: true };
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.hasAttribute("data-fls-watch") && this.scrollWatcherRun();
	}
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	scrollWatcherRun() {
		document.documentElement.setAttribute("data-fls-watch", "");
		this.scrollWatcherConstructor(document.querySelectorAll("[data-fls-watcher]"));
	}
	scrollWatcherConstructor(items) {
		if (items.length) uniqArray(Array.from(items).map(function(item) {
			if (item.dataset.flsWatcher === "navigator" && !item.dataset.flsWatcherThreshold) {
				let valueOfThreshold;
				if (item.clientHeight > 2) {
					valueOfThreshold = window.innerHeight / 2 / (item.clientHeight - 1);
					if (valueOfThreshold > 1) valueOfThreshold = 1;
				} else valueOfThreshold = 1;
				item.setAttribute("data-fls-watcher-threshold", valueOfThreshold.toFixed(2));
			}
			return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px"}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
		})).forEach((uniqParam) => {
			let uniqParamArray = uniqParam.split("|");
			let paramsWatch = {
				root: uniqParamArray[0],
				margin: uniqParamArray[1],
				threshold: uniqParamArray[2]
			};
			let groupItems = Array.from(items).filter(function(item) {
				let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
				let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : "0px";
				let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
				if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
			});
			let configWatcher = this.getScrollWatcherConfig(paramsWatch);
			this.scrollWatcherInit(groupItems, configWatcher);
		});
	}
	getScrollWatcherConfig(paramsWatch) {
		let configWatcher = {};
		if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
		else if (paramsWatch.root !== "null") {}
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
		if (paramsWatch.threshold === "prx") {
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1; i += .005) paramsWatch.threshold.push(i);
		} else paramsWatch.threshold = paramsWatch.threshold.split(",");
		configWatcher.threshold = paramsWatch.threshold;
		return configWatcher;
	}
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	scrollWatcherInit(items, configWatcher) {
		this.scrollWatcherCreate(configWatcher);
		items.forEach((item) => this.observer.observe(item));
	}
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) !targetElement.classList.contains("--watcher-view") && targetElement.classList.add("--watcher-view");
		else targetElement.classList.contains("--watcher-view") && targetElement.classList.remove("--watcher-view");
	}
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
	}
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		this.scrollWatcherIntersecting(entry, targetElement);
		targetElement.hasAttribute("data-fls-watcher-once") && entry.isIntersecting && this.scrollWatcherOff(targetElement, observer);
		document.dispatchEvent(new CustomEvent("watcherCallback", { detail: { entry } }));
	}
};
document.querySelector("[data-fls-watcher]") && window.addEventListener("load", () => new ScrollWatcher({}));
//#endregion
//#region src/components/effects/marquee/marquee.js
/** Same breakpoint as styles/settings.scss $tablet with @media (width < toEm($tablet)). */
var MARQUEE_TABLET_MAX_PX = 992;
var marquee = () => {
	const $marqueeArray = document.querySelectorAll("[data-fls-marquee]");
	const ATTR_NAMES = {
		wrapper: "data-fls-marquee-wrapper",
		inner: "data-fls-marquee-inner",
		item: "data-fls-marquee-item"
	};
	if (!$marqueeArray.length) return;
	const { head } = document;
	const debounce = (delay, fn) => {
		let timerId;
		return (...args) => {
			if (timerId) clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn(...args);
				timerId = null;
			}, delay);
		};
	};
	const onWindowWidthResize = (cb) => {
		if (!cb && !isFunction(cb)) return;
		let prevWidth = 0;
		const handleResize = () => {
			const currentWidth = window.innerWidth;
			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth;
				cb();
			}
		};
		window.addEventListener("resize", debounce(50, handleResize));
		handleResize();
	};
	const buildMarquee = (marqueeNode) => {
		if (!marqueeNode) return;
		const $marquee = marqueeNode;
		const $childElements = $marquee.children;
		if (!$childElements.length) return;
		Array.from($childElements).forEach(($childItem) => $childItem.setAttribute(ATTR_NAMES.item, ""));
		$marquee.innerHTML = `<div ${ATTR_NAMES.inner}>${$marquee.innerHTML}</div>`;
	};
	const getElSize = ($el, isVertical) => {
		if (isVertical) return $el.offsetHeight;
		return $el.offsetWidth;
	};
	$marqueeArray.forEach(($wrapper) => {
		if (!$wrapper) return;
		buildMarquee($wrapper);
		const $marqueeInner = $wrapper.firstElementChild;
		let cacheArray = [];
		if (!$marqueeInner) return;
		const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-fls-marquee-space"));
		const $items = $wrapper.querySelectorAll(`[${ATTR_NAMES.item}]`);
		const speed = parseFloat($wrapper.getAttribute("data-fls-marquee-speed")) / 10 || 100;
		const isMousePaused = $wrapper.hasAttribute("data-fls-marquee-pause");
		const direction = $wrapper.getAttribute("data-fls-marquee-direction");
		const isVertical = direction === "bottom" || direction === "top";
		const animName = `marqueeAnimation-${Math.floor(Math.random() * 1e7)}`;
		let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue("margin-right"));
		let spaceBetween = 0;
		let startPosition = parseFloat($wrapper.getAttribute("data-fls-marquee-start")) || 0;
		let sumSize = 0;
		let firstScreenVisibleSize = 0;
		let initialSizeElements = 0;
		let initialElementsLength = $marqueeInner.children.length;
		let index = 0;
		let counterDuplicateElements = 0;
		const initEvents = () => {
			if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);
			if (!isMousePaused) return;
			$marqueeInner.removeEventListener("mouseenter", onChangePaused);
			$marqueeInner.removeEventListener("mouseleave", onChangePaused);
			$marqueeInner.addEventListener("mouseenter", onChangePaused);
			$marqueeInner.addEventListener("mouseleave", onChangePaused);
		};
		const onChangeStartPosition = () => {
			startPosition = 0;
			$marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
			onResize();
		};
		const setBaseStyles = (firstScreenVisibleSize) => {
			let baseStyle = "display: flex; flex-wrap: nowrap;";
			if (isVertical) {
				baseStyle += `
				flex-direction: column;
				position: relative;
				will-change: transform;`;
				if (direction === "bottom") baseStyle += `top: -${firstScreenVisibleSize}px;`;
			} else {
				baseStyle += `
				position: relative;
				will-change: transform;`;
				if (direction === "right") baseStyle += `inset-inline-start: -${firstScreenVisibleSize}px;;`;
			}
			$marqueeInner.style.cssText = baseStyle;
		};
		const setdirectionAnim = (totalWidth) => {
			switch (direction) {
				case "right":
				case "bottom": return totalWidth;
				default: return -totalWidth;
			}
		};
		const animation = () => {
			const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? "Y" : "X"}(${!isVertical && window.stateRtl ? -startPosition : startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(!isVertical && window.stateRtl ? -firstScreenVisibleSize : firstScreenVisibleSize)}px);
					 }
				 }`;
			const $style = document.createElement("style");
			$style.classList.add(animName);
			$style.innerHTML = keyFrameCss;
			head.append($style);
			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + startPosition * firstScreenVisibleSize / 100) / speed}s infinite linear`;
		};
		const addDublicateElements = () => {
			sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;
			const $parentNodeWidth = getElSize($wrapper, isVertical);
			let $childrenEl = Array.from($marqueeInner.children);
			if (!$childrenEl.length) return;
			if (!cacheArray.length) cacheArray = $childrenEl.map(($item) => $item);
			else $childrenEl = [...cacheArray];
			$marqueeInner.style.display = "flex";
			if (isVertical) $marqueeInner.style.flexDirection = "column";
			$marqueeInner.innerHTML = "";
			$childrenEl.forEach(($item) => {
				$marqueeInner.append($item);
			});
			$childrenEl.forEach(($item) => {
				if (isVertical) $item.style.marginBottom = `${spaceBetween}px`;
				else {
					$item.style.marginRight = `${spaceBetween}px`;
					$item.style.flexShrink = 0;
				}
				const sizeEl = getElSize($item, isVertical);
				sumSize += sizeEl + spaceBetween;
				firstScreenVisibleSize += sizeEl + spaceBetween;
				initialSizeElements += sizeEl + spaceBetween;
				counterDuplicateElements += 1;
				return sizeEl;
			});
			const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;
			for (; sumSize < $multiplyWidth; index += 1) {
				if (!$childrenEl[index]) index = 0;
				const $cloneNone = $childrenEl[index].cloneNode(true);
				const $lastElement = $marqueeInner.children[index];
				$marqueeInner.append($cloneNone);
				sumSize += getElSize($lastElement, isVertical) + spaceBetween;
				if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
					counterDuplicateElements += 1;
					firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
				}
			}
			setBaseStyles(firstScreenVisibleSize);
		};
		const correctSpaceBetween = () => {
			if (spaceBetweenItem) {
				$items.forEach(($item) => $item.style.removeProperty("margin-right"));
				spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
				const nextBase = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
				spaceBetween = window.innerWidth < MARQUEE_TABLET_MAX_PX ? 10 : nextBase;
			}
		};
		const init = () => {
			correctSpaceBetween();
			if (!spaceBetweenItem) {
				const base = !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 20;
				spaceBetween = window.innerWidth < MARQUEE_TABLET_MAX_PX ? 10 : base;
			}
			addDublicateElements();
			animation();
			initEvents();
		};
		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove();
			init();
		};
		const onChangePaused = (e) => {
			const { type, target } = e;
			target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
		};
		onWindowWidthResize(onResize);
	});
};
marquee();
//#endregion
