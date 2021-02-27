import React from 'react'
const conditionConcat = (conditions) => {
    if (conditions.length === 0) return null;
    var tempConditionConcat = conditions[0].fullName;
    for(var conditionIndex=1;conditionIndex<conditionIndex.length;conditionIndex++) {
        tempConditionConcat += " AND " + conditions[conditionIndex].fullName;
    }
    return tempConditionConcat;
}

const fromStatement = (state) => {
    var tempFromStatement = "";
    if (state.joins.length !== 0) {
        tempFromStatement += "FROM " + state.joins[0].models[0].model + "\n"
        for(var joinIndex=0;joinIndex<state.joins.length;joinIndex++) {
            tempFromStatement += "LEFT JOIN " 
                + state.joins[joinIndex].models[1].model 
                + " ON " + conditionConcat(state.joins[joinIndex].conditions) + "\n";
        }
    } else {
        tempFromStatement += "FROM " + state.outputModel
    }
    return tempFromStatement;
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
        </div>
    </div>
    )
}

