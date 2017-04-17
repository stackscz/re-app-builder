// Every language feature used in this project will get transpiled into browser-runnable code when you use `re-app-builder`

// ES6 import/export
import sum from './sum';
console.log(sum(2, 2));

// >=ES6 features, e.g. object spread.
const a = { name: 'a', color: 'blue' };
const b = {
	...a,
	name: 'b'
};

console.log(a);
console.log(b);

// generator functions
function *generatorFunction() {

	const cnt1 = yield 'Never';
	console.log(cnt1);
	const cnt2 = yield 'gonna';
	console.log(cnt2);
	const cnt3 = yield 'give';
	console.log(cnt3);

}

let cnt = 0;
const gen = generatorFunction();
let generatedLyric = gen.next();
while(!generatedLyric.done) {
	console.log(generatedLyric.value);
	generatedLyric = gen.next(cnt);
	cnt++
}

// images
import holderImagePng from './img/example.png';
import holderImageJpg from './img/example.jpg';
import holderImageGif from './img/example.gif';

// react, jsx
import React from 'react';
import ReactDOM from 'react-dom';
var Hello = ({ who }) => {
	return (
		<code>Hello, {who}!</code>
	)
};

ReactDOM.render(
	<div className="example">
		<Hello who="World" /><br />
		<Hello who="Darkness, my old friend" />
		<div className="exampleSass">
			png
			<img src={holderImagePng} alt="Some nonsense" />
		</div>
		<div className="exampleScss">
			jpg
			<img src={holderImageJpg} alt="Some nonsense" />
		</div>
		<div className="exampleCss">
			gif
			<img src={holderImageGif} alt="Some nonsense" />
		</div>
		<div className="example-image" />
	</div>,
	document.getElementById('root')
);

// sass
import './styles/index.sass';
// scss
import './styles/index.scss';
// css
import './styles/index.css';

// TODO
