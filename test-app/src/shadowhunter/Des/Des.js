import React from "react";
import "./Des.css";

export  default class Des extends React.Component {
    constructor(props){
        super(props);
        this.state  = {
            des1valeur : props.des1valeur,
            des2valeur : props.des2valeur
        }
    }



    render(){
        // des 1 à 6 face 
        // des 2 en a 4 

        return(
            <div style={{display:"flex",flexDirection:"row"}}>
                <div className="des1">
                    {this.state.des1valeur}
                </div>

                <div className="des2">
                    
                    <div className="face2">
                        {this.state.des2valeur}
                    </div>

                </div>
            </div>
        )
    }
}
