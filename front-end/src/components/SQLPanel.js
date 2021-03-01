import React from 'react'
const conditionConcat = (conditions) => {
    console.log("SQLPanel Conditions");
    console.log(conditions);
    if (conditions.length === 0) return null;
    var tempConditionConcat = conditions[0].fullName;
    for(var conditionIndex=1;conditionIndex<conditions.length;conditionIndex++) {
        tempConditionConcat += "\n  AND " + conditions[conditionIndex].fullName;
    }
    return tempConditionConcat;
}

const fromStatement = (state) => {
    var tempFromStatement = "";
    if (state.models.length !== 0) {
        tempFromStatement += "FROM " + state.models.response.models[0].name + "\n"
        for(var joinIndex=1;joinIndex<state.models.response.models.length;joinIndex++) {
            tempFromStatement += "LEFT JOIN " 
                + state.models.response.models[joinIndex].name 
                + "\n  ON " + conditionConcat(state.models.response.models[joinIndex].joinConditions) + "\n";
        }
    } else {
        tempFromStatement += "FROM " + state.outputModel
    }
    return tempFromStatement;
}
const whereStatement = (state) => {
    var tempWhereStatement = "";
    if (state.models.length !== 0) {
        tempWhereStatement += "WHERE " + state.conditions[0] + "\n"
        console.log("Loading conditions");
        console.log(state.conditions.length);
        for(var conditionIndex=1;conditionIndex<state.conditions.length;conditionIndex++) {
            tempWhereStatement += "  AND " + state.conditions[conditionIndex] + "\n";
        }
    } else {
        tempWhereStatement += "FROM " + state.outputModel
    }
    return tempWhereStatement;
}
export const SQLPanel = ({state}) => {
    // const fromItem = (joinModel) => {
    //     return(
    //         {join.}
    //     )
    // }
    return(
    <div>
        Generated SQL:
        <div className="sqlContent">
            {fromStatement(state)}
            {whereStatement(state)}
        </div>
    </div>
    )
}

