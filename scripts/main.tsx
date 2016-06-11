import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Contracts from "scripts/contracts"

interface IBoardData extends React.Props<void> {
    currentData: Contracts.IDay;
}

export class BoardComponent extends React.Component<any, IBoardData> {
	constructor() {
        super();
    }
	
    public componentWillMount() {
        this.state = { currentData: this.props.boardData.days[0] };
    }
    
    public componentDidMount() {
        setTimeout(() => { this.setBoardData(this.props.boardData.days[1]); }, 2500);
        setTimeout(() => { this.setBoardData(this.props.boardData.days[2]); }, 5000);
    }
    
    public setBoardData(currentData : Contracts.IDay){
        this.setState({
            currentData: currentData
        });
    }
    
	public render() {
        return (
            <div>
                <BoardColumnTable columns={this.state.currentData} />
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
        this.props.columns.columnData.forEach(function(column) {
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

//let element = document.getElementById("sprint-replay-container");
//ReactDOM.render(<BoardComponent columns = { data1 } />, element);
