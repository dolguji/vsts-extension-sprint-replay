import * as React from "react";
import * as ReactDOM from "react-dom";
interface IBoardComponenetState {
    name: string
}

export class BoardComponent extends React.Component<any, IBoardComponenetState> {
	public render() {
		return <div> I am a board component </div>;
	}
}

let element = document.getElementById("sprint-replay-container");
let boardComponent: BoardComponent;
ReactDOM.render(<BoardComponent ref={(i) => boardComponent = i} />, element);


alert("hi");