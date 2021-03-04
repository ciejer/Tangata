import React, {useState} from 'react';
import { Container, Overlay, Table } from 'react-bootstrap';



export function Selects( {models, clicked, contextMenuOpen, selects, editSelect, highlightColumn}) {
    const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
    console.log("Selects:")
    console.log(models);
    console.log(contextMenu);
    if (models.length === 0) return null

    if(clicked===true && contextMenu.display===true) { //add this to every other component that has context menus
        setContextMenu({"x":null,"y":null,"display":false});
        contextMenuOpen(false);
      }


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

    const contextMenuDisplay = (contextMenu) => {
        if(contextMenu.display === false) return null;
        console.log("Displaying Context Menu");
        console.log(contextMenu);
        console.log(contextMenu.target.firstChild.data);
        const clickEditSelect = (selectToEdit) => {
          setContextMenu({"x":null,"y":null,"display":false});
        //   setEditConditionMenu({"show": true, "conditionToEdit":contextMenu.target.firstChild.data});
        };
        const clickRemoveSelect = (selectToRemove) => {
          setContextMenu({"x":null,"y":null,"display":false});
          editSelect(selectToRemove,null);
        };
        return(
          <div>
            <Overlay target={contextMenu.target} show={contextMenu.display} placement="left-start">
              <div>
                <Table bordered variant="dark">
                  <tbody>
                    <tr>
                      <td onClick={() => clickEditSelect(contextMenu.target.firstChild.data)}>
                        <div>Edit Field</div>
                        
                      </td>
                    </tr>
                    <tr>
                      <td onClick={() => clickRemoveSelect(contextMenu.target.firstChild.data)}>
                        Delete Field
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Overlay>
          </div>
        )
      }
    
    
    const listModelColumns = (models,modelColumns, highlightColumn,contextMenuOpen) => {
        
        const handleClick = (e) => {
            console.log(e);
              if (e.type === 'click') {
                setContextMenu({"x":null,"y":null,"display":false});
                contextMenuOpen(false);
              } else if (e.type === 'contextmenu') {
                e.preventDefault();
                if(contextMenu.display===false) { //if contextMenu is not displayed
                  setContextMenu({"x":e.pageX,"y":e.pageY,"display":true,"clickTargetType":"Condition","target": e.target});
                  contextMenuOpen(true);
                } else {
                  setContextMenu({"x":null,"y":null,"display":false});
                  contextMenuOpen(false);
                }
              }
          }
        const allModelColumns = modelColumns(models);
        return allModelColumns.map((col,index) => {
            return(
                <tr key={index} className="row" onMouseEnter={() => highlightColumn([col])} onMouseLeave={() => highlightColumn([])} onClick={(e) => handleClick(e)} onContextMenu={(e) => handleClick(e)}>
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
                <tbody>
                    {listModelColumns(models,modelColumns, highlightColumn,contextMenuOpen)}
                </tbody>
            </table>
            {contextMenuDisplay(contextMenu)}
        </div>
    )
}