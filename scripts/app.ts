import Q = require("q");

import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import VSS_WebApi = require("VSS/WebApi/RestClient");

import {msengToken} from "scripts/secret"
/*
var dataProvider = new DataProvider();
dataProvider.getBoards().then((value:Work_Contracts.BoardReference[]) => {
    console.log(value);
}, (err)=>{console.log(err)});
*/
export interface IDataProvider{
     getBoard(board: string): IPromise<Work_Contracts.Board>;
     getBoards(): IPromise<Work_Contracts.BoardReference[]>;
}
export class DataProvider implements IDataProvider{
    constructor(){}
    private getTeamContext(): TFS_Core_Contracts.TeamContext {
        var context = VSS.getWebContext();
        return {
            projectId: context.project.id,
            project: context.project.name,
            teamId: context.team.id,
            team: context.team.name
        }
    }

    public getBoard(board: string): IPromise<Work_Contracts.Board> {
        var restClient = RestClient.getClient();
        return restClient.getBoard(this.getTeamContext(), board);
    }

    public getBoards(): IPromise<Work_Contracts.BoardReference[]> {
        var restClient = RestClient.getClient();
        return restClient.getBoards(this.getTeamContext());        
    }
}

export class DevDataProvider implements IDataProvider{

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
        var webApi = new VSS_WebApi.VssHttpClient("https://mseng.visualstudio.com/");

        return webApi._beginRequest<Work_Contracts.BoardReference[]>({
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
        return null;
    }
}
