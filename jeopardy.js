// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const categoriesNum = 6;
const questions = 5;
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
	let res = await axios.get('https://jservice.io/api/categories?count=100');
	let ids = res.data.map((a) => a.id);
	return _.sampleSize(ids, categoriesNum);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
	let res = await axios.get(`https://jservice.io/api/category?id=${catId}`);
	let cat = res.data;
	let totalClues = cat.clues;
	let ranClues = _.sampleSize(totalClues, questions);
	let finClues = ranClues.map((a) => ({ question: a.question, answer: a.answer, showing: null }));
	return { title: cat.title, finClues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
	let head = document.querySelector('thead');
	head.innerHTML = '';
	let row = document.createElement('tr');
	for (let i = 0; i < categoriesNum; i++) {
		let cat = document.createElement('th');
		cat.innerText = `${categories[i].title}`;
		row.appendChild(cat);
	}
	head.appendChild(row);

	let body = document.querySelector('tbody');
	body.innerHTML = '';
	for (let j = 0; j < questions; j++) {
		let entry = document.createElement('tr');
		for (let k = 0; k < categoriesNum; k++) {
			let qpair = document.createElement('td');
			qpair.setAttribute('id', `${k}-${j}`);
			qpair.innerText = '?';
			qpair.addEventListener('click', handleClick);
			entry.appendChild(qpair);
		}
		body.appendChild(entry);
	}
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
	let msg = '';
	let id = evt.target.id;
	let [ catId, clueId ] = id.split('-');
	console.log(categories);
	let clue = categories[catId].finClues[clueId];
	if (!clue.showing) {
		msg = clue.question;
		clue.showing = 'question';
	} else if (clue.showing === 'question') {
		msg = clue.answer;
		clue.showing = 'answer';
	} else {
		return;
	}
	evt.target.innerHTML = msg;
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
	let catIds = await getCategoryIds();
	categories = [];
	for (let id of catIds) {
		categories.push(await getCategory(id));
	}

	fillTable();
}

/** On click of start / restart button, set up game. */

document.getElementById('start').addEventListener('click', setupAndStart);

/** On page load, add event handler for clicking clues */
