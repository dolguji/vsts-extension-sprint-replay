import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Contracts from "scripts/contracts"

interface IBoardData extends React.Props<void> {
    currentIndex: number;
}

export class BoardComponent extends React.Component<any, IBoardData> {
	constructor() {
        super();
    }
	
    public componentWillMount() {
        this.state = { currentIndex: 0 };
    }
    
    public componentDidMount() {
        console.log("componentDidMount " + this.state.currentIndex);
        this.play();
    }
    
    public componentDidUpdate() {
        console.log("componentDidUpdate " + this.state.currentIndex);
        this.play();
    }
    
    public play(){
        setTimeout(() => {
            if (this.state.currentIndex < this.props.boardData.days.length - 1) {
                var index = this.state.currentIndex;
                index++;
                this.setBoardData(index, this.props.boardData.days[index]);
                console.log("playing next day " + this.state.currentIndex);
            }
        }, 1000);
    }
    
    public setBoardData(currentIndex:number, currentData : Contracts.IDay){
        this.setState({
            currentIndex: currentIndex,
        });
    }
    
	public render() {
        return (
            <div>
                <BoardColumnTable columns={this.props.boardData.days[this.state.currentIndex]} />
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
