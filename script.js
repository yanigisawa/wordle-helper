/*
  This is your site JavaScript code - you can add interactivity!
*/


function showResults() {
  const d = document.getElementById("wordOptionDiv");
  d.style.display = "block";
}

function filterIncludeLetters(wordList) {
  const txtInclude = document.getElementById("include");
  const letters = [...txtInclude.value];
  console.log("letters length", letters.length);
  if (letters.length === 0) {
    return wordList;
  }
  let result = [];
  for (let w of wordList) {
    let include = false;
    for (let l of letters) {
      console.log(`${w} includes ${l} => ${!w.includes(l)}`);
      if (!w.toLowerCase().includes(l.toLowerCase())) {
        include = false;
        break;
      }
      include = true;
    }
    if (include) {
      result.push(w);
    }
  }
  return result;
}

function filterExcludeLetters(wordList) {
  const txtExclude = document.getElementById("exclude");
  const letters = [...txtExclude.value];
  console.log("letters length", letters.length);
  if (letters.length === 0) {
    return wordList;
  }
  let result = [];
  for (let w of wordList) {
    let include = false;
    for (let l of letters) {
      if (w.toLowerCase().includes(l.toLowerCase())) {
        include = true;
        break;
      }
    }
    if (include === false) {
      result.push(w);
    }
  }
  return result;
}

function filterLetterPositions(wordList) {
  const firstLetter = document.getElementById("first").value;
  const secondLetter = document.getElementById("second").value;
  const thirdLetter = document.getElementById("third").value;
  const fourthLetter = document.getElementById("fourth").value;
  const fifthLetter = document.getElementById("fifth").value;
  
  if (!firstLetter && !secondLetter && !thirdLetter && !fourthLetter && !fifthLetter) {
    return wordList;
  }
  
  let results = [];
  for (let w of wordList) {
    if (firstLetter && w[0] !== firstLetter) {
      continue;
    }
    
    if (secondLetter && w[1] !== secondLetter) {
      continue;
    }
    
    if (thirdLetter && w[2] !== thirdLetter) {
      continue;
    }
    
    if (fourthLetter && w[3] !== fourthLetter) {
      continue;
    }
    
    if (fifthLetter && w[4] !== fifthLetter) {
      continue;
    }
  
    results.push(w);
  }  
  
  
  
  return results;
}

function filterIncludedLettersButNotHere(wordList) {
  const firstLetter = document.getElementById("exFirst").value;
  const secondLetter = document.getElementById("exSecond").value;
  const thirdLetter = document.getElementById("exThird").value;
  const fourthLetter = document.getElementById("exFourth").value;
  const fifthLetter = document.getElementById("exFifth").value;
  
  if (!firstLetter && !secondLetter && !thirdLetter && !fourthLetter && !fifthLetter) {
    return wordList;
  }
  
  let results = [];
  for (let w of wordList) {
    if (firstLetter && w[0] === firstLetter) {
      continue;
    }
    
    if (secondLetter && w[1] === secondLetter) {
      continue;
    }
    
    if (thirdLetter && w[2] === thirdLetter) {
      continue;
    }
    
    if (fourthLetter && w[3] === fourthLetter) {
      continue;
    }
    
    if (fifthLetter && w[4] === fifthLetter) {
      continue;
    }
  
    results.push(w);
  }  
  
  return results;
}

function randomizeResults(wordList) {
  for (let i = wordList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordList[i], wordList[j]] = [wordList[j], wordList[i]];
  }
}

function filterResults() {
  let results = filterExcludeLetters(words);
  results = filterIncludeLetters(results);
  results = filterLetterPositions(results);
  results = filterIncludedLettersButNotHere(results);
  randomizeResults(results);
  
  const pTag = document.getElementById("wordList");
  
  let wordCountSpan = document.getElementById("wordCount");
  wordCountSpan.innerHTML = `(${results.length})`;
  if (results.length === 0) {
    pTag.innerHTML = "<b>No results found. Check that are are not including and excluding the same letters</b>"
    return;
  }
  let possibleWords = [];
  for (let r of results) {
    if (possibleWords.length > 200) {
      possibleWords.push("...<br/>")
      break;
    }
    possibleWords.push(`${r.toLowerCase()} - `);
  }
  
  displayStats(results);
  
  pTag.innerHTML = possibleWords.join('');
}

function handleGroupInput(e) {
  console.log("Entered", e.target.value, " into ", e.target.id);
  filterResults();
  showResults();
}

const txtBoxes = document.getElementsByClassName("groupLetters");
if (txtBoxes) {
  for (let txt of txtBoxes) {
    txt.addEventListener('input', handleGroupInput);
  }
}

function refreshOptions() {
  filterResults();
  showResults();
}

function handleSingleInput(e) {
  console.log("Entered", e.target.value, " into ", e.target.id);
  filterResults();
  showResults();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getStartingWords() {
  let recommendedWords = [];
  let lettersUsed = [];
  for(let j=0; j < words.length; j++) {
    let randomIndex = getRandomInt(words.length - 1);
    let w = words[randomIndex];
    
    let addToList = true;
    let wordLetters = [];
    for (let i=0; i < w.length; i++) {
      if (wordLetters.includes(w[i])) {
        addToList = false;
        break;
      }
      if (lettersUsed.includes(w[i])) {
        addToList = false;
        break;
      }
      wordLetters.push(w[i]);  
    }
    
    if (addToList === true) {
      recommendedWords.push(w);
      for (let k=0; k < w.length; k++) {
        lettersUsed.push(w[k]);
      }
    }
    if (lettersUsed.length >= 25) {
      console.log("All Letters used after", j, lettersUsed);
      break;
    }
  }
  
  return recommendedWords;
}

function getWordListStats(wordList) {
  let recWords = [];
  const letters = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0,
    g: 0,
    h: 0,
    i: 0,
    j: 0,
    k: 0,
    l: 0,
    m: 0,
    n: 0,
    o: 0,
    p: 0,
    q: 0,
    r: 0,
    s: 0,
    t: 0,
    u: 0,
    v: 0,
    w: 0,
    x: 0,
    y: 0,
    z: 0
  };
  for(let j=0; j < wordList.length; j++) {
    let w = wordList[j].toLowerCase();
    let lettersUsed = [];
    for(let i=0; i < w.length; i++) {
      if (lettersUsed.includes(w[i])) { continue; }
      lettersUsed.push(w[i]);
      letters[w[i]] += 1;
    }
  }  
  
  function sortItems(a, b) {
    console.log(a, b);
    if (a[1] < b[1]) { return 1}
    if (b[1] < a[1]) { return -1};
    return 0;
  }
  return Object.keys(letters).map(l => [l, letters[l]]).sort(sortItems);
}

function displayStats(wordList) {
  const wordStatsElem = document.getElementById("wordStats");
  const wordStats = getWordListStats(wordList);
  wordStatsElem.innerHTML = "<li>" + wordStats.join("</li><li>");
}

function refreshRecommendations() {
  console.log("made it here")
  const recommendedWordList = document.getElementById("recommdedStartingWords");
  const recWords = getStartingWords();
  recommendedWordList.innerHTML = "<li>" + recWords.join("</li><li>");
  displayStats(words);
}


refreshRecommendations();

const txtLetterBoxes = document.getElementsByClassName("singleLetters");
if (txtLetterBoxes) {
  for (let txt of txtLetterBoxes) {
    txt.addEventListener('input', handleSingleInput);
  }
}