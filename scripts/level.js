const hearts = document.querySelector(".hearts");
const grid = document.querySelector(".grid");
let heartCount = 5;
let selectedWord = null;

// Fetch word pairs from the text file
async function fetchWords(unit) {
  const response = await fetch(`data/unit${unit}.txt`);
  const text = await response.text();
  const lines = text.split("\n").slice(1); // Skip header
  return lines.map((line) => line.split(","));
}

// Shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Create word elements
function createWordElement(word, isPersian, row) {
  const div = document.createElement("div");
  div.className = "word";
  div.textContent = word;
  div.dataset.language = isPersian ? "persian" : "arabic";
  div.dataset.word = word; // Store the word for matching
  div.style.gridColumn = isPersian ? "1" : "2"; // Assign to column 1 or 2
  div.style.gridRow = row; // Assign to the correct row
  div.addEventListener("click", () => handleWordClick(div, word));
  return div;
}

// Handle word click
function handleWordClick(div, word) {
  if (!selectedWord) {
    selectedWord = { div, word };
  } else {
    // Check if the selected pair is correct
    const isPersian = selectedWord.div.dataset.language === "persian";
    const isArabic = div.dataset.language === "arabic";
    const isCorrectPair = isPersian && isArabic;

    if (isCorrectPair) {
      // Check if the Persian and Arabic words are a valid pair
      const persianWord = selectedWord.word;
      const arabicWord = word;

      // Fetch the word pairs to validate the match
      const urlParams = new URLSearchParams(window.location.search);
      const unit = urlParams.get("unit");
      fetchWords(unit).then((wordPairs) => {
        const isValidPair = wordPairs.some(
          (pair) => pair[0] === persianWord && pair[1] === arabicWord
        );

        if (isValidPair) {
          // Correct pair
          selectedWord.div.classList.add("correct");
          div.classList.add("correct");
          setTimeout(() => {
            selectedWord.div.style.opacity = "0.5";
            div.style.opacity = "0.5";
          }, 500);
        } else {
          // Incorrect pair
          selectedWord.div.classList.add("incorrect");
          div.classList.add("incorrect");
          heartCount--;
          hearts.textContent = "❤️".repeat(heartCount);
          if (heartCount === 0) {
            alert("You lost! Try again.");
            window.location.reload();
          }
          // Remove the red highlight after 1 second
          setTimeout(() => {
            selectedWord.div.classList.remove("incorrect");
            div.classList.remove("incorrect");
          }, 1000);
        }
        selectedWord = null;
      });
    } else {
      // If the user clicks two Persian or two Arabic words, ignore
      selectedWord = null;
    }
  }
}

// Initialize level
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const unit = urlParams.get("unit");
  const wordPairs = await fetchWords(unit);

  // Separate Persian and Arabic words
  const persianWords = wordPairs.map((pair) => pair[0]);
  const arabicWords = wordPairs.map((pair) => pair[1]);

  // Shuffle the words
  const shuffledPersian = shuffle(persianWords);
  const shuffledArabic = shuffle(arabicWords);

  // Create Persian words on the left and Arabic words on the right
  shuffledPersian.forEach((word, index) => {
    const persianWordElement = createWordElement(word, true, index + 1);
    grid.appendChild(persianWordElement);
  });

  shuffledArabic.forEach((word, index) => {
    const arabicWordElement = createWordElement(word, false, index + 1);
    grid.appendChild(arabicWordElement);
  });
}

init();
