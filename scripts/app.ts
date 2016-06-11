import Q = require("q");

import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import VSS_WebApi = require("VSS/WebApi/RestClient");

import VSS_Service = require("VSS/Service");
import VSS_Auth = require("VSS/Authentication/Services");

import Client_Contracts = require("scripts/contracts");

import {msengToken} from "scripts/secret"


export interface IWorkItem extends TFS_Wit_Contracts.WorkItem {
    asOf: Date;
}

export var defaultFields = ["System.Id","System.WorkItemType","System.Title","System.AssignedTo","System.BoardColumn"];

export interface IDataService{
     getBoards(): IPromise<Client_Contracts.IBoards>;
     getPayload(boardName: string, numberDaysFromToday: number): IPromise<Client_Contracts.IData>;
}

export class DataService {
    private _dataProvider: IDataProvider;
    constructor(dataProvider: IDataProvider) {
        this._dataProvider = dataProvider;
    }
    
    public getBoards(): IPromise<Client_Contracts.IBoards> {
        var defer = Q.defer<Client_Contracts.IBoards>();
        var promise = this._dataProvider.getBoards().then((value: Work_Contracts.BoardReference[]) => {
            var result: Client_Contracts.IBoards = {
                boards: []
            }
            for (var i=0; i < value.length; i++) {
                var board = value[i];
                var boardDef = {
                    id: board.id,
                    name: board.name
                }
                result.boards.push(boardDef);
            }
            defer.resolve(result);
        });
        return defer.promise;        
    }
    
    public getPayload(boardName: string, numberDaysFromToday: number): IPromise<Client_Contracts.IData> {
        var defer = Q.defer<Client_Contracts.IData>();
        var column: Client_Contracts.IColumnDefinition[] =[];
        var lanes: Client_Contracts.ILaneDefinition[] =[];
        var days: Client_Contracts.IDay[] =[];
        
        var result: Client_Contracts.IData = {
            columns: column,
            lanes: lanes,
            days: days,
            id: boardName,
            name: boardName,
        }
            
        var errorCallback = (err?: any) => {
            console.log(err);
        };
    
        this._dataProvider.getBoard(boardName).then((board: Work_Contracts.Board) => {
            for (var i=0; i < board.columns.length; i++) {
                var column = board.columns[i];
                var columnDef = {
                    id: column.id,
                    name: column.name
                }
                result.columns.push(columnDef);
            }
            
            for (var i=0; i < board.rows.length; i++) {
                var row = board.rows[i];
                var columnDef = {
                    id: row.id,
                    name: row.name
                }
                result.lanes.push(columnDef);
            }
            
            var allowedMappings = board.allowedMappings["Incoming"];
            var workItemTypes = [];
            for (var prop in allowedMappings) {
                workItemTypes.push(prop);
            }
            var boardColumnFieldName = board.fields.columnField.referenceName;
            defaultFields.push(boardColumnFieldName);
            var promises = [];

            while (numberDaysFromToday >= 0) {
                var date = this.getPreviousDate(numberDaysFromToday);
                promises.push(this.getWorkItemsByDay(workItemTypes, [], date, boardColumnFieldName));
                numberDaysFromToday--;
            }
            //  => promiseStates.map(state => state.value)
            Q.allSettled<IWorkItem[]>(promises).then((promiseStates: Q.PromiseState<IWorkItem[]>[]) => {
                for (var i=0; i < promiseStates.length; i++) {
                    var promiseState = promiseStates[i];
                    var state = promiseState.state;
                    var workItems: IWorkItem[] = promiseState.value;
                    var date = workItems[0].asOf;
                    
                    var columnData: Client_Contracts.IColumnData[] = []
                    for (var i=0; i < result.columns.length; i++) {
                        var column = result.columns[i];
                        var itemsForColumn = workItems.filter((value, index) => value.fields["System.BoardColumn"] == column);
                        var cards: Client_Contracts.ICard[] = [];
                        for (var i=0; i < itemsForColumn.length; i++) {
                            var item = itemsForColumn[i];
                            var card = {
                                id: item.id,
                                title: item.fields["System.Title"],
                                fields: item.fields
                            }
                            cards.push(card);
                        }
                        
                        var columnDate: Client_Contracts.IColumnData = {
                            name: column.name,
                            cards: cards,
                        };
                        
                        columnData.push(columnDate);
                    }
                    
                    var dayObject: Client_Contracts.IDay = {
                        date: date,
                        columnData: columnData
                    };  
                    result.days.push(dayObject);                  
                }
                defer.resolve(result);
            });
        }, errorCallback);
        
        return defer.promise; 
    }
    
    private getWorkItemsByDay(workItemTypes: string[], columnNames: string[], date: Date, boardColumnFieldName: string): IPromise<IWorkItem[]> {
        var dateString = this.getDate(date);
        return this._dataProvider.queryByWiql(workItemTypes, columnNames, dateString, boardColumnFieldName).then((result: TFS_Wit_Contracts.WorkItemQueryResult) => {
            var ids = result.workItems.map((value, index) => value.id);
            return this._dataProvider.getWorkItems(ids, defaultFields, date)
        });
    }
    
