// pull all jeopardy category data
async function fetchCategories() {
     const response = await fetch("https://rithm-jeopardy.herokuapp.com/api/categories?count=14");
     console.log("Fetching categories...");
     return await response.json();
}

// pull questions & answers for all jeopardy categoy data
async function fetchQuestionsAndAnswers(categories) {
     const allQuestionsAndAnswers = [];
     for (const category of categories) {
          const response = await fetch(`https://rithm-jeopardy.herokuapp.com/api/category?id=${category.id}`);
          allQuestionsAndAnswers.push(await response.json());
     }
     console.log("Fetching questions and answers...");
     return allQuestionsAndAnswers;
}

// select 6 categories
function getRandomCategories(categories) {
     console.log("Fetching random category list...");
     const randomCategoriesList = new Set();
     while (randomCategoriesList.size < 6) randomCategoriesList.add(Math.floor(Math.random() * categories.length));
     return [...randomCategoriesList].map((i) => categories[i]);
}

// build out any category data -- in this case we want to use random categories
function buildOutCategoryData(randomCategories, allQuestionsAndAnswers) {
     const result = [];
     for (const category of randomCategories) {
          const matchingItem = allQuestionsAndAnswers.find((qa) => qa.id === category.id);
          if (matchingItem) {
               result.push({
                    title: matchingItem.title,
                    clues: matchingItem.clues,
               });
          }
     }
     console.log("Built category data count:", result.length);
     return result;
}

// create title for jeopardy page
function generateTitleOnce() {
     if (!document.querySelector("h1")) {
          const title = document.createElement("h1");
          title.innerText = "Jeopardy!";
          document.body.prepend(title);
     }
}

// check for start button, if there is none, create one!
function checkStartButton() {
     let button = document.getElementById("start-button");
     if (!button) {
          button = document.createElement("button");
          button.id = "start-button";
          button.className = "show";
          button.textContent = "start!";
          const h1 = document.querySelector("h1");
          h1.after(button);
     }
     console.log("Generating start button");
     return button;
}

// show loading view
function showLoadingView() {
     let spinner = document.getElementById("spinner");
     if (!spinner) {
          spinner = document.createElement("div");
          spinner.id = "spinner";
          spinner.textContent = "Loading...";
          document.body.appendChild(spinner);
     }
}

// hide loading view
function hideLoadingView() {
     const spinner = document.getElementById("spinner");
     if (spinner) spinner.remove();
}

// clear board action
function clearBoard() {
     const oldTable = document.querySelector("table");
     if (oldTable) oldTable.remove();
}

// generate table for jeopardy data to exist in
function generateTable(randomCategoryData, startButton) {
     clearBoard();
     const table = document.createElement("table");

     // table header creation
     const thead = document.createElement("thead");
     const tr = document.createElement("tr");
     for (let k = 0; k < randomCategoryData.length; k++) {
          const th = document.createElement("th");
          th.textContent = randomCategoryData[k].title;
          tr.appendChild(th);
     }
     thead.appendChild(tr);
     table.appendChild(thead);

     // table body creation
     const tbody = document.createElement("tbody");
     for (let i = 0; i < 5; i++) {
          const row = document.createElement("tr");
          for (let j = 0; j < 6; j++) {
               const cell = document.createElement("td");
               cell.textContent = "?";
               cell.dataset.row = i;
               cell.dataset.column = j;
               cell.addEventListener("click", (event) => clickOnTile(event, randomCategoryData));
               row.appendChild(cell);
          }
          tbody.appendChild(row);
     }

     table.appendChild(tbody);
     document.body.appendChild(table);

     // update start button text to restart
     startButton.textContent = "restart!";
}

function clickOnTile(event, randomCategoryData) {
     const row = parseInt(event.target.dataset.row);
     const column = parseInt(event.target.dataset.column);
     const clue = randomCategoryData[column].clues[row];

     if (event.target.textContent === "?") {
          event.target.textContent = clue.question;
          event.target.dataset.state = "question";
     } else if (event.target.dataset.state === "question") {
          event.target.textContent = clue.answer;
          event.target.dataset.state = "answer";
     }
}

// adding set up and start function that calls all other functions
async function setUpAndStart() {
     try {
          showLoadingView();

          const categories = await fetchCategories();
          const allQuestionsAndAnswers = await fetchQuestionsAndAnswers(categories);
          const randomCategories = getRandomCategories(categories);
          const randomCategoryData = buildOutCategoryData(randomCategories, allQuestionsAndAnswers);

          const startButton = checkStartButton();
          generateTable(randomCategoryData, startButton);
     } catch (err) {
          console.error(err);
          alert("Error loading game data. Please try again!");
     } finally {
          hideLoadingView();
     }
}

generateTitleOnce();
const startButton = checkStartButton();
startButton.onclick = setUpAndStart;
