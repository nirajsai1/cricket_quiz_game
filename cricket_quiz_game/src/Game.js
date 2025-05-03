import React, { useEffect, useState } from "react";
import axios from "axios";
import './Game.css';  

function Game() {
    const [alphabet,setAlphabet]=useState('');
    const [country,setCountry]=useState('');
    const [playername,setPlayername]=useState('');
    const [chance,setChance]=useState('Player1');
    const alphabets = 'abcdefghijklmnopqrstuvwyz'.split('');
    const [hg,setHg]=useState(true);
    const countries = [
        'afghanistan', 'india','bangladesh', 'england', 'india', 'australia',
        'southafrica', 'pakistan', 'india','westindies', 'srilanka', 'newzealand'
    ];
    const [count,setCount]=useState(0);
    const [scoreof1,setScoreof1]=useState(0);
    const [scoreof2,setScoreof2]=useState(0);
    const [player1Names,setPlayer1Names]=useState([]);
    const [player2Names,setPlayer2Names]=useState([]);
    useEffect(() =>
    {
        setAlphabet(alphabets[Math.floor(Math.random()*25)]);
        setCountry(countries[Math.floor(Math.random()*12)]);
    },[count])
    const validate = async() =>
    {
        let lowercasename=playername.toLowerCase();
        let pname = lowercasename.replace(/\s+/g, '');  
         await axios.post("http://127.0.0.1:5000/get_details",{country,alphabet,pname})
        .then(res => 
            {
                console.log(res.data)
                if(res.data==="success")
                {
                    if(chance==="Player1")
                    {
                        setScoreof1(scoreof1+3);
                        setChance("Player2");
                        setPlayer1Names(prev => [...prev,playername]);
                    }
                    else if(chance==="Player2")
                    {
                        setScoreof2(scoreof2+3);
                        setChance("Player1");
                        setPlayer2Names(prev => [...prev,playername]);
                    }
                    else if(chance==="Player2 can answer and get a point")
                    {
                        setScoreof2(scoreof2+1);
                        setChance("Player2");
                        setPlayer2Names(prev => [...prev,playername]);
                    }
                    else
                    {
                        setScoreof1(scoreof1+1);
                        setChance("Player1");
                        setPlayer1Names(prev => [...prev,playername]);
                    }
                    setCount(count+1);
                    setPlayername("");
                }
            })
        .catch(err =>console.log(err));
    }
    const skip = () =>
    {
        if(chance==="Player1")
            {
                setChance("Player2 can answer and get a point");
            }
            else if(chance==="Player2")
            {
                setChance("Player1 can answer and get a point");
            }
            else if(chance==="Player2 can answer and get a point")
            {
                setChance("Player2");
                setCount(count+1);
            }
            else
            {
                setChance("Player1");
                setCount(count+1);
            }
    }
    return(
        <>
        {
            hg ? 
            <div>
            <button onClick={() => setHg(false)}>Start</button>
            <h1>Rules:</h1>
            <p>1.Two Players get inputs containing Country name and Alphabet. A player name should be guessed based on the input</p>
            <p>2.One successful guess player gets 3 points and successfull guess of your oponents question player gets 1 point</p>
            <p>If player reaches more than 15 points and has a lead of more than 2 points then the player wins.</p>
            </div> : <div className="game-container">
  <p className="current-player">{chance}'s Chance</p>
  <p>Country: {country}</p>
  <p>Alphabet: {alphabet}</p>

  <input
    type="text"
    className="player-input"
    onChange={(e) => setPlayername(e.target.value)}
    value={playername}
    placeholder="Enter name"
  />

  <div style={{ textAlign: "center" }}>
    <p>Player1's Score: {scoreof1}</p>
    <p>Player2's Score: {scoreof2}</p>

    <button className="submit-button" onClick={validate}>Go!!!!</button>
    <button className="skip-button" onClick={skip}>Skip</button>
  </div>

  {/* Player Tables */}
  <div className="player-lists">
    <div className="player-list-container">
      <h3 className="list-heading">Player 1's Answers</h3>
      <table className="player-list-table">
        <tbody>
          {player1Names.map((name, index) => (
            <tr key={index}>
              <td className="list-item">{index + 1}. {name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="separator-line"></div>

    <div className="player-list-container">
      <h3 className="list-heading">Player 2's Answers</h3>
      <table className="player-list-table">
        <tbody>
          {player2Names.map((name, index) => (
            <tr key={index}>
              <td className="list-item">{index + 1}. {name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div> 
        }
        
</>
    );
}
    export default Game;