    // private getInProgressColumnNames(boardColumns: Work_Contracts.BoardColumn[]): string[] {
    //     var columnNames = [];
    //     for (var i=0; i < boardColumns.length; i++) {
    //         var type = boardColumns[i].columnType;
    //         if (type == Work_Contracts.BoardColumnType.InProgress) {
    //             columnNames.push(boardColumns[i].name);
    //         }
    //     }
    //     return columnNames;
    // }
    
    private getDate(dateObj: Date): string {
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var newdate = year + "/" + month + "/" + day;
        return newdate;
    }
    
    private getPreviousDate(days: number): Date {
        var dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - days);
        return dateObj;
    }
}


export interface IDataProvider{
     getBoard(board: string): IPromise<Work_Contracts.Board>;
     getBoards(): IPromise<Work_Contracts.BoardReference[]>;
     queryByWiql(workItemTypes: string[], columnNames: string[], date: string, boardColumnFieldName?: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult>;
     getPayload(boardName: string): IPromise<IWorkItem[]>;
     getWorkItems(workItemIds: number[], fields?: string[], asOf?: Date): IPromise<IWorkItem[]>;
}

export abstract class BaseDataProvider 
{
    protected _teamContext: TFS_Core_Contracts.TeamContext;
    protected getBoardItems(workItemTypes: string[], columnNames: string[], date: string, boardColumnFieldName: string):any{
         var queryBuilder = "SELECT [System.Id],[System.WorkItemType],[System.Title],[System.State] FROM WorkItems WHERE [System.TeamProject] = '" + this._teamContext.project + "'";
        
        for (var i=0; i < workItemTypes.length; i++) {
            if (i == 0) {
                queryBuilder += " AND ([System.WorkItemType] = '" + workItemTypes[i] + "'";
            }
            else {
                queryBuilder += " OR [System.WorkItemType] = '" + workItemTypes[i] + "'";
            }
        }
        // for (var i=0; i < columnNames.length; i++) {
        //     if (i == 0) {
        //         queryBuilder += " AND [System.BoardColumn] = '" + columnNames[i] + "'";
        //     }
        //     else {
        //         queryBuilder += " OR [System.BoardColumn] = '" + columnNames[i] + "'";
        //     }
        // }
        queryBuilder += ")";
        queryBuilder += " AND [" + boardColumnFieldName + "] <> ''";
        queryBuilder += " AsOf '" + date + "' ORDER BY [System.ChangedDate] DESC";
        
        var wiql = {
            query: queryBuilder
        }    
        return wiql;
    }
}

export class DataProvider extends BaseDataProvider implements IDataProvider{

    constructor() { 
        super();
        this._teamContext = this.getTeamContext();
    }
    
    public getPayload(boardName: string, numberDaysFromToday?: number): IPromise<TFS_Wit_Contracts.WorkItem[]> {
        return null;
    }
    
    public queryByWiql(workItemTypes: string[], columnNames: string[], date: string, boardColumnFieldName?: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult> {
        var wiql = this.getBoardItems(workItemTypes, columnNames, date, boardColumnFieldName);
        var witClient = TFS_Wit_Client.getClient();
        return witClient.queryByWiql(wiql, this._teamContext.projectId, this._teamContext.teamId);
    }
    
    public getWorkItems(workItemIds: number[], fields?: string[], asOf?: Date): IPromise<IWorkItem[]> {
        var defer = Q.defer<IWorkItem[]>();
        var result: IWorkItem[] = [];
        var witClient = TFS_Wit_Client.getClient();
        witClient.getWorkItems(workItemIds, fields, asOf).then((workItems: TFS_Wit_Contracts.WorkItem[]) => {
            for (var i = 0; i<workItems.length;i++) {
                var item = workItems[i] as IWorkItem;
                item.asOf = asOf;
                result.push(item);
            }
            defer.resolve(result);
        });
        return defer.promise;
    }   

    public getBoard(board: string): IPromise<Work_Contracts.Board> {
        var restClient = RestClient.getClient();
        return restClient.getBoard(this.getTeamContext(), board);
    }

    public getBoards(): IPromise<Work_Contracts.BoardReference[]> {
        var restClient = RestClient.getClient();
        return restClient.getBoards(this.getTeamContext());        
    }
    
    private getTeamContext(): TFS_Core_Contracts.TeamContext {
        var context = VSS.getWebContext();
        return {
            projectId: context.project.id,
            project: context.project.name,
            teamId: context.team.id,
            team: context.team.name
        }
    }
}

export class DevDataProvider extends BaseDataProvider implements IDataProvider{

    private _webApi = new VSS_WebApi.VssHttpClient("https://mseng.visualstudio.com/");

    constructor(){
        super();
    }

    public getMsEngTeamContext(): TFS_Core_Contracts.TeamContext {
        return {
            projectId: "",
            project: "VSOnline",
            teamId: "",
            team: "Blueprint"
        }
    }

