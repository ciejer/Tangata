import React, {useState} from 'react';
// import Draggable from 'react-draggable';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { EditJoinPanel } from './EditJoinPanel'


export const Models = ({models, modelDragEnd, showColumns, saveEditedModel, toggleJoinModal, showJoinModal, highlightedColumns}) => {
    // console.log("DisplayModels: Models");
    // console.log(models);
    if (models.length === 0) return null

    const modelDraw = (model,index,showColumns, showJoinModal, toggleJoinModal, highlightedColumns) => {
        const columnRows = (columns,showColumns) => {
            const columnRow = (column,index) => {
                // console.log("modelDraw");
                // console.log(model);
                // console.log(column);
                var highlightThisColumn = false;
                for(var highlightedColumnIndex=0;highlightedColumnIndex<highlightedColumns.length;highlightedColumnIndex++) {
                    if(model.name===highlightedColumns[highlightedColumnIndex].model && column===highlightedColumns[highlightedColumnIndex].column) {
                        highlightThisColumn = true;
                    }
                }
                return(
                      <tr key = {index} className={index%2 === 0?'odd':'even'}>
                          <td className={"col-md-auto "+(highlightThisColumn?"highlightColumn":null)}>{index + 1}</td>
                          <td className={"col "+(highlightThisColumn?"highlightColumn":null)}>{column}</td>
                      </tr>
                  );
            }
            
            const columnRowsOutput = columns.map((column,index) => columnRow(column,index));
            return(<tbody>{columnRowsOutput}</tbody>);
        }
        return(
        <Draggable key={"model_"+model.name} draggableId={model.name} index={index}>
        {(provided, snapshot) => (
            <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="col"
            >
            <div className="w-100 bg-secondary text-white text-center font-weight-bold">
                {model.name}
            </div>
            <div className="w-100 bg-light text-dark text-center font-italic mb-3">
                {model.description}
            </div>
            <div className="w-100 bg-light text-dark text-center">
                <EditJoinPanel
                    model = { model }
                    saveEditedModel = { saveEditedModel }
                    models = { models }
                    showJoinModal = { showJoinModal }
                    toggleJoinModal = { toggleJoinModal }
                    modelIndex = { index }
                />
            </div>
            <table className="table table-bordered table-striped table-hover w-100">
                    {showColumns===true ? columnRows(model.columns) : null}
            </table>
            </div>
        )}
        </Draggable>)
    }
    const modelsDraw = (models,showColumns, showJoinModal, toggleJoinModal) => 
        models.response.models.map((model,index) => {
            return modelDraw(model,index,showColumns, showJoinModal, toggleJoinModal, highlightedColumns)
        }
        );
    
    

    const ModelTable = () => {

        return(
            <div className="container">
                

                <DragDropContext onDragEnd={modelDragEnd}> 
                {/* TODO: only allow reordering models if they are all models
                TODO: only allow two models in a join */}
                    <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        >
                        {modelsDraw(models,showColumns, showJoinModal, toggleJoinModal, highlightedColumns)}
                        {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                </DragDropContext>

            </div>
        )
    }

    return(
        <div className="text-center">
            <h2>Models</h2>
                {ModelTable()}
        </div>
    )
}
