/*
Документація по роботі у шаблоні: 
Документація слайдера: https://swiperjs.com/
Сніппет(HTML): swiper
*/

// Підключаємо слайдер Swiper з node_modules
// При необхідності підключаємо додаткові модулі слайдера, вказуючи їх у {} через кому
// Приклад: { Navigation, Autoplay }
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'
/*
Основні модулі слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Детальніше дивись https://swiperjs.com/
*/

// Стилі Swiper
// Підключення базових стилів
import "./slider.scss"
// Fade: без цього неактивні слайди з opacity: 0 ловлять hover/клік поверх активного (pointer-events)
import "swiper/css/effect-fade"
// Повний набір стилів з node_modules
// import 'swiper/css/bundle';

// Ініціалізація слайдерів
function initSliders() {
	// Список слайдерів
	// Перевіряємо, чи є слайдер на сторінці
	if (document.querySelector('[data-fls-slider]')) { // <- Вказуємо склас потрібного слайдера
		// Створюємо слайдер
		new Swiper('[data-fls-slider]', { // <- Вказуємо склас потрібного слайдера
			// Підключаємо модулі слайдера
			// для конкретного випадку
			modules: [Navigation, Pagination],
			observer: true,
			observeParents: true,
			slidesPerView: 1,
			spaceBetween: 25,
			autoHeight: true,
			speed: 500,
			loop: true,
			// Лише кнопки навігації — без свайпу / перетягування мишею
			allowTouchMove: false,
			simulateTouch: false,
			//preloadImages: false,
			//lazy: true,

			// Ефекти
			/*
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			*/

			// Пагінація
			pagination: {
				el: '.case__dotts',
				clickable: true,
			},

			// Скроллбар
			/*
			scrollbar: {
				el: '.swiper-scrollbar',
				draggable: true,
			},
			*/

			// Кнопки "вліво/вправо"
			navigation: {
				prevEl: '.controls-case__arrow--prev',
				nextEl: '.controls-case__arrow--next',
			},
			// Брейкпоінти
			breakpoints: {
				320: {
					allowTouchMove: true,
					simulateTouch: true,
				},
				480: {
					allowTouchMove: false,
					simulateTouch: false,
				}
			},
			// Події
			on: {

			}
		});
	}
}
document.querySelector('[data-fls-slider]') ?
	window.addEventListener("load", initSliders) : null