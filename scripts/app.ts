import Q = require("q");

import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");
import VSS_WebApi = require("VSS/WebApi/RestClient");

import {msengToken} from "scripts/secret"

getBoards();
getMsEngBoards().then((value:Work_Contracts.BoardReference[]) => {
    console.log(value);
}, (err)=>{console.log(err)});


function getTeamContext(): TFS_Core_Contracts.TeamContext {
    var context = VSS.getWebContext();
    return {
        projectId: context.project.id,
        project: context.project.name,
        teamId: context.team.id,
        team: context.team.name
    }
}

function getBoard(board: string) {
    var restClient = RestClient.getClient();
    restClient.getBoard(getTeamContext(), board).then((board: Work_Contracts.Board) => {
        // do something
        board.allowedMappings;
    });
}

function getBoards() {
    var restClient = RestClient.getClient();
    restClient.getBoards(getTeamContext()).then((boardRefs: Work_Contracts.BoardReference[]) => {
        getBoard(boardRefs[0].name);
    });
}

/*
$( document ).ready(function() {
        $.ajax({
            url: 'https://mseng.visualstudio.com/defaultcollection/_apis/projects?api-version=1.0',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa(":"+msengToken)
            }
        }).done(function( results ) {
            console.log( results.value[0].id + " " + results.value[0].name );
        });
    });
*/


function getMsEngTeamContext(): TFS_Core_Contracts.TeamContext {
    return {
        projectId: "",
        project: "VSOnline",
        teamId: "",
        team: "Blueprint"
    }
}

function getMsEngBoards(): IPromise<Work_Contracts.BoardReference[]>
{
    var teamContext = getMsEngTeamContext();
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