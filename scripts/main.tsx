import * as React from "react";
import * as ReactDOM from "react-dom";

interface IBoardComponenetState {
    name: string
}

export class BoardComponent extends React.Component<any, IBoardComponenetState> {
	constructor() {
        super();
        this.state = {
            name: "patrick"
        };
    }
	
	public render() {
		return <div> My name is {this.state.name}</div>;
	}
}

let element = document.getElementById("sprint-replay-container");
let boardComponent: BoardComponent;
ReactDOM.render(<BoardComponent ref={(i) => boardComponent = i} />, element);

