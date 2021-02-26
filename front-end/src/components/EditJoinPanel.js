import React, { useState } from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";

export function EditJoinPanel( {join, saveEditedJoin, models, forceReload, toggleJoinModal, showJoinModal}) {
  const [newJoin, setJoinState] = useState(JSON.parse(JSON.stringify(join)));
  console.log("join panel - join")
  console.log(join);

    const handleClose = () => toggleJoinModal();
    const handleShow = () => {
      setJoinState(JSON.parse(JSON.stringify(join)));
      toggleJoinModal();
    }

    const handleSaveAndClose = () => {
      console.log("is this running?");
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
      console.log("is this running?");
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
        newJoin.models = reorder(
          newJoin.models,
            result.source.index,
            result.destination.index
          );
        }

    const joinConditionRow = (condition, index) => { // row per join condition
      return(
        <div className="row" key={"joinCondition_" + index}>
          {condition.fullName}
          <Button variant="secondary" onClick={() => removeCondition(condition)}>
            Remove
          </Button>
        </div>
      )
    }
    const listJoinConditions = newJoin.conditions.map((condition, index) => joinConditionRow(condition, index)); // map join conditions to 
    
  
    return (
      <div>
        <Button variant="primary" onClick={handleShow}>
          Edit
        </Button>
  
        <Modal show={showJoinModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit join </Modal.Title>
          </Modal.Header>
          <Modal.Body>Please choose the correct order for your models:
            <DragDropContext onDragEnd={onDragEnd}>
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
            <div className="table">
              {listJoinConditions}
            </div>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col">
                  <Form.Group>
                    <Form.Label>{newJoin.models[0].model}</Form.Label>
                    <Form.Control as="select" name="condition1Field" ref={register}>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                    </Form.Control>
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
                    <Form.Label>{newJoin.models[0].model}</Form.Label>
                    <Form.Control as="select" name="condition2Field" ref={register}>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                    </Form.Control>
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
