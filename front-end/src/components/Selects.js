import React, {useState} from 'react';
import { Container, Overlay, Table, Form } from 'react-bootstrap';



export function Selects( {models, clicked, contextMenuOpen, selects, editSelect, highlightColumn}) {
    const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
    const [editingField, setEditingField] = useState(-1);
    // console.log("Selects:")
    // console.log(models);
    // console.log(selects);
    // console.log(contextMenu);
    // console.log(clicked);
    // console.log(editingField);
    if (models.length === 0) return null

    if(clicked===true && contextMenu.display===true) { //add this to every other component that has context menus
        setContextMenu({"x":null,"y":null,"display":false});
        contextMenuOpen(false);
      }

    const contextMenuDisplay = (contextMenu, selects) => {
        if(contextMenu.display === false) return null;
        // console.log("Displaying Context Menu");
        // console.log(contextMenu);
        // console.log(contextMenu.target.firstChild.data);
        // console.log(contextMenu.target);
        // console.log(JSON.parse(contextMenu.target.dataset.selectvalue));
        // console.log(contextMenu.target.dataset.selectvalue.model);
        const clickEditSelectName = (selectToEdit) => {
        //   setEditConditionMenu({"show": true, "conditionToEdit":contextMenu.target.firstChild.data});
            setEditingField(parseInt(selectToEdit));
            contextMenuOpen(false);
        };
        const clickRemoveSelect = (selectToRemove) => {
          editSelect(selectToRemove,null);
          contextMenuOpen(false);
        };
        return(
          <div>
            <Overlay target={contextMenu.target} show={contextMenu.display} placement="left-start">
              <div>
                <Table bordered variant="dark">
                  <tbody>
                    <tr>
                      <td onClick={() => clickEditSelectName(contextMenu.target.dataset.selectindex)}>
                        <div>Edit Name</div>
                        
                      </td>
                    </tr>
                    <tr>
                      <td onClick={() => clickRemoveSelect(selects[contextMenu.target.dataset.selectindex])}>
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
    
    
    const listModelColumns = (models,selects, highlightColumn,contextMenuOpen) => {
        
        const handleClick = (e) => {
            // console.log(e);
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

          const updateColumnAlias = (e) => {
            //   console.log("updateColumnAlias");
            //   console.log(e);
              setEditingField(-1);
              editSelect(selects[editingField],{...selects[editingField], "alias": e.target.value});
          }

          const showField = (selects, selectsIndex) => {
            //   console.log("showField");
            //   console.log(selectsIndex);
            //   console.log(editingField);
            if(editingField === selectsIndex) {
                return(
                    <>
                        <Form>
                            <Form.Group controlId="exampleForm.ControlInput1">
                                <Form.Control
                                    type="text"
                                    defaultValue={(selects[selectsIndex].alias !== null && selects[selectsIndex].alias !== undefined)?selects[selectsIndex].alias:selects[selectsIndex].column}
                                    onBlur={(e) => updateColumnAlias(e)}
                                />
                            </Form.Group>
                        </Form>
                    </>
                );
            } else {
                return(
                    <>
                        {(selects[selectsIndex].alias !== null && selects[selectsIndex].alias !== undefined)?selects[selectsIndex].alias:selects[selectsIndex].column}
                    </>
                );
            }
          }

        const highlightColumns = (col) => {
            // console.log("highlightColumns");
            // console.log(col);
            var tempColumnsToHighlight = [];
            if(col !== undefined & col !== null) {
                for(var columnIndex=0;columnIndex<col.inputColumns.length;columnIndex++) {
                    tempColumnsToHighlight.push(col.inputColumns[columnIndex]);
                } 
            }
            highlightColumn(tempColumnsToHighlight);
        }
        var tempListModelColumns = [];
        for(let selectsIndex=0;selectsIndex<selects.length;selectsIndex++) {
            // console.log("selectsMap");
            // console.log(selects[selectsIndex]);
            tempListModelColumns.push(
                <tr
                    key={selectsIndex}
                    onMouseEnter={() => highlightColumns(selects[selectsIndex])}
                    onMouseLeave={() => highlightColumns()}
                    onClick={(e) => handleClick(e)}
                    onContextMenu={(e) => handleClick(e)}
                >
                    <td
                    data-selectindex = {selectsIndex}
                    >
                        {showField(selects, selectsIndex)}
                    </td>
                </tr>
            );
        }
        return tempListModelColumns;
    }

    return(
        <div>
            <h2 className="text-center">
                Output
            </h2>
            <div className="w-100 bg-secondary text-white text-center">Choose and transform fields</div>
            <table className="table table-striped table-hover w-100">
                <tbody>
                    {listModelColumns(models,selects, highlightColumn,contextMenuOpen)}
                </tbody>
            </table>
            {contextMenuDisplay(contextMenu, selects)}
        </div>
    )
}