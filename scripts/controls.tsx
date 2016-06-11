import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Contracts from "scripts/contracts"
import {BoardComponent} from "scripts/main"

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// mocked data

let boards: Contracts.IBoardDefinition[] = [{ id: "epic", name: "Epics" }, { id: "feature", name: "Features" }, { id: "us", name: "User Stories" }];
let intervals = [1, 2, 3, 4, 5, 6];

let data1 = [
    { name: 'Backlog', cards: [{id: 1, title: "apple"}, {id: 2, title: "banana"}, {id: 3, title: "orange"}, {id: 4, title: "make it better"}, {id: 5, title: "sprint replay"}]},
    { name: 'Ready', cards: [{id: 6, title: "DTS: TFS2015: TFS add-in from TFS office integration tool download causing Excel 2016 multi-sheet opened crashes"}, {id: 7, title: "do card animation"}] },
    { name: 'Development',cards: [{id: 8, title: "react foundation"}] },
    { name: 'Done', cards: [{id: 9, title: "wendy is amazing"}, {id: 10, title: "hyung is also amazing"}]},
];

let data2 = [
    { name: 'Backlog', cards: [{id: 1, title: "apple"},  {id: 4, title: "make it better"}, {id: 5, title: "sprint replay"}]},
    { name: 'Ready', cards: [ {id: 2, title: "banana"} ] },
    { name: 'Development',cards: [{id: 6, title: "DTS: TFS2015: TFS add-in from TFS office integration tool download causing Excel 2016 multi-sheet opened crashes"}, {id: 8, title: "react foundation"}, {id: 7, title: "do card animation"}] },
    { name: 'Done', cards: [{id: 9, title: "wendy is amazing"}, {id: 10, title: "hyung is also amazing"}, {id: 3, title: "orange"}]},
];

let data3 = [
    { name: 'Backlog', cards: [ {id: 5, title: "sprint replay"}]},
    { name: 'Ready', cards: [{id: 6, title: "DTS: TFS2015: TFS add-in from TFS office integration tool download causing Excel 2016 multi-sheet opened crashes"}, {id: 2, title: "banana"} ] },
    { name: 'Development',cards: [{id: 8, title: "react foundation"}] },
    { name: 'Done', cards: [{id: 9, title: "wendy is amazing"}, {id: 10, title: "hyung is also amazing"}, {id: 3, title: "orange"}, {id: 1, title: "apple"},  {id: 4, title: "make it better"}, {id: 7, title: "do card animation"}]},
];

let data : Contracts.IData = {
    id: "board id",
    name: "User Story",
    columns: [{ id: "1", name: 'Backlog'}, { id: "2", name: 'Ready'}, { id: "3", name: 'Development'}, { id: "4", name: 'Done'}],
    lanes: null,
    days: [ { date: null, columnData: data1}, { date: null, columnData: data2}, { date: null, columnData: data3}] 
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface IMainProps extends React.Props<void> {
    boards: Contracts.IBoardDefinition[];
    intervals: number[];
    boardData: Contracts.IData;
    startReplay: (board: Contracts.IBoardDefinition, interval: number) => void;
    onPlaybackCommand?: (action: string) => void;
}

interface IMainState {
    board: Contracts.IBoardDefinition;
    interval: number;
}

class Main extends React.Component<IMainProps, IMainState> {
    constructor() {
        super();
        this.state = { board: null, interval: 1 };
    }

    public componentWillMount() {
        // Initialize the state with the first values...
        this.state = { 
            board: this.props.boards[0], 
            interval: this.props.intervals[0],
        };
    }
    
    public render(): JSX.Element {

        let startReplay = () => {
            if (this.state.board) {
                this.props.startReplay(this.state.board, this.state.interval);
            }
        };

        let onIntervalChange = (value: number) => {
            this.setState(Object["assign"]({}, this.state, { interval: value }));
        };

        let onBoardChange = (boardId: string) => {
            let board: Contracts.IBoardDefinition = null;
            for (var index = 0, len = this.props.boards.length; index < len; index++) {
                var element = this.props.boards[index];
                if (element.id === boardId) {
                    board = element;
                    break;
                }
            }
            this.setState(Object["assign"]({}, this.state, { board: board }));
        };

        return <div>
            <BoardSelector boards={this.props.boards} board={this.state.board} onChange={onBoardChange} />
            <IntervalSelector intervals={this.props.intervals} interval={this.state.interval} onChange={onIntervalChange} />
            <Button className="replay-button" icon="th" onClick={startReplay}>Replay</Button>
            <hr/>
            <PlaybackControls onCommand={this.props.onPlaybackCommand} />
            <BoardComponent boardData={this.props.boardData} />
        </div>;
    }
}


interface IBoardSelectorProps extends React.Props<void> {
    boards: Contracts.IBoardDefinition[];
    board: Contracts.IBoardDefinition;
    onChange: (boardId: string) => void;
}

interface IBoardSelectorState {
}

class BoardSelector extends React.Component<IBoardSelectorProps, IBoardSelectorState> {
    public render(): JSX.Element {
        let onSelection = (event) => {
            this.props.onChange(event.target.value);
        }

        let selectedBoardId = this.props.board ? this.props.board.id : "";

        return <div className="boards">
            <select value={selectedBoardId} onChange={onSelection}>
                { this.props.boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>) }
            </select>
        </div>;
    }
}


