import React, { useState } from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";

export function EditJoinPanel( {join, joinIndex, saveEditedJoin, models, forceReload, toggleJoinModal, showJoinModal}) {
  const [newJoin, setJoinState] = useState(JSON.parse(JSON.stringify(join)));

    const handleClose = () => toggleJoinModal(-1);
    const handleShow = () => {
      setJoinState(JSON.parse(JSON.stringify(join)));
      toggleJoinModal(joinIndex);
    }

    const handleSaveAndClose = () => {
      saveEditedJoin(join, newJoin);
      handleClose();
    }

    // new join condition submit
    const { register, handleSubmit } = useForm();
    const onSubmit = (data) => {
      var newCondition = ({"condition1": data.condition1Field, "conditionOperator": data.conditionOperator, "condition2": data.condition2Field, "fullName": newJoin.models[0].model+"."+data.condition1Field+" "+data.conditionOperator+" "+newJoin.models[1].model+"."+data.condition2Field});
      // saveEditedJoin(join, newJoin);
      setJoinState({...newJoin, "conditions": newJoin.conditions.concat(newCondition)})
    }

    const removeCondition = (condition) => {
      setJoinState({...newJoin, "conditions": newJoin.conditions.filter(conditions => conditions !== condition)});
    }

    // this function reorders the models on dragdrop
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
    
        return result;
    };
    const onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
        setJoinState({...newJoin, "models": reorder(
          newJoin.models,
            result.source.index,
            result.destination.index
        )});
        }

    const joinConditionRow = (condition, index) => { // row per join condition
      return(
        <tr className="row" key={"joinCondition_" + index}>
          <td>
          {condition.fullName}
          </td>
          <td>
          <Button variant="secondary" onClick={() => removeCondition(condition)}>
            Remove
          </Button>
          </td>
        </tr>
      )
    }
    const listJoinConditions = newJoin.conditions.map((condition, index) => joinConditionRow(condition, index)); // map join conditions to 
    
    const listModelColumns = (models,model,register,controlName) => {
      const columnOption = (column,index) => {
        return(
          <option key={index}>{column}</option>
        )
      }
      console.log(model);
      console.log(models);
      var listModel = {};
      for(var modelIndex=0;modelIndex<models.response.models.length;modelIndex++) {
        console.log(models.response.models[modelIndex].name);
        if(models.response.models[modelIndex].name===model) {
          console.log("matched");
          listModel = models.response.models[modelIndex];
        }
      }
      console.log(listModel);
      if(listModel===null) return null;
      if(listModel.columns.length===0) return null;
      const tempListModelColumns = listModel.columns.map((column, index) => columnOption(column,index))
      // for(var columnIndex = 0;columnIndex<listModel.columns.length;columnIndex++) {
      //   console.log("found column");
      //   tempListModelColumns += columnOption(listModel.columns[columnIndex]);
      // }
      console.log(tempListModelColumns);
      return (
        
        <Form.Control as="select" name={controlName} ref={register}>
          {tempListModelColumns}
        </Form.Control>
      );
    }
  
    return (
      <div>
        <Button variant="primary" onClick={handleShow}>
          Edit
        </Button>
  
        <Modal show={(showJoinModal === joinIndex)} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit join </Modal.Title>
          </Modal.Header>
          <Modal.Body>Please choose the correct order for your models:
            <DragDropContext onDragEnd={onDragEnd}> 
            {/* TODO: only allow reordering models if they are all models
            TODO: only allow two models in a join */}
                <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    >
                    {newJoin.models.map((item, index) => (
                        <Draggable key={"edit_join_"+item.model} draggableId={item.model} index={index}>
                        {(provided, snapshot) => (
                            <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            >
                            {item.model}
                            </div>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    </div>
                )}
                </Droppable>
            </DragDropContext>
            Join Conditions:
            <table className="table">
              {listJoinConditions}
            </table>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col">
                  <Form.Group>
                    <Form.Label>{newJoin.models[0].model}</Form.Label>
                      {listModelColumns(models,newJoin.models[0].model,register,"condition1Field")}
                  </Form.Group>
                </div>
                <div className="col">
                  <Form.Group>
                    <Form.Label>Operator type</Form.Label>
                    <Form.Control name="conditionOperator" as="select"  ref={register} >
                      <option>=</option>
                      <option>&gt;=</option>
                      <option>&lt;=</option>
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col">
                  
                <Form.Group>
                    <Form.Label>{newJoin.models[1].model}</Form.Label>
                      {listModelColumns(models,newJoin.models[1].model,register,"condition2Field")}
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <Button variant="primary" type="submit">
                  Add
                </Button>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveAndClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
