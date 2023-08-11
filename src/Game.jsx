import { useState, useEffect, useCallback } from 'react';
import Logo from './components/logo/logo';

const Game = () => {
  // Set up state for the current word, score, and game speed
  const [word, setWord] = useState('');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Set up state for the falling word and its position
  const [fallingWord, setFallingWord] = useState({ word: '', x: 0, y: -20 });

  // Set up state for tracking the typed word count
  const [wordCount, setWordCount] = useState(0);

  // Set up state for the start time
  const [startTime, setStartTime] = useState(0);

  // Set up a function that fetches words from the server
  const fetchWords = useCallback(async () => {
    try {
      const response = await fetch('https://random-word-api.vercel.app/api?words=6');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const words = await response.json();
      console.log(words); // Print the words array to the console
      return words;
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const generateWord = useCallback(async () => {
    const randomWords = await fetchWords();
    const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
    const x = Math.floor(Math.random() * 400);
    return { word: randomWord, x, y: -20 };
  }, [fetchWords]);

  // Set up a timer that will move the word down every 50ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Move the word down
      setFallingWord(fallingWord => ({ ...fallingWord, y: fallingWord.y + speed }));

      // Check if the word has hit the bottom
      if (fallingWord.y >= 400) {
        // If the word has hit the bottom, end the game
        clearInterval(interval);
        const highScore = localStorage.getItem('highScore');
        if (score > highScore || highScore === null) {
          localStorage.setItem('highScore', score);
          const newHighScoreMsg = `Game over! New high score: ${score}`;
          alert(newHighScoreMsg);
        } else {
          const scoreMsg = `Game over! Your score is ${score}. High score: ${highScore}`;
          alert(scoreMsg);
        }
        setScore(0);
        setSpeed(1);
        generateWord().then(word => setFallingWord(word));
      }
    }, 50);

    // Clean up the timer when the component unmounts
    return () => clearInterval(interval);
  }, [fallingWord, score, speed, generateWord]);

  // Generate a new falling word when the component mounts and when the previous word has been typed
  useEffect(() => {
    if (word === fallingWord.word) {
      // If the word was typed correctly, increase the score and generate a new word
      setScore(score => score + 1);
      setSpeed(speed => speed + 0.1);
      setWord('');
      generateWord().then(word => setFallingWord(word));
    }
  }, [fallingWord.word, word, generateWord]);

  // Calculate the typing speed in words per minute
  const wordPerMinute = () => {
    const elapsedTime = (Date.now() - startTime) / 1000; // Elapsed time in seconds
    const minutes = elapsedTime / 60; // Elapsed time in minutes
    const speed = (wordCount / minutes) || 0; // Typing speed in words per minute (handles division by zero)
    return Math.round(speed);
  };

  // Update the word count and start time when a word is typed
  useEffect(() => {
    if (word !== '') {
      setWordCount(wordCount + 1);
      if (startTime === 0) {
        setStartTime(Date.now());
      }
    }
  }, [word, wordCount, startTime]);

  return (
    <div>
      <div><Logo/></div>
      <div>Score: {score}</div>
      <div>Speed: {speed.toFixed(1)}</div>
      <div>Typing Speed: {wordPerMinute()} WPM</div>
      <div style={{ position: 'relative', height: '400px', border: '1px solid black' }}>
        <div style={{ position: 'absolute', left: fallingWord.x, top: fallingWord.y }}>
          {fallingWord.word}
        </div>
      </div>
      <div>Type the word:</div>
      <input type="text" value={word} onChange={e => setWord(e.target.value)} />
    </div>
  );
};

export default Game;
