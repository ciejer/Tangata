import React, { useState } from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";

export function EditJoinPanel( {model, modelIndex, saveEditedModel, models, toggleJoinModal, showJoinModal}) {
  const [newModel, setModelState] = useState(JSON.parse(JSON.stringify(model)));
  const { register, handleSubmit } = useForm();
  if(modelIndex===0) return null;
  // console.log("Start of join panel debug");
  // console.log(showJoinModal);
  // console.log(models);
  // console.log(modelIndex);
  // console.log(model);

    const handleClose = () => toggleJoinModal(-1);
    const handleShow = () => {
      setModelState(JSON.parse(JSON.stringify(model)));
      toggleJoinModal(modelIndex);
    }

    const handleSaveAndClose = () => {
      // TODO: Create join output columns
      saveEditedModel(model, newModel);
      handleClose();
    }

    // new join condition submit
    const onSubmit = (data) => {
      var newCondition = (
        {
          "conditionField1": {
            "model": models.response.models[modelIndex-1].name,
            "column": data.condition1Field
          },
          "conditionOperator": data.conditionOperator,
          "conditionField2": {
            "model": model.name,
            "column": data.condition2Field
          },
          "fullName": model.name+"."+data.condition1Field+" "+data.conditionOperator+" "+models.response.models[modelIndex-1].name+"."+data.condition2Field
        }
        );

      // saveEditedJoin(join, newJoin);
      setModelState({...newModel, "joinConditions": newModel.joinConditions.concat(newCondition)})
    }

    const removeCondition = (condition) => {
      setModelState({...newModel, "joinConditions": newModel.joinConditions.filter(conditions => conditions !== condition)});
    }


    const joinConditionRow = (condition, index) => { // row per join condition
      return(
        <tr className="row" key={"joinCondition_" + index}>
          <td className="col w-75">
          {condition.fullName}
          </td>
          <td className="col w-25">
          <Button variant="secondary" onClick={() => removeCondition(condition)}>
            Remove
          </Button>
          </td>
        </tr>
      )
    }
    const listJoinConditions = newModel.joinConditions.map((condition, index) => joinConditionRow(condition, index)); // map join conditions to 
    
    const listModelColumns = (models,model,register,controlName) => {
      const columnOption = (column,index) => {
        return(
          <option key={index}>{column}</option>
        )
      }

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
      console.log(tempListModelColumns);
      return (
        
        <Form.Control as="select" name={controlName} ref={register}>
          {tempListModelColumns}
        </Form.Control>
      );
    }
    console.log("before render editjoinpanel debug:");
    console.log(models);
    console.log(modelIndex);
    return (
      <div>
        <Button variant="primary" onClick={handleShow}>
          Edit
        </Button>
  
        <Modal show={(showJoinModal === modelIndex)} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit join </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Join Conditions:
            <table className="table">
              {listJoinConditions}
            </table>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col">
                  <Form.Group>
                    <Form.Label>{model.name}</Form.Label>
                      {listModelColumns(models,model.name,register,"condition1Field")}
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
                    <Form.Label>{models.response.models[modelIndex-1].name}</Form.Label>
                      {listModelColumns(models,models.response.models[modelIndex-1].name,register,"condition2Field")}
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
