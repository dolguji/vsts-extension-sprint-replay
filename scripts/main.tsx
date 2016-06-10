import * as React from "react";
import * as ReactDOM from "react-dom";

interface IBoardComponenetState {
    name: string;
    columns: string[];
}

export class BoardComponent extends React.Component<any, IBoardComponenetState> {
	constructor() {
        super();
        this.state = {
            name: "hyung 2",
            columns: []
        };
    }
	
    componentDidMount() {
        this.setBoardConfiguration({ name: "User Story", columns: ["New", "Active", "Resolved", "Closed"]});
    }
    
    public setBoardConfiguration(boardState: IBoardComponenetState ){
        this.setState({
            name: boardState.name,
            columns: boardState.columns
        });
    } 
    
	public render() {
        
        
        
		return <div> My name is {this.state.name}</div>;
	}
}

export class BoardColumn extends React.Component {

    constructor() {
        super();
        this.state = {
            name: "",
        };
    }
    
    public render() {
		return <div> Column name: {this.state.name}</div>;
	}
}

let data ={
    
};

let element = document.getElementById("sprint-replay-container");
ReactDOM.render(<BoardComponent data={data} />, element);


