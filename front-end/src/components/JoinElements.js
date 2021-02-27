import React from 'react'
import Draggable from 'react-draggable'
import Xarrow from "react-xarrows"
import { EditJoinPanel } from './EditJoinPanel'


export const JoinElements = ({ joins, editJoin, removeJoin, models, forceReload, saveEditedJoin, toggleJoinModal, showJoinModal }) => {
    if (joins.length === 0) return null;

    const JoinElement = (join, index) => {
        const joinIndex = index;
        const joinLine = (model, index) => {
            for (var modelIndex = 0; modelIndex < models.response.models.length; modelIndex ++) {
                if(models.response.models[modelIndex].name === model.model) {
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
                <Draggable onStop={forceReload} onDrag={forceReload} cancel=".modal, button">
                    <div className="joinElement" >
                        <div className="mb-4 border ">
                            <div className="w-100 bg-secondary text-white text-center">
                                Join {index}
                                <button type="button" onClick={() => removeJoin(join)}>
                                    X
                                </button>
                            </div>
                            <table className="table table-bordered table-striped table-hover w-100" id={"joinElement"+index} >
                                <tbody>
                                    <tr>
                                        <td className="col-md-2">
                                            <EditJoinPanel 
                                                join = { join }
                                                saveEditedJoin = { saveEditedJoin }
                                                models = { models }
                                                forceReload = { forceReload }
                                                showJoinModal = { showJoinModal }
                                                toggleJoinModal = { toggleJoinModal }
                                                joinIndex = { index }
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

