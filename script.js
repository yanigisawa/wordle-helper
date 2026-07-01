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

const INITIAL_LIMIT = 50;
const MAX_LIMIT = 200;
let lastFilteredResults = [];
let wordListExpanded = false;

function renderWordList(results, expanded) {
  const pTag = document.getElementById("wordList");
  if (results.length === 0) {
    pTag.innerHTML = "<b>No results found. Check that are are not including and excluding the same letters</b>"
    return;
  }

  const limit = expanded ? MAX_LIMIT : INITIAL_LIMIT;
  let possibleWords = [];
  for (let r of results) {
    if (possibleWords.length >= limit) {
      break;
    }
    possibleWords.push(`${r.toLowerCase()} - `);
  }

  let html = possibleWords.join('');
  if (results.length > INITIAL_LIMIT) {
    if (expanded) {
      if (results.length > MAX_LIMIT) {
        html += "...";
      }
      html += `<br/><a href="#" id="wordListToggle">Show less</a>`;
    } else {
      html += `<br/><a href="#" id="wordListToggle">Show all</a>`;
    }
  }

  pTag.innerHTML = html;

  const toggle = document.getElementById("wordListToggle");
  if (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      wordListExpanded = !wordListExpanded;
      renderWordList(lastFilteredResults, wordListExpanded);
    });
  }
}

function filterResults() {
  let results = filterExcludeLetters(words);
  results = filterIncludeLetters(results);
  results = filterLetterPositions(results);
  results = filterIncludedLettersButNotHere(results);
  randomizeResults(results);

  lastFilteredResults = results;
  wordListExpanded = false;

  let wordCountSpan = document.getElementById("wordCount");
  wordCountSpan.innerHTML = `(${results.length})`;

  renderWordList(results, wordListExpanded);

  if (results.length > 0) {
    displayStats(results);
  }
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
  if (e.target.value.length === 1) {
    const next = e.target.nextElementSibling;
    if (next) {
      next.focus();
      next.select();
    }
  }
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

function getKnownLetters() {
  const knownLetters = [];
  const inputIds = ["include", "first", "second", "third", "fourth", "fifth",
                    "exFirst", "exSecond", "exThird", "exFourth", "exFifth"];
  for (let id of inputIds) {
    for (let l of document.getElementById(id).value) {
      knownLetters.push(l.toLowerCase());
    }
  }
  return knownLetters;
}

function displayStats(wordList) {
  const wordStatsElem = document.getElementById("wordStats");
  const knownLetters = getKnownLetters();
  const wordStats = getWordListStats(wordList).filter(s => !knownLetters.includes(s[0]));
  wordStatsElem.innerHTML = "<li>" + wordStats.join("</li><li>");
}


displayStats(words);

const txtLetterBoxes = document.getElementsByClassName("singleLetters");
if (txtLetterBoxes) {
  for (let txt of txtLetterBoxes) {
    txt.addEventListener('input', handleSingleInput);
  }
}