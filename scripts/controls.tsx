import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Contracts from "scripts/contracts"

interface IMainProps extends React.Props<void> {
    boards: Contracts.IBoardDefinition[];
    intervals: number[];
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
        this.state = { board: this.props.boards[0], interval: this.props.intervals[0] };
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
            {children}
        </button>;
    }
}



let boards: Contracts.IBoardDefinition[] = [{ id: "epic", name: "Epics" }, { id: "feature", name: "Features" }, { id: "us", name: "User Stories" }];
let intervals = [1, 2, 3, 4, 5, 6];
let onPlaybackCommand = (action: string) => {
    alert(action + " clicked!");
};
let startReplay = (board: Contracts.IBoardDefinition, interval: number) => {
    alert("Selected: " + board.name + " Interval: " + interval);
};

let element = document.getElementById("sprint-replay-controls");
ReactDOM.render(<Main boards={boards} intervals={intervals} onPlaybackCommand={onPlaybackCommand} startReplay={startReplay} />, element);
