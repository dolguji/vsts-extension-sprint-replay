import Q = require("q");

import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import VSS_WebApi = require("VSS/WebApi/RestClient");

import VSS_Service = require("VSS/Service");
import VSS_Auth = require("VSS/Authentication/Services");

import {msengToken} from "scripts/secret"


export var defaultFields = ["System.Id","System.WorkItemType","System.Title","System.State","System.AssignedTo"];

export interface IDataProvider{
     getBoard(board: string): IPromise<Work_Contracts.Board>;
     getBoards(): IPromise<Work_Contracts.BoardReference[]>;
     queryByWiql(workItemTypes: string[], columnNames: string[], date: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult>;
     getPayload(boardName: string): IPromise<TFS_Wit_Contracts.WorkItem[]>;
}

export class DataProvider implements IDataProvider{
    private _teamContext: TFS_Core_Contracts.TeamContext;
    constructor() { 
        this._teamContext = this.getTeamContext();
    }
    
    public getPayload(boardName: string): IPromise<TFS_Wit_Contracts.WorkItem[]> {
        var errorCallback = (err?: any) => {
            console.log(err);
        };
    
        return this.getBoard(boardName).then((board: Work_Contracts.Board) => {
            var columnNames = this.getInProgressColumnNames(board.columns);
            var allowedMappings = board.allowedMappings["InProgress"];
            var workItemTypes = [];
            for (var prop in allowedMappings) {
                workItemTypes.push(prop);
            }
            var date = "6/10/2016";

            return this.queryByWiql(workItemTypes, columnNames,  date).then((result: TFS_Wit_Contracts.WorkItemQueryResult) => {
                var ids = result.workItems.map((value, index) => value.id); 
                return this.getWorkItems(ids);
            });
        }, errorCallback);
    }
    
    public queryByWiql(workItemTypes: string[], columnNames: string[], date: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult> {
        var queryBuilder = "SELECT [System.Id],[System.WorkItemType],[System.Title],[System.State] FROM WorkItems WHERE [System.TeamProject] = '" + this._teamContext.project + "'";
        
        for (var i=0; i < workItemTypes.length; i++) {
            if (i == 0) {
                queryBuilder += " AND ([System.WorkItemType] = '" + workItemTypes[i] + "'";
            }
            else {
                queryBuilder += " OR [System.WorkItemType] = '" + workItemTypes[i] + "'";
            }
        }
        
        for (var i=0; i < columnNames.length; i++) {
            if (i == 0) {
                queryBuilder += " AND [System.BoardColumn] = '" + columnNames[i] + "'";
            }
            else {
                queryBuilder += " OR [System.BoardColumn] = '" + columnNames[i] + "'";
            }
        }
        queryBuilder += ")";
        
        queryBuilder += " AsOf '" + date + "' ORDER BY [System.ChangedDate] DESC";
        
        var wiql = {
            query: queryBuilder
        }    

        var witClient = TFS_Wit_Client.getClient();
        return witClient.queryByWiql(wiql, this._teamContext.projectId, this._teamContext.teamId);
    }
    
    public getWorkItems(workItemIds: number[], asOf?: Date): IPromise<TFS_Wit_Contracts.WorkItem[]> {
        var witClient = TFS_Wit_Client.getClient();
        return witClient.getWorkItems(workItemIds, defaultFields, asOf);
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
    
    private getInProgressColumnNames(boardColumns: Work_Contracts.BoardColumn[]): string[] {
        var columnNames = [];
        for (var i=0; i < boardColumns.length; i++) {
            var type = boardColumns[i].columnType;
            if (type == Work_Contracts.BoardColumnType.InProgress) {
                columnNames.push(boardColumns[i].name);
            }
        }
        return columnNames;
    }
}

export class DevDataProvider implements IDataProvider{

    private _webApi = new VSS_WebApi.VssHttpClient("https://mseng.visualstudio.com/");

    constructor(){}
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

    public queryByWiql(workItemTypes: string[], columnNames: string[], date: string): IPromise<TFS_Wit_Contracts.WorkItemQueryResult> {
        return null;
    }
    
    public getPayload(boardName: string): IPromise<TFS_Wit_Contracts.WorkItem[]> {
        return null;
    }
}

var dataProvider = new DevDataProvider();
dataProvider.getBoards().then((value:Work_Contracts.BoardReference[]) => {
    console.log(value);
}, (err)=>{console.log(err)});


productionRun();
function productionRun() {
    var dataProvider = new DataProvider();
    var errorCallback = (err?: any) => {
        console.log(err);
    };
    dataProvider.getBoards().then((value:Work_Contracts.BoardReference[]) => {
        var boardName = value[0].name;
        dataProvider.getPayload(boardName).then((workItems: TFS_Wit_Contracts.WorkItem[]) => {
            workItems;
        }, errorCallback);
    }, errorCallback);
}