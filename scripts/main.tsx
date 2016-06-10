import * as React from "react";
import * as ReactDOM from "react-dom";

interface IBoardComponenetState {
    name: string;
}

export class BoardComponent extends React.Component<any, IBoardComponenetState> {
	constructor() {
        super();
        this.state = {
            name: "hyung 2",
        };
    }
	
    // componentDidMount() {
    //     this.setBoardConfiguration({ name: "User Story", columns: ["New", "Active", "Resolved", "Closed"]});
    // }
    // 
    // public setBoardConfiguration(boardState: IBoardComponenetState ){
    //     this.setState({
    //         name: boardState.name,
    //         columns: boardState.columns
    //     });
    // } 
    
	public render() {
        return (
            <div>
                <div> board name: {this.state.name} </div>            
                <BoardColumnTable columns={this.props.columns} />
            </div>
        );
	}
}

interface IBoardColumn extends React.Props<void> {
}

export class BoardColumnTable extends React.Component<any, IBoardColumn[]> {
    
    constructor() {
        super();
    }
    
    public render() {
        var columns = [];
        this.props.columns.forEach(function(column) {
            columns.push(<BoardColumn column={column} key={column.name}/>);
        });
        
        return (
            <div>
                <div>{columns}</div>
            </div>
        );
    }
}

export class BoardColumn extends React.Component<any, IBoardColumn>  {
    constructor() {
        super();
    }

    public render() {
        var cards = [];
        this.props.column.cards.forEach(function(card) {
            cards.push(<Card card={card} key={card.id}/>);
        });
		return (
            <div className="board-column"> 
                <div>{this.props.column.name}</div>
                <div>{cards}</div>
            </div>
        );
	}
}

interface ICard extends React.Props<void> {
}

export class Card extends React.Component<any, ICard>  {
    constructor() {
        super();
    }

    public render() {
		return (
            <div> 
                id is {this.props.card.id} and title is {this.props.card.title}
            </div>
        )
	}
}

let data = [
    { name: 'Backlog', cards: [{id: 1, title: "card1"}, {id: 2, title: "card2"}]},
    { name: 'Ready', cards: [{id: 3, title: "card3"}, {id: 4, title: "card4"}] },
    { name: 'Development',cards: [{id: 5, title: "card5"}] },
    { name: 'Done', cards: [{id: 6, title: "card6"}]},
];

let element = document.getElementById("sprint-replay-container");
ReactDOM.render(<BoardComponent columns = { data } />, element);


