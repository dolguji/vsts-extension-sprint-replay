import Q = require("q");

import TFS_Wit_Client = require("TFS/WorkItemTracking/RestClient");
import TFS_Wit_Contracts = require("TFS/WorkItemTracking/Contracts");
import RestClient = require("TFS/Work/RestClient");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");

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
        alert("First boardReference " + boardRefs[0].name);
    });
}


$( document ).ready(function() {
        $.ajax({
            url: 'https://mseng.visualstudio.com/defaultcollection/_apis/projects?api-version=1.0',
            dataType: 'json',
            headers: {
                'Authorization': 'Basic ' + btoa(":v7dqy6m7ebz27nw6sk77qwtuksqu2dclgtwmbulpqgstaiz2edxa")
            }
        }).done(function( results ) {
            console.log( results.value[0].id + " " + results.value[0].name );
        });
    });
