import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Contracts from "scripts/contracts"

interface IMainProps extends React.Props<void> {
    boards: Contracts.IBoardDefinition[];
    intervals: number[];
    select: (board: Contracts.IBoardDefinition) => void;
    onCommand?: (action: string) => void;
}

interface IMainState {
    board: Contracts.IBoardDefinition;
}

class Main extends React.Component<IMainProps, IMainState> {
    constructor() {
        super();
        this.state = { board: null };
    }

    public render(): JSX.Element {

        let select = () => {
            if (this.state.board) {
                this.props.select(this.state.board);
            }
        };

        return <div>
            <BoardSelector boards={this.props.boards} />
            <IntervalSelector intervals={this.props.intervals} />
            <Button icon="th" onClick={select}>Replay</Button>
            <hr/>
            <PlaybackControls onCommand={this.props.onCommand} />
        </div>;
    }
}


interface IBoardSelectorProps extends React.Props<void> {
    boards: Contracts.IBoardDefinition[];
}

interface IBoardSelectorState {
}

class BoardSelector extends React.Component<IBoardSelectorProps, IBoardSelectorState> {
    public render(): JSX.Element {
        return <div>TODO: this is the backlog selector dropdown</div>;
    }
}


interface IIntervalSelectorProps extends React.Props<void> {
    intervals: number[];
}

interface IIntervalSelectorState {
}

class IntervalSelector extends React.Component<IIntervalSelectorProps, IIntervalSelectorState> {
    public render(): JSX.Element {
        return <div>TODO: this is the interval selector dropdown</div>;
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

        return <div>
            <Button icon="step-backward" onClick={curryClick("step-back") }>Step back</Button>
            <Button icon="play" onClick={curryClick("play") }>Play</Button>
            <Button icon="pause" onClick={curryClick("pause") }>Pause</Button>
            <Button icon="step-forward" onClick={curryClick("step-forward") }>Step forward</Button>
        </div>;
    }
}


interface IButtonProps extends React.Props<void> {
    icon: string;
    classNames?: string;
    onClick: () => void;
}

interface IButtonState {
}

class Button extends React.Component<IButtonProps, IButtonState> {
    public render(): JSX.Element {
        const { icon, classNames, onClick, children } = this.props;
        let iconElement = <i className={`icon fa fa-${icon}`} />;

        return <button className={classNames} onClick={onClick}>
            {children}
        </button>;
    }
}



let boards: Contracts.IBoardDefinition[] = [{ id: "epic", name: "Epics" }, { id: "feature", name: "Features" }, { id: "us", name: "User Stories" }];
let intervals = [1, 2, 3, 4, 5, 6];
let onCommandClick = (action: string) => {
    alert(action + " clicked!");
};
let select = (board: Contracts.IBoardDefinition) => {
    alert(board.name + "selected! - get the data, and update the store");
};

let element = document.getElementById("sprint-replay-controls");
ReactDOM.render(<Main boards={boards} intervals={intervals} onCommand={onCommandClick} select={select} />, element);
