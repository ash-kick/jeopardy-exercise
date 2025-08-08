// retrive category data from API if it is not cached yet
async function fetchAndCacheCategories() {
     const response = await fetch("https://rithm-jeopardy.herokuapp.com/api/categories?count=14");
     const jeopardyCategories = await response.json();
     localStorage.setItem("jeopardyCategories", JSON.stringify(jeopardyCategories));
     return jeopardyCategories;
}

// retrieve category data from cache, if not call fetch function
async function getCategories() {
     const cached = localStorage.getItem("jeopardyCategories");
     if (cached) {
          console.log("Loaded categories from cache...");
          return JSON.parse(cached);
     } else {
          console.log("Fetching categories from API...");
          return await fetchAndCacheCategories();
     }
}
getCategories();
const jeopardyCategoriesData = JSON.parse(localStorage.getItem("jeopardyCategories"));

// retrieve q&a data from API if it is not cached yet
async function fetchAndCacheQuestionsAndAnswers() {
     let questionAndAnswerData = [];
     for (const category of jeopardyCategoriesData) {
          let id = category.id;
          const response = await fetch(`https://rithm-jeopardy.herokuapp.com/api/category?id=${id}`);
          const currentCategoryQAndA = await response.json();
          questionAndAnswerData.push(currentCategoryQAndA);
     }
     localStorage.setItem("questionAndAnswerData", JSON.stringify(questionAndAnswerData));
     return questionAndAnswerData;
}

// retrieve q&a data from cache, if not call fetch function
async function getQuestionsAndAnswers() {
     const cached = localStorage.getItem("questionAndAnswerData");
     if (cached) {
          console.log("Loaded Q&A data from cache...");
          return JSON.parse(cached);
     } else {
          console.log("Fetching Q&A data from API...");
          return await fetchAndCacheQuestionsAndAnswers();
     }
}
getQuestionsAndAnswers();
const questionAndAnswerData = JSON.parse(localStorage.getItem("questionAndAnswerData"));

//generate random 6 categories
let randomCategories = [];
function getCategoryIds() {
     randomCategories = [];
     while (randomCategories.length < 6) {
          let randomIndex = Math.floor(Math.random() * 14);
          if (!randomCategories.includes(jeopardyCategoriesData[randomIndex])) {
               randomCategories.push(jeopardyCategoriesData[randomIndex]);
          }
     }
     return randomCategories;
}
getCategoryIds();

// create jeopardy title
function generateTitle() {
     const bodyElement = document.getElementsByTagName("body")[0];
     const jeopardyTitle = document.createElement("h1");
     jeopardyTitle.innerText = "Jeopardy!";
     bodyElement.appendChild(jeopardyTitle);
}
generateTitle();

//create start button
function createButton() {
     const jeopardyTitle = document.getElementsByTagName("h1")[0];
     const button = document.createElement("button");
     button.innerText = "start!";
     button.setAttribute("id", "start-button");
     button.classList = "show";
     jeopardyTitle.after(button);
}
createButton();
const startButton = document.getElementById("start-button");

//creating random category data set with titles and clues

let randomCategoryData = [];
function getCategoryData(randomCategories) {
     randomCategoryData = [];
     for (const category of randomCategories) {
          for (const questionAndAnswer of questionAndAnswerData) {
               if (category.id === questionAndAnswer.id) {
                    randomCategoryData.push({ title: questionAndAnswer.title, clues: questionAndAnswer.clues });
               }
          }
     }
     return randomCategoryData;
}
getCategoryData(randomCategories);
console.log(randomCategoryData);

// create table function
function generateTable() {
     const table = document.createElement("table");

     // table header creation
     const tableHeader = document.createElement("thead");
     const tableHeaderRow = document.createElement("tr");
     for (let k = 0; k < 6; k++) {
          const tableHeaderCell = document.createElement("th");
          const currentCategory = randomCategoryData[k].title;
          const headerText = document.createTextNode(`${currentCategory}`);
          table.appendChild(tableHeader);
          tableHeader.appendChild(tableHeaderRow);
          tableHeaderRow.appendChild(tableHeaderCell);
          tableHeaderCell.appendChild(headerText);
     }

     // table body creation
     const tableBody = document.createElement("tbody");
     for (let i = 0; i < 5; i++) {
          const row = document.createElement("tr");
          for (let j = 0; j < 6; j++) {
               const cell = document.createElement("td");
               const cellText = document.createTextNode("?");
               cell.appendChild(cellText);
               row.appendChild(cell);
               cell.setAttribute("data-row", i);
               cell.setAttribute("data-column", j);
          }
          tableBody.appendChild(row);
     }
     table.appendChild(tableBody);
     document.body.appendChild(table);

     //switch off start button, add event listener for restartGame to happen
     startButton.removeEventListener("click", generateTable);
     startButton.innerText = "restart!";
     startButton.addEventListener("click", restartGame);

     // add listener for table cell clicks
     const tableCells = document.getElementsByTagName("td");
     for (const tableCell of tableCells) {
          tableCell.addEventListener("click", clickOnTile);
     }
}
startButton.addEventListener("click", generateTable);

// function for what happens when a table cell is clicked on
function clickOnTile(event) {
     const row = parseInt(event.target.dataset.row);
     const column = parseInt(event.target.dataset.column);
     if (event.target.innerText === "?") {
          event.target.innerText = randomCategoryData[column].clues[row].question;
          event.target.setAttribute("data-state", "question");
     } else if (event.target.dataset.state === "question") {
          event.target.innerText = randomCategoryData[column].clues[row].answer;
          event.target.setAttribute("data-state", "answer");
     }
}

// wipe board and show loading spinner
function showLoadingView() {
     document.body.innerText = "";
     const spinner = document.createElement("div");
     spinner.setAttribute("id", "spinner");
     spinner.innerHTML = "Loading...";
     document.body.appendChild(spinner);
}

// remove loading spinner
function hideLoadingView() {
     const spinner = document.getElementById("spinner");
     if (spinner) spinner.remove();
}

//add restart button so it will restart each time called after game is resset
function restartButtonAdd() {
     const jeopardyTitle = document.getElementsByTagName("h1")[0];
     const newRestartButton = document.createElement("button");
     newRestartButton.innerText = "restart!";
     newRestartButton.setAttribute("id", "start-button");
     newRestartButton.classList = "show";
     jeopardyTitle.after(newRestartButton);
     newRestartButton.addEventListener("click", restartGame);
}

// if restart is clicked run all of the following functions to reset the game
async function restartGame() {
     showLoadingView();
     await getCategories();
     await getQuestionsAndAnswers();
     getCategoryIds();
     getCategoryData(randomCategories);
     hideLoadingView();
     generateTitle();
     restartButtonAdd();
     generateTable();
}