    public getBoards(): IPromise<Work_Contracts.BoardReference[]>
    {
        var teamContext = this.getMsEngTeamContext();
        var project = teamContext.projectId || teamContext.project;
        var team = teamContext.teamId || teamContext.team;
        
        /*  
        var clientOptions = {} as VSS_WebApi.IVssHttpClientOptions;
        var workClient = VSS_Service
            .VssConnection
            .getConnection()
            .getHttpClient<RestClient.WorkHttpClient>(RestClient.WorkHttpClient, null, VSS_Auth.getAuthTokenManager(), clientOptions);

        workClient.getBoards(this.getMsEngTeamContext());
        */
        return this._webApi._beginRequest<Work_Contracts.BoardReference[]>({
            httpMethod: "GET",
            area:  "work",
            locationId: "23ad19fc-3b8e-4877-8462-b3f92bc06b40",
            resource: "boards",
            routeTemplate: "{project}/{team}/_apis/{area}/{resource}/{id}",
            responseIsCollection: true,
            routeValues: {
                project: project,
                team: team,
            },
            apiVersion: "2.0-preview.1",
            customHeaders : {'Authorization': 'Basic ' + btoa(":"+msengToken)}
        });
    }

    public getBoard(board: string): IPromise<Work_Contracts.Board> {
        var teamContext = this.getMsEngTeamContext();
        var project = teamContext.projectId || teamContext.project;
        var team = teamContext.teamId || teamContext.team;
        return this._webApi._beginRequest<Work_Contracts.Board>({
            httpMethod: "GET",
            area:  "work",
            locationId: "23ad19fc-3b8e-4877-8462-b3f92bc06b40",
            resource: "boards",
            routeTemplate: "{project}/{team}/_apis/{area}/{resource}/{id}",
            responseType: Work_Contracts.TypeInfo.Board,
            routeValues: {
                project: project,
                team: team,
                id: board,
            },
            apiVersion: "2.0-preview.1",
            customHeaders : {'Authorization': 'Basic ' + btoa(":"+msengToken)}
        })
    }

    public queryByWiql(workItemTypes: string[], columnNames: string[], date: string, boardColumnFieldName: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult> {
        var wiql = this.getBoardItems(workItemTypes, columnNames, date, boardColumnFieldName);
        var witClient = TFS_Wit_Client.getClient();
        var queryValues: any = {
            timePrecision: false,
            '$top': top,
        };
        var teamContext = this.getMsEngTeamContext();
        var project = teamContext.projectId || teamContext.project;
        var team = teamContext.teamId || teamContext.team;
        return this._webApi._beginRequest<TFS_Wit_Contracts.WorkItemQueryResult>({
            httpMethod: "POST",
            area:  "wit",
            locationId: "1a9c53f7-f243-4447-b110-35ef023636e4",
            resource: "wiql",
            routeTemplate: "{project}/{team}/_apis/{area}/{resource}",
            responseType: TFS_Wit_Contracts.TypeInfo.WorkItemQueryResult,
            routeValues: {
                project: project,
                team: team,
            },
            queryParams: queryValues,
            apiVersion: "1.0",
            data: wiql
        });
    }
    
    public getPayload(boardName: string): IPromise<IWorkItem[]> {
        return null;
    }

    public getWorkItems(workItemIds: number[], fields?: string[], asOf?: Date): IPromise<IWorkItem[]> {
        var defer = Q.defer<IWorkItem[]>();
        var result: IWorkItem[] = [];
        var queryValues: any = {
            ids: workItemIds,
            fields: fields,
            asOf: asOf,
            '$expand': null,
        };

        this._webApi._beginRequest<TFS_Wit_Contracts.WorkItem[]>({
            httpMethod: "GET",
            area:  "wit",
            locationId: "72c7ddf8-2cdc-4f60-90cd-ab71c14a399b",
            resource: "workItems",
            routeTemplate: "_apis/{area}/{resource}/{id}",
            responseIsCollection: true,
            queryParams: queryValues,
            apiVersion: "1.0"
        }).then((workItems: TFS_Wit_Contracts.WorkItem[]) => {
            for (var i = 0; i<workItems.length;i++) {
                var item = workItems[i] as IWorkItem;
                item.asOf = asOf;
                result.push(item);
            }
            defer.resolve(result);
        });
        
        return defer.promise;
    }   
}


// dataProviderTest(new DataProvider());
// function dataProviderTest(dataProvider:IDataProvider) {
//     var errorCallback = (err?: any) => {
//         console.log(err);
//     };
//     dataProvider.getBoards().then((value:Work_Contracts.BoardReference[]) => {
//         var boardName = value[0].name;
//         dataProvider.getPayload(boardName).then((workItems: TFS_Wit_Contracts.WorkItem[]) => {
//             workItems;
//         }, errorCallback);
//     }, errorCallback);
// }


// serviceTest(new DataService(new DataProvider()));
// function serviceTest(dataService: IDataService) {
//     var errorCallback = (err?: any) => {
//         console.log(err);
//     };
    
//     dataService.getBoards().then((value:Client_Contracts.IBoards) => {
//         var boardName = value.boards[0].name;
//         var days = 1;
//         dataService.getPayload(boardName, days).then((data: Client_Contracts.IData) => {
//             data;
//         }, errorCallback);
//     }, errorCallback);
// }