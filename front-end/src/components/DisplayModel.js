import React, {useState} from 'react';
// import Draggable from 'react-draggable';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


export const DisplayModel = ({models, selectModel, selectedModels, forceReload, modelDragEnd}) => {
    if (models.length === 0) return null
    var highlightIfSelected = (modelName) => {
        if(selectedModels.indexOf(modelName) !== -1) {
            return("border-primary");
        }
        
      }


    const modelDraw = (model,index) => {
        const columnRows = (columns) => {
            const columnRow = (column,index) => {
                return(
                      <tr key = {index} className={index%2 === 0?'odd':'even'}>
                          <td className="col-md-auto">{index + 1}</td>
                          <td className="col">{column}</td>
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
            >
            <strong className="cursor">
                <div className="w-100 bg-secondary text-white text-center">
                    {model.name}
                </div>
            </strong>
            <table className="table table-bordered table-striped table-hover w-100">
                    {columnRows(model.columns)}
            </table>
            </div>
        )}
        </Draggable>)
    }
    const modelsDraw = models.response.models.map((model,index) => modelDraw(model,index));
    

    const ModelTable = () => {

        return(
            <div key>
                

                <DragDropContext onDragEnd={modelDragEnd}> 
                {/* TODO: only allow reordering models if they are all models
                TODO: only allow two models in a join */}
                    <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        >
                        {modelsDraw}
                        {provided.placeholder}
                        </div>
                    )}
                    </Droppable>
                </DragDropContext>

                
                {/* <Draggable handle="strong" onStop={forceReload} onDrag={forceReload} nodeRef={draggableNodeRef}>
                    <div 
                        className={"noCursor w-25 mb-4 border " + highlightIfSelected(models.response.models[index].name)} 
                        onClick={() => selectModel(models.response.models[index].name)}
                        id={"model"+index}
                        ref={draggableNodeRef}
                        >
                    <strong className="cursor">
                        <div className="w-100 bg-secondary text-white text-center">
                            {models.response.models[index].name}
                        </div>
                    </strong>
                        <table className="table table-bordered table-striped table-hover w-100">
                            <tbody>
                                {columnRows}
                            </tbody>
                        </table>
                    </div>
                </Draggable> */}
            </div>
        )
    }

    return(
        <div className="container">
            <h2>Models</h2>
                {ModelTable()}
        </div>
    )
}
