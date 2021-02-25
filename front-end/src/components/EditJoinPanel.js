import React, { useState } from 'react'
import {Modal, Button} from 'react-bootstrap'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export function EditJoinPanel( {join, saveEditedJoin, models}) {
    const newJoin = JSON.parse(JSON.stringify(join));
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSaveAndClose = () => {
      saveEditedJoin(join, newJoin);
      handleClose();
    }


    // a little function to help us with reordering the result
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

  
    return (
      <div>
        <Button variant="primary" onClick={handleShow}>
          Edit
        </Button>
  
        <Modal show={show} onHide={handleClose}>
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
              
              {/* <SortableList models={join.models} onSortEnd={onSortEnd} axis="y" lockAxis="y" helperClass='sortableHelper' ></SortableList> */}
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
