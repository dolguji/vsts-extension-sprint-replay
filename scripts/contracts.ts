export interface IRef {
    id: string;
    name: string;
}

/** Data representing the cards / work items */
export interface ICard {
    id: number;
    fields: { [referenceName: string]: any };
    //getFieldValue?: (referenceName: string) => any;
}

/** Data representing the cards on a given date */
export interface IDay {
    date: Date;
    cards: ICard[];
}

/** Data representing the board definition */
export interface IBoardDefinition extends IRef {
}

export interface IBoards {
    boards: IBoardDefinition[];
}

/** Data representing the board column definition */
export interface IColumnDefinition extends IRef {
}

/** Data representing the board land definition */
export interface ILaneDefinition extends IRef {
}


/** Main data representing the board with card values ... */
export interface IData extends IRef {
    columns: IColumnDefinition[];
    lanes: ILaneDefinition[];
    days: IDay[];
}
