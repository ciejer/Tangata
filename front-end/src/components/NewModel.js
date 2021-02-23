import React from 'react'
import { Form } from 'react-bootstrap'

export const NewModel = ({selectedModels, models}) => {
    var allFields = () => {
        console.log(models);
        var compileFields = {fields:[]};
        models.response.models.forEach(model => {
            if(selectedModels.indexOf(model.name) !== -1) {
                model.columns.forEach(column => {
                    if(compileFields.fields.indexOf(column) === -1) {
                        compileFields.fields.push({modelName: model.name, columnName: column});
                    }
                })
            }
        })
        console.log("compileFields:");
        console.log(compileFields);
        return compileFields;
    };

    const modelColumnRow = (field) => {
        console.log(field);
        return(
            <div className="row" key={field.modelName+field.columnName}>
                <Form.Check
                    id={field.modelName+field.columnName}
                    label={field.modelName+' '+field.columnName}
                />
            </div>
        );
    }


    console.log(selectedModels);
    console.log(models);
    if (selectedModels.length === 0) return(
        <div className="container">
            Please select models.
        </div>

    )
    const allColumnTable = allFields(models).fields.map((field) => modelColumnRow(field))
    return(
        <div className="container">
            <Form>
                <div className="font-weight-bold">What makes a row unique? (Group by):</div>
                {allColumnTable}
                <br/>
                <div className="font-weight-bold">What fields do you want? (Select)</div>
                {allColumnTable}
            </Form>
        </div>
    )
}
