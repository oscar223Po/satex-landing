// Підключення функціоналу "Чертоги Фрілансера"
import { FLS, getDigFormat, getDigFromString } from "@js/common/functions.js";

// Модуль анімація цифрового лічильника
export function digitsCounter() {
	// Функція ініціалізації
	function digitsCountersInit(digitsCountersItems) {
		let digitsCounters = digitsCountersItems ? digitsCountersItems : document.querySelectorAll("[data-fls-digcounter]");
		if (digitsCounters.length) {

			FLS('_FLS_DIGCOUNTER_ANIM')

			digitsCounters.forEach(digitsCounter => {
				// Обнулення
				if (digitsCounter.hasAttribute('data-fls-digcounter-go')) return;
				digitsCounter.setAttribute('data-fls-digcounter-go', '');
				digitsCounter.dataset.flsDigcounter = digitsCounter.innerHTML;
				digitsCounter.innerHTML = `0`;
				// Анімація
				digitsCountersAnimate(digitsCounter);
			});
		}
	}
	// Функція анімації
	function digitsCountersAnimate(digitsCounter) {
		let startTimestamp = null;
		const duration = parseFloat(digitsCounter.dataset.flsDigcounterSpeed) ? parseFloat(digitsCounter.dataset.flsDigcounterSpeed) : 1000;
		const raw = String(digitsCounter.dataset.flsDigcounter ?? "").trim();
		const startValue = getDigFromString(raw);
		const formatFromAttr = digitsCounter.dataset.flsDigcounterFormat;
		const useFormat =
			(formatFromAttr !== undefined && formatFromAttr !== "") || raw.includes(",");
		const format =
			formatFromAttr !== undefined && formatFromAttr !== ""
				? formatFromAttr
				: raw.includes(",")
					? ","
					: " ";
		const startPosition = 0;
		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			const value = Math.floor(progress * (startPosition + startValue));
			digitsCounter.innerHTML = useFormat ? getDigFormat(value, format) : value;
			if (progress < 1) {
				window.requestAnimationFrame(step);
			} else {
				digitsCounter.removeAttribute('data-fls-digcounter-go');
			}
		};
		window.requestAnimationFrame(step);
	}
	function digitsCounterAction(e) {
		const entry = e.detail.entry;
		const targetElement = entry.target;
		if (
			targetElement.querySelectorAll("[data-fls-digcounter]").length &&
			!targetElement.querySelectorAll("[data-fls-watcher]").length &&
			entry.isIntersecting
		) {
			digitsCountersInit(targetElement.querySelectorAll("[data-fls-digcounter]"))
		}
	}
	document.addEventListener("watcherCallback", digitsCounterAction);
}
document.querySelector("[data-fls-digcounter]") ?
	window.addEventListener('load', digitsCounter) : null
