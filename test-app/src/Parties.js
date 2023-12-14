import './App.css';


import {
    useNavigate
} from "react-router-dom";

function ListePartiesBataille(){
    const navigate = useNavigate();

    return (

    <div className="listeParties">
        <div className="test1">
            <p>IdPartie</p>
            <p>nbjoueurs/joueursmax</p>
            <p>Bataille</p>
            <button>Rejoindre !</button>
        </div>
        <div className="test2">
        </div>
    </div>

    )

}

export const Parties = ()=>{
    return (<ListePartiesBataille/>);
};