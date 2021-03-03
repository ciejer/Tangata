import React, {useState} from 'react';
import {Container, Modal, Row, Col, Overlay, Table, Button, Form } from 'react-bootstrap';
import { useForm } from "react-hook-form";
// import Draggable from 'react-draggable';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { EditJoinPanel } from './EditJoinPanel'
import AutocompleteTextField from './AutoComplete';


export const Conditions = ({models, conditions, addCondition, editCondition, removeCondition, clicked, contextMenuOpen}) => {
    const [contextMenu, setContextMenu] = useState({"x":null,"y":null,"display":false});
    const [editConditionMenu, setEditConditionMenu] = useState({"show": false, "conditionToEdit":""});
    const { register, handleSubmit } = useForm();
    if(clicked===true && contextMenu.display===true) { //add this to every other component that has context menus
      setContextMenu({"x":null,"y":null,"display":false});
      contextMenuOpen(false);
    }
    // console.log("Conditions debug:");
    // console.log(models);
    // console.log(conditions);
    // console.log(contextMenu);
    // console.log(editConditionMenu);
    if (models.length === 0) return null

    const showConditions = (conditions,editCondition,removeCondition,contextMenuOpen) => {
        // console.log(conditions);
        if (conditions.length === 0) return null;
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
        const conditionRow = (condition, index, handleClick) => {
            // console.log("conditionRow");
            // console.log(condition);
            // console.log(index);
            // console.log(index%2 === 0?'odd':'even');
            return ( 
                <tr key={index} className={"componentRow "} onClick={handleClick} onContextMenu={handleClick}>
                  <td md="auto" className="fullSize">
                    <div className="componentContent">{condition}</div>
                  </td>
                </tr>
            );
        }
        var conditionList = []
        for(var conditionIndex=0;conditionIndex<conditions.length;conditionIndex++) {
            conditionList.push(conditionRow(conditions[conditionIndex],conditionIndex,handleClick));
        }
        return (
          <div>
            <div className="w-100 bg-secondary text-white text-center">Add / Remove Conditions to filter results</div>
            <Table striped bordered>
              <tbody>
              {conditionList}
              </tbody>
            </Table>
          </div>
        );
    }


    const handleModalClose = () => setEditConditionMenu({"show": false, "conditionToEdit":""});

    

      
    const editConditionMenuDisplay = (editConditionMenu, handleModalClose, editCondition) => {
      // console.log("Displaying Edit Condition Modal");
      // console.log(editConditionMenu);
      if(editConditionMenu.menuOpen === false) return null;
      const conditionCriteria = React.createRef();
      const handleModalSaveAndClose = () => {
        editCondition(editConditionMenu.conditionToEdit,conditionCriteria.current.recentValue);
        handleModalClose();
      }
      
      const modelColumns = () => {
        var tempModelColumns = [];
        for(var modelIndex=0;modelIndex<models.response.models.length;modelIndex++) {
          for(var columnIndex=0;columnIndex<models.response.models[modelIndex].columns.length;columnIndex++) {
            tempModelColumns.push(models.response.models[modelIndex].columns[columnIndex]);
            tempModelColumns.push(models.response.models[modelIndex].name+"."+models.response.models[modelIndex].columns[columnIndex]);
          }
        }
        // console.log("tempModelColumns");
        // console.log(tempModelColumns);
        return tempModelColumns;
      }

      const modelFullColumns = () => {
        var tempModelColumns = [];
        for(var modelIndex=0;modelIndex<models.response.models.length;modelIndex++) {
          for(var columnIndex=0;columnIndex<models.response.models[modelIndex].columns.length;columnIndex++) {
            tempModelColumns.push(models.response.models[modelIndex].name+"."+models.response.models[modelIndex].columns[columnIndex]);
            tempModelColumns.push(models.response.models[modelIndex].name+"."+models.response.models[modelIndex].columns[columnIndex]);
          }
        }
        // console.log("tempModelColumns");
        // console.log(tempModelColumns);
        return tempModelColumns;
      }

      return(
        <div>
          <Modal show={(editConditionMenu.show)} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Join </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Join Conditions:
            <Form>
              <div className="row">
                <div className="col">
                  <Form.Group>
                    <Form.Label>Condition Criteria</Form.Label>
                      <AutocompleteTextField className="form-control" rows={3} ref={conditionCriteria} options={modelColumns()} fullOptions={modelFullColumns()} trigger="" defaultValue={editConditionMenu.conditionToEdit}/>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleModalSaveAndClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        </div>
      )
      };


    const contextMenuDisplay = (contextMenu) => {
      if(contextMenu.display === false) return null;
      // console.log("Displaying Context Menu");
      // console.log(contextMenu);
      // console.log(contextMenu.target.firstChild.data);
      const clickEditCondition = (conditionToEdit) => {
        setContextMenu({"x":null,"y":null,"display":false});
        setEditConditionMenu({"show": true, "conditionToEdit":contextMenu.target.firstChild.data});
      };
      const clickRemoveCondition = (conditionToRemove) => {
        setContextMenu({"x":null,"y":null,"display":false});
        removeCondition(conditionToRemove);
      };
      return(
        <div>
          <Overlay target={contextMenu.target} show={contextMenu.display} placement="right-start">
            <div>
              <Table bordered variant="dark">
                <tbody>
                  <tr>
                    <td onClick={() => clickEditCondition(contextMenu.target.firstChild.data)}>
                      <div>Edit Condition</div>
                      
                    </td>
                  </tr>
                  <tr>
                    <td onClick={() => clickRemoveCondition(contextMenu.target.firstChild.data)}>
                      Delete Condition
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Overlay>
        </div>
      )
    }

    return(
        <div>
          <h2 className="text-center">Conditions</h2>
          <div>
            {showConditions(conditions,editCondition,removeCondition,contextMenuOpen)}
            {contextMenuDisplay(contextMenu)}
            {editConditionMenuDisplay(editConditionMenu, handleModalClose, editCondition)}
          </div>
          <div className="pt-2 text-center">
            <Button variant="primary" onClick={() => setEditConditionMenu({"show": true, "conditionToEdit":""})}>
                Add Condition
            </Button>
          </div>
        </div>
    )
}
