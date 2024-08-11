import React, { useState } from "react";
import cricketers from './cricekters.json';
import './Game.css';  

function Game() {
    const [currentPlayer, setCurrentPlayer] = useState('Player1');
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const countries = [
        'Afghanistan', 'Bangladesh', 'England', 'India', 'Australia',
        'South Africa', 'Pakistan', 'West Indies', 'Sri Lanka', 'New Zealand'
    ];
    const errorMessages = [
        '',
        'You can only get a new hint once per turn.',
        'Please choose both a country and an alphabet before submitting.',
        'Make sure to enter a valid player name.',
        'This player is not from the selected country.'
    ];

    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedAlphabet, setSelectedAlphabet] = useState('');
    const [hint, setHint] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isHintGiven, setIsHintGiven] = useState(false);
    const [error, setError] = useState('');
    const [player1List, setPlayer1List] = useState([]);
    const [player2List, setPlayer2List] = useState([]);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);

    const generateHint = () => {
        if (!isHintGiven) {
            const randomAlphabet = alphabets[Math.floor(Math.random() * alphabets.length)];
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            setSelectedCountry(randomCountry);
            setSelectedAlphabet(randomAlphabet);
            setHint(`Country: ${randomCountry} Alphabet: ${randomAlphabet}`);
            setIsHintGiven(true);
            setError('');
        } else {
            setError(errorMessages[1]);
        }
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const validatePlayer = () => {
        const playerName = inputValue.trim().toLowerCase();
        const countryName = selectedCountry.toLowerCase();
        return cricketers.some(item =>
            item.player.toLowerCase() === playerName &&
            item.country.toLowerCase() === countryName
        );
    };

    const handleSubmit = () => {
        if (!isHintGiven) {
            setError(errorMessages[2]);
            return;
        }

        if (inputValue.trim() === '') {
            setError(errorMessages[3]);
            return;
        }

        if (validatePlayer()) {
            if (currentPlayer === 'Player1') {
                setPlayer1List(prevList => [...prevList, inputValue]);
                setPlayer1Score(prevScore => prevScore + 1);
                if (player1Score + 1 === 5) {
                    alert('Player1 wins!');
                    resetGame();
                    return;
                }
                setCurrentPlayer('Player2');
            } else {
                setPlayer2List(prevList => [...prevList, inputValue]);
                setPlayer2Score(prevScore => prevScore + 1);
                if (player2Score + 1 === 5) {
                    alert('Player2 wins!');
                    resetGame();
                    return;
                }
                setCurrentPlayer('Player1');
            }

            setInputValue('');
            setIsHintGiven(false);
            setHint('');
            setError('');
        } else {
            setError(errorMessages[4]);
        }
    };

    const handleSkip = () => {
        setCurrentPlayer(currentPlayer === 'Player1' ? 'Player2' : 'Player1');
        setInputValue('');
        setIsHintGiven(false);
        setHint('');
        setError('');
    };

    const resetGame = () => {
        setCurrentPlayer('Player1');
        setSelectedCountry('');
        setSelectedAlphabet('');
        setHint('');
        setInputValue('');
        setIsHintGiven(false);
        setError('');
        setPlayer1List([]);
        setPlayer2List([]);
        setPlayer1Score(0);
        setPlayer2Score(0);
    };

    return (
        <div className="game-container">
            <p className="current-player">{currentPlayer}'s Turn</p>
            <button className="hint-button" onClick={generateHint}>Get Hint</button>
            <p className="hint-text">{hint}</p>
            <input
                className="player-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter player name"
            />
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
            <button className="skip-button" onClick={handleSkip}>Skip Turn</button>
            {error && <p className="error-message">{error}</p>}
            <h3 className="scoreboard-heading">Scoreboard</h3>
            <p>Player1 Score: {player1Score}</p>
            <p>Player2 Score: {player2Score}</p>
            <div className="player-lists">
                <div className="player-list-container">
                    <h4 className="list-heading">Player1 Entries</h4>
                    <table className="player-list-table">
                        <tbody>
                            {player1List.map((player, index) => (
                                <tr key={index} className="list-item">
                                    <td>{player}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="separator-line"></div>
                <div className="player-list-container">
                    <h4 className="list-heading">Player2 Entries</h4>
                    <table className="player-list-table">
                        <tbody>
                            {player2List.map((player, index) => (
                                <tr key={index} className="list-item">
                                    <td>{player}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Game;
