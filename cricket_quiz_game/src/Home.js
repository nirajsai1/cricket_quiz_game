import React, { useState } from "react";
import Game from "./Game";
function Home()
{
    const [hg,setHg]=useState(false);
    return(
        <>
        <h1>Cricket Guess Game</h1>
        {
            hg ? <Game/> :
            <div>
            <button onClick={() => setHg(true)}>Start</button>
            <h1>Rules:</h1>
            <p>1.Two Players get inputs containing Country name and Alphabet. A player name should be guessed based on the input</p>
            <p>2.One successful guess player gets 3 points and successfull guess of your oponents question player gets 1 point</p>
            <p>If player reaches more than 15 points and has a lead of more than 2 points then the player wins.</p>
            </div>
        }
        </>
    );
}
export default Home;