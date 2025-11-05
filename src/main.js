import { getExtendedVocabulary } from './vocabulary-data.js';

// Spanish Vocabulary Builder - 1500 Most Frequent Words
// Organized into 27 weeks (~56 words per week)

class SpanishVocabularyApp {
  constructor() {
    this.currentWeek = 1;
    this.currentWordIndex = 0;
    this.knownWords = new Set();
    this.studyWords = new Set();
    this.isRevealed = false;
    this.vocabularyData = getExtendedVocabulary();

    // Load saved progress
    this.loadProgress();

    // Initialize the app
    this.init();
  }

  init() {
    this.populateWeekSelector();
    this.bindEvents();
    this.loadWeek(this.currentWeek);
    this.updateStats();
  }

  populateWeekSelector() {
    const weekSelect = document.getElementById('week-select');
    for (let i = 1; i <= 27; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Week ${i}`;
      if (i === this.currentWeek) option.selected = true;
      weekSelect.appendChild(option);
    }
  }

  bindEvents() {
    // Week navigation
    document.getElementById('week-select').addEventListener('change', (e) => {
      this.currentWeek = parseInt(e.target.value);
      this.loadWeek(this.currentWeek);
    });

    document.getElementById('prev-week').addEventListener('click', () => {
      console.log('Previous week clicked, current week:', this.currentWeek); // Debug log
      this.previousWeek();
    });

    document.getElementById('next-week').addEventListener('click', () => {
      console.log('Next week clicked, current week:', this.currentWeek); // Debug log
      this.nextWeek();
    });

    // Flashcard click handler
    document.getElementById('flashcard').addEventListener('click', (e) => {
      // Don't flip if clicking on action buttons
      if (e.target.tagName === 'BUTTON') {
        return;
      }
      
      this.flipCard();
    });



    document.getElementById('know-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click event
      this.markAsKnown();
    });

    document.getElementById('study-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click event
      this.markForStudy();
    });

    // Word navigation
    document.getElementById('prev-word').addEventListener('click', () => {
      this.previousWord();
    });

    document.getElementById('next-word').addEventListener('click', () => {
      this.nextWord();
    });

    document.getElementById('shuffle-btn').addEventListener('click', () => {
      this.shuffleWords();
    });

    document.getElementById('reset-week').addEventListener('click', () => {
      this.resetWeek();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.flipCard();
      } else if (e.key === 'ArrowLeft') {
        this.previousWord();
      } else if (e.key === 'ArrowRight') {
        this.nextWord();
      }
    });
  }

  loadWeek(weekNumber) {
    this.currentWeek = weekNumber;
    this.currentWordIndex = 0;
    this.isRevealed = false;

    const weekWords = this.getWeekWords(weekNumber);
    this.currentWeekWords = weekWords;

    this.displayWord();
    this.updateProgress();
    this.updateStats();
    this.updateWeekNavigation();
  }

  previousWeek() {
    console.log('previousWeek called, current week:', this.currentWeek);
    if (this.currentWeek > 1) {
      this.currentWeek--;
      console.log('Moving to week:', this.currentWeek);
      document.getElementById('week-select').value = this.currentWeek;
      this.loadWeek(this.currentWeek);
    } else {
      console.log('Already at first week');
    }
  }

  nextWeek() {
    console.log('nextWeek called, current week:', this.currentWeek);
    if (this.currentWeek < 27) {
      this.currentWeek++;
      console.log('Moving to week:', this.currentWeek);
      document.getElementById('week-select').value = this.currentWeek;
      this.loadWeek(this.currentWeek);
    } else {
      console.log('Already at last week');
    }
  }

  updateWeekNavigation() {
    const prevBtn = document.getElementById('prev-week');
    const nextBtn = document.getElementById('next-week');

    prevBtn.disabled = this.currentWeek <= 1;
    nextBtn.disabled = this.currentWeek >= 27;
  }

  getWeekWords(weekNumber) {
    const startIndex = (weekNumber - 1) * 56;
    const endIndex = Math.min(startIndex + 56, this.vocabularyData.length);
    return this.vocabularyData.slice(startIndex, endIndex);
  }

  displayWord() {
    if (!this.currentWeekWords || this.currentWeekWords.length === 0) return;

    const word = this.currentWeekWords[this.currentWordIndex];
    const flashcard = document.getElementById('flashcard');

    document.getElementById('spanish-word').textContent = word.spanish;
    document.getElementById('spanish-word-back').textContent = word.spanish;
    document.getElementById('english-word').textContent = word.english;
    document.getElementById('example-sentence').textContent = word.example;
    document.getElementById('example-translation').textContent =
      word.exampleTranslation;

    // Reset card state - make sure it's showing front
    flashcard.classList.remove('flipped');
    this.isRevealed = false;

    // Update word status indicators
    this.updateWordStatus(word);
  }

  flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    this.isRevealed = flashcard.classList.contains('flipped');
  }

  updateWordStatus(word) {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('known', 'study');

    if (this.knownWords.has(word.id)) {
      flashcard.classList.add('known');
    } else if (this.studyWords.has(word.id)) {
      flashcard.classList.add('study');
    }
  }



  markAsKnown() {
    const word = this.currentWeekWords[this.currentWordIndex];
    this.knownWords.add(word.id);
    this.studyWords.delete(word.id);
    this.saveProgress();
    this.updateStats();
    this.nextWord();
  }

  markForStudy() {
    const word = this.currentWeekWords[this.currentWordIndex];
    this.studyWords.add(word.id);
    this.knownWords.delete(word.id);
    this.saveProgress();
    this.updateStats();
    this.nextWord();
  }

  nextWord() {
    if (this.currentWordIndex < this.currentWeekWords.length - 1) {
      this.currentWordIndex++;
    } else {
      this.currentWordIndex = 0;
    }
    this.displayWord();
  }

  previousWord() {
    if (this.currentWordIndex > 0) {
      this.currentWordIndex--;
    } else {
      this.currentWordIndex = this.currentWeekWords.length - 1;
    }
    this.displayWord();
  }

  shuffleWords() {
    for (let i = this.currentWeekWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentWeekWords[i], this.currentWeekWords[j]] = [
        this.currentWeekWords[j],
        this.currentWeekWords[i],
      ];
    }
    this.currentWordIndex = 0;
    this.displayWord();
  }

  resetWeek() {
    if (
      confirm(
        'Reset progress for this week? This will clear all "known" and "study" markings for this week.',
      )
    ) {
      const weekWords = this.getWeekWords(this.currentWeek);
      weekWords.forEach((word) => {
        this.knownWords.delete(word.id);
        this.studyWords.delete(word.id);
      });
      this.saveProgress();
      this.updateStats();
      this.displayWord();
    }
  }

  updateProgress() {
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');

    progressText.textContent = `Week ${this.currentWeek} of 27`;

    const progressPercentage = (this.currentWeek / 27) * 100;
    progressFill.style.width = `${progressPercentage}%`;
  }

  updateStats() {
    const wordsThisWeek = this.getWeekWords(this.currentWeek);
    const knownThisWeek = wordsThisWeek.filter((word) =>
      this.knownWords.has(word.id),
    ).length;

    document.getElementById('words-this-week').textContent =
      `${knownThisWeek}/${wordsThisWeek.length}`;
    document.getElementById('total-progress').textContent =
      `${this.knownWords.size}/1500`;
    document.getElementById('known-words').textContent = this.knownWords.size;
  }

  saveProgress() {
    const progress = {
      currentWeek: this.currentWeek,
      knownWords: Array.from(this.knownWords),
      studyWords: Array.from(this.studyWords),
    };
    localStorage.setItem('spanishVocabularyProgress', JSON.stringify(progress));
  }

  loadProgress() {
    const saved = localStorage.getItem('spanishVocabularyProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.currentWeek = progress.currentWeek || 1;
      this.knownWords = new Set(progress.knownWords || []);
      this.studyWords = new Set(progress.studyWords || []);
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SpanishVocabularyApp();
});
