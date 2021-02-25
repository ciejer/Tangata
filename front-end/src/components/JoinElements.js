import React from 'react'
import Draggable from 'react-draggable'
import Xarrow from "react-xarrows"
import { EditJoinPanel } from './EditJoinPanel'


export const JoinElements = ({ joins, editJoin, removeJoin, models, forceReload, saveEditedJoin }) => {
    console.log("models");
    console.log(models);
    console.log("joins");
    console.log(joins);
    if (joins.length === 0) return null;

    const JoinElement = (join, index) => {
        console.log("running join element");
        const joinIndex = index;
        const joinLine = (model, index) => {
            for (var modelIndex = 0; modelIndex < models.response.models.length; modelIndex ++) {
                console.log(models.response.models[modelIndex].name);
                console.log(model.model);
                if(models.response.models[modelIndex].name === model.model) {
                    console.log("matched");
                    console.log("joinElement"+index);
                    return(
                        <div key={index+"-"+modelIndex}>
                            <Xarrow 
                                start={"model"+modelIndex}
                                end={"joinElement"+joinIndex}
                                color="red"
                                strokeWidth={15}
                                startAnchor="right"
                                endAnchor="left"
                            />
                        </div>
                    );
                }
            }
        }

        const allJoinLines = join.models.map((model, index) => joinLine(model, index))
        return (
            <div key = {index}>
                <Draggable onStop={forceReload} onDrag={forceReload}>
                    <div className="joinElement" >
                        <div className="noCursor mb-4 border ">
                            <strong className="cursor">
                                <div className="w-100 bg-secondary text-white text-center">
                                    Join {index}
                                    <button type="button" onClick={() => removeJoin(join)}>
                                        X
                                    </button>
                                </div>
                            </strong>
                            <table className="table table-bordered table-striped table-hover w-100" id={"joinElement"+index} >
                                <tbody>
                                    <tr>
                                        <td className="col-md-2">
                                            <EditJoinPanel 
                                                join = { join }
                                                saveEditedJoin = { saveEditedJoin }
                                                models = { models }
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Draggable>
                {allJoinLines}
            </div>
        )
    }

    const allJoinElements = joins.map((join, index) => JoinElement(join, index))
    

    return (
        <div>
            { allJoinElements }
        </div>
    )
};

