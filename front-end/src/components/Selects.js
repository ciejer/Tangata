import React, {useState} from 'react';
import { Container } from 'react-bootstrap';



export function Selects( {models, clicked, contextMenuOpen, selects, saveEditedSelect, highlightColumn}) {
    // console.log("Selects:")
    // console.log(models);
    if (models.length === 0) return null

    const modelColumns = (models) => {
        var tempModelColumns = [];
        for(var modelIndex=0;modelIndex < models.response.models.length;modelIndex++) {
            for(var columnIndex=0;columnIndex<models.response.models[modelIndex].columns.length;columnIndex++) {
                var columnUsedToJoin = false;
                for(var joinModelIndex=0;joinModelIndex<models.response.models.length;joinModelIndex++) {
                    if('joinConditions' in models.response.models[modelIndex] && typeof models.response.models[modelIndex].joinConditions !== 'undefined') {
                        // console.log(models.response.models[modelIndex]);
                        for(var joinConditionIndex=0;joinConditionIndex<models.response.models[modelIndex].joinConditions.length;joinConditionIndex++) {
                            if(
                                models.response.models[modelIndex].name===models.response.models[modelIndex].joinConditions[joinConditionIndex].conditionField1.model
                                && models.response.models[modelIndex].columns[columnIndex]===models.response.models[modelIndex].joinConditions[joinConditionIndex].conditionField1.column) {
                                    columnUsedToJoin = true;
                                }
                        }
                    }
                    
                }
                if(!columnUsedToJoin) {
                    tempModelColumns.push({"column": models.response.models[modelIndex].columns[columnIndex],"model": models.response.models[modelIndex].name});
                }
            
            }
        }
        // console.log("tempModelColumns");
        // console.log(tempModelColumns);
        return tempModelColumns;
    }
    
    
    const listModelColumns = (models,modelColumns, highlightColumn) => {
        const allModelColumns = modelColumns(models);
        return allModelColumns.map((col,index) => {
            return(
                <tr key={index} className="row" onMouseEnter={() => highlightColumn([col])} onMouseLeave={() => highlightColumn([])}>
                    <td className="col">
                        {col.column}
                    </td>
                </tr>
            );
        });
    }

    return(
        <div>
            <h2 className="text-center">
                Output
            </h2>
            <div className="w-100 bg-secondary text-white text-center">Choose and transform fields</div>
            <table className="table table-striped table-hover w-100">
                {listModelColumns(models,modelColumns, highlightColumn)}
            </table>
        </div>
    )
}