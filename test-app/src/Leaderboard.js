import axios from "axios"
function Leaderboard(){
    axios.get("http://localhost:8888/leaderboard").then((response)=>{
        console.log(response.data)
    })
    return (
        <div>
            <h1>Leaderboard</h1>
            {response.data.map((player,index)=>{
                return (
                    <div key={index}>
                        <p>{player.name}</p>
                        <p>{player.score}</p>
                    </div>
                )
            })}
        </div>
    )
}
export default Leaderboard;