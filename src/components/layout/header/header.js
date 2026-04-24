import './header.scss'

const checkButton = document.querySelector('.form-popup__button');

checkButton.addEventListener('click', () => {
	checkButton.classList.toggle('button-form-check');
});