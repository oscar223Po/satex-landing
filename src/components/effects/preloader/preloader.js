import "./preloader.scss"
// У рядках шаблону @img не збирається — потрібен імпорт, інакше в проді src лишається "@img/..."
import preloaderLogoUrl from "@img/logo.svg?url"

function preloader() {
	const html = document.documentElement
	const modeEl = document.querySelector("[data-fls-preloader]")

	if (!modeEl) {
		finishPreloader(html)
		return
	}

	const once = modeEl.getAttribute("data-fls-preloader") === "true"
	if (once && localStorage.getItem(location.href)) {
		finishPreloader(html)
		return
	}

	const markup = `
		<div class="fls-preloader">
			<div class="fls-preloader__body">
				<img class="fls-preloader__logo" src="${preloaderLogoUrl}" alt="Satex" width="96" height="26" decoding="async">
			</div>
		</div>`
	document.body.insertAdjacentHTML("beforeend", markup)

	html.setAttribute("data-fls-preloader-loading", "")
	html.setAttribute("data-fls-scrolllock", "")

	const onWindowLoad = () => {
		if (once) {
			localStorage.setItem(location.href, "preloaded")
		}
		finishPreloader(html)
	}

	if (document.readyState === "complete") {
		onWindowLoad()
	} else {
		window.addEventListener("load", onWindowLoad, { once: true })
	}
}

function finishPreloader(html) {
	html.setAttribute("data-fls-preloader-loaded", "")
	html.removeAttribute("data-fls-preloader-loading")
	html.removeAttribute("data-fls-scrolllock")
	html.setAttribute("data-fls-loaded", "")
}

document.addEventListener("DOMContentLoaded", preloader)
