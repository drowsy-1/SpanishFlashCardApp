import React, { useState, useEffect } from 'react';

const FlashcardApp = () => {
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [inclusiveMode, setInclusiveMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState(() => {
        const saved = localStorage.getItem('knownCards');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [flashcards, setFlashcards] = useState([]);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load flashcards data
    useEffect(() => {
        const loadFlashcards = async () => {
            try {
                const response = await fetch('/data/flashcards.json');
                if (!response.ok) {
                    throw new Error('Failed to load flashcards');
                }
                const data = await response.json();
                setFlashcards(data);

                // Get unique weeks from the data
                const weeks = [...new Set(data.map(card => card.week))].sort((a, b) => a - b);
                setAvailableWeeks(weeks);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadFlashcards();
    }, []);

    // Save known cards to localStorage
    useEffect(() => {
        localStorage.setItem('knownCards', JSON.stringify([...knownCards]));
    }, [knownCards]);

    // Filter cards based on selected week and toggle state
    const filteredCards = flashcards.filter(card =>
        inclusiveMode ? card.week <= selectedWeek : card.week === selectedWeek
    );

    const handleNextCard = () => {
        if (filteredCards.length > 0) {
            setIsFlipped(false);
            setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
        }
    };

    const handlePrevCard = () => {
        if (filteredCards.length > 0) {
            setIsFlipped(false);
            setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
        }
    };

    const toggleKnown = () => {
        if (filteredCards.length > 0) {
            const currentCard = filteredCards[currentCardIndex];
            const newKnownCards = new Set(knownCards);

            if (knownCards.has(currentCard.spanish)) {
                newKnownCards.delete(currentCard.spanish);
            } else {
                newKnownCards.add(currentCard.spanish);
            }

            setKnownCards(newKnownCards);
        }
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                setIsFlipped(prev => !prev);
            } else if (e.key === 'ArrowRight' || e.key === 'n') {
                handleNextCard();
            } else if (e.key === 'ArrowLeft' || e.key === 'p') {
                handlePrevCard();
            } else if (e.key === 'k') {
                toggleKnown();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentCardIndex, filteredCards.length]);

    const progressPercentage = filteredCards.length > 0
        ? (knownCards.size / filteredCards.length) * 100
        : 0;

    const currentCard = filteredCards[currentCardIndex];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
                Loading flashcards...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
                Error loading flashcards: {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex flex-col space-y-4">
                    <h1 className="text-2xl font-bold text-center text-gray-100">Spanish Flashcards</h1>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <select
                                className="w-32 bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-3 py-2"
                                value={selectedWeek}
                                onChange={(e) => {
                                    setSelectedWeek(parseInt(e.target.value));
                                    setCurrentCardIndex(0);
                                }}
                            >
                                {availableWeeks.map((week) => (
                                    <option key={week} value={week}>
                                        Week {week}
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center space-x-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inclusiveMode}
                                        onChange={(e) => setInclusiveMode(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm">Inclusive: {inclusiveMode ? 'ON' : 'OFF'}</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-300">
                            Cards: {filteredCards.length > 0 ? currentCardIndex + 1 : 0} / {filteredCards.length}
                        </div>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div
                    className={`w-full h-96 cursor-pointer bg-gray-800 border border-gray-700 rounded-lg shadow-lg transition-transform duration-700 ${
                        isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="h-full flex items-center justify-center p-6">
                        {currentCard ? (
                            !isFlipped ? (
                                <div className="text-center space-y-6">
                                    <h2 className="text-4xl font-bold text-gray-100">{currentCard.spanish}</h2>
                                    <p className="text-xl text-gray-300">{currentCard.exampleSpanish}</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 [transform:rotateY(180deg)]">
                                    <h2 className="text-4xl font-bold text-gray-100">{currentCard.english}</h2>
                                    <p className="text-xl text-gray-300">{currentCard.exampleEnglish}</p>
                                </div>
                            )
                        ) : (
                            <div className="text-center text-gray-400">
                                No cards available for this week
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={handlePrevCard}
                        disabled={!currentCard}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                    >
                        Previous
                    </button>
                    <button
                        onClick={toggleKnown}
                        disabled={!currentCard}
                        className={`px-4 py-2 rounded-md ${
                            knownCards.has(currentCard?.spanish)
                                ? "bg-green-600 hover:bg-green-500"
                                : "border border-gray-600 text-gray-300 hover:bg-gray-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {knownCards.has(currentCard?.spanish) ? "Known" : "Mark as Known"}
                    </button>
                    <button
                        onClick={handleNextCard}
                        disabled={!currentCard}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardApp;