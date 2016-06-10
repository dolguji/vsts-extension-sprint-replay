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
                <div className="column-name">{this.props.column.name}</div>
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
            <div className="board-card"> 
                <div className="card-id">{this.props.card.id} </div>
                <div className="card-title">{this.props.card.title} </div>
            </div>
        )
	}
}

let data = [
    { name: 'Backlog', cards: [{id: 1, title: "apple"}, {id: 2, title: "banana"}, {id: 3, title: "orange"}, {id: 4, title: "make it better"}, {id: 5, title: "sprint replay"}]},
    { name: 'Ready', cards: [{id: 6, title: "fetch history data"}, {id: 7, title: "do card animation"}] },
    { name: 'Development',cards: [{id: 8, title: "react foundation"}] },
    { name: 'Done', cards: [{id: 9, title: "wendy is amazing"}, {id: 10, title: "hyung is also amazing"}]},
];

let element = document.getElementById("sprint-replay-container");
ReactDOM.render(<BoardComponent columns = { data } />, element);