interface IIntervalSelectorProps extends React.Props<void> {
    intervals: number[];
    interval: number;
    onChange: (value: number) => void;
}

interface IIntervalSelectorState {
}

class IntervalSelector extends React.Component<IIntervalSelectorProps, IIntervalSelectorState> {

    private _renderOptions(interval: number): JSX.Element {
        let displayName = interval === 1 ? interval + " week" : interval + " weeks";
        return <option key={interval} value={interval}>{displayName}</option>;
    }

    public render(): JSX.Element {

        let onSelection = (event) => {
            this.props.onChange(+event.target.value);
        }

        return <div className="intervals">
            <select value={this.props.interval} onChange={onSelection}>
                { this.props.intervals.map(this._renderOptions) }
            </select>
        </div>;
    }
}


interface IPlaybackControlsProps extends React.Props<void> {
    onCommand?: (action: string) => void;
}

interface IPlaybackControlsState {

}

class PlaybackControls extends React.Component<IPlaybackControlsProps, IPlaybackControlsState> {
    public render(): JSX.Element {

        var curryClick = (action: string): () => void => {
            return () => {
                if (this.props.onCommand) {
                    this.props.onCommand(action);
                }
            }
        };

        return <div className="playback-controls">
            <Button icon="step-backward" onClick={curryClick("step-back") }>Step back</Button>
            <Button icon="play" onClick={curryClick("play") }>Play</Button>
            <Button icon="pause" onClick={curryClick("pause") }>Pause</Button>
            <Button icon="step-forward" onClick={curryClick("step-forward") }>Step forward</Button>
        </div>;
    }
}

interface IButtonProps extends React.Props<void> {
    icon: string;
    className?: string;
    onClick: () => void;
}

interface IButtonState {
}

class Button extends React.Component<IButtonProps, IButtonState> {
    public render(): JSX.Element {
        const { icon, className, onClick, children } = this.props;
        let iconElement = <i className={`icon fa fa-${icon}`} />;

        return <button className={className} onClick={onClick}>
            {iconElement}
            {children}
        </button>;
    }
}

let onPlaybackCommand = (action: string) => {
    alert(action + " clicked!");
};
let startReplay = (board: Contracts.IBoardDefinition, interval: number) => {
    alert("Selected: " + board.name + " Interval: " + interval);
};

let element = document.getElementById("sprint-replay-controls");
ReactDOM.render(<Main boards={boards} boardData={data} intervals={intervals} onPlaybackCommand={onPlaybackCommand} startReplay={startReplay} />, element);
