const hearts = document.querySelector(".hearts");
const grid = document.querySelector(".grid");
const backButton = document.getElementById("back-button");
const progressFill = document.querySelector(".progress-fill");
let heartCount = 5;
let selectedWord = null;
let currentWordPairs = [];
let currentSetIndex = 0;
let exerciseCount = 0; // Track the number of completed exercises

// Fetch word pairs from the text file
async function fetchWords(unit) {
  const response = await fetch(`data/unit${unit}.txt`);
  const text = await response.text();
  const lines = text.split("\n").slice(1); // Skip header
  return lines.map((line) => line.split(","));
}

// Shuffle array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
    // Highlight the selected word
    div.classList.add('selected');
    selectedWord = { div, word };
  } else {
    // Check if the selected pair is correct
    const isFirstPersian = selectedWord.div.dataset.language === 'persian';
    const isSecondArabic = div.dataset.language === 'arabic';
    const isFirstArabic = selectedWord.div.dataset.language === 'arabic';
    const isSecondPersian = div.dataset.language === 'persian';

    // Ensure one Persian and one Arabic word are selected
    if ((isFirstPersian && isSecondArabic) || (isFirstArabic && isSecondPersian)) {
      // Determine the Persian and Arabic words
      const persianWord = isFirstPersian ? selectedWord.word : word;
      const arabicWord = isSecondArabic ? word : selectedWord.word;

      // Check if the Persian and Arabic words are a valid pair
      const isValidPair = currentWordPairs.some(pair => pair[0] === persianWord && pair[1] === arabicWord);

      if (isValidPair) {
        // Correct pair
        selectedWord.div.classList.add('correct');
        div.classList.add('correct');
        setTimeout(() => {
          selectedWord.div.classList.add('dimmed'); // Add dimmed class
          div.classList.add('dimmed'); // Add dimmed class
        }, 500);

        // Check if all pairs in the current set are matched
        const allMatched = Array.from(grid.querySelectorAll('.word'))
          .filter(wordElement => wordElement.dataset.language === 'persian')
          .every(persianElement => persianElement.classList.contains('correct'));

        if (allMatched) {
          // Increment exercise count and update progress bar
          exerciseCount++;
          updateProgressBar();

          // Show the next set of words
          currentSetIndex += 5;
          if (currentSetIndex < currentWordPairs.length) {
            setTimeout(() => loadWordSet(currentSetIndex), 1000);
          } else {
            alert('Congratulations! You completed the level.');
            window.location.href = 'index.html';
          }
        }
      } else {
        // Incorrect pair
        selectedWord.div.classList.add('incorrect');
        div.classList.add('incorrect');
        heartCount--;
        hearts.textContent = '❤️'.repeat(heartCount);
        if (heartCount === 0) {
          alert('You lost! Try again.');
          window.location.reload();
        }

        // Remove the red highlight after 1 second for ALL incorrect pairs
        setTimeout(() => {
          const incorrectWords = document.querySelectorAll('.word.incorrect');
          incorrectWords.forEach(wordElement => {
            wordElement.classList.remove('incorrect');
          });
        }, 1000);
      }
    } else {
      // If the user clicks two Persian or two Arabic words, ignore and deselect the first word
      selectedWord.div.classList.remove('selected');
    }

    // Deselect the selected word
    selectedWord.div.classList.remove('selected');
    selectedWord = null;
  }
}

// Update the progress bar
function updateProgressBar() {
  const progress = (exerciseCount / 7) * 100; // 7 exercises per unit
  progressFill.style.width = `${progress}%`;
}

// Load a set of 5 word pairs
function loadWordSet(startIndex) {
  grid.innerHTML = ""; // Clear the grid
  const wordSet = currentWordPairs.slice(startIndex, startIndex + 5);

  // Shuffle the Persian and Arabic words separately
  const persianWords = wordSet.map((pair) => pair[0]);
  const arabicWords = wordSet.map((pair) => pair[1]);
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

// Initialize level
async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const unit = urlParams.get("unit");
  const wordPairs = await fetchWords(unit);

  // Shuffle the word pairs
  currentWordPairs = shuffle(wordPairs);

  // Load the first set of 5 word pairs
  loadWordSet(currentSetIndex);
}

// Back button functionality
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

init();
