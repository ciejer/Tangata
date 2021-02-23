import React from 'react'
import Draggable from 'react-draggable'

export const DisplayModel = ({models}) => {
    console.log(models);
    if (models.length === 0) return null

    const ColumnRow = (column,index) => {

        return(
              <tr key = {index} className={index%2 === 0?'odd':'even'}>
                  <td className="col-md-auto">{index + 1}</td>
                  <td className="col">{column}</td>
              </tr>
          )
    }

    const ModelTable = (model,index) => {
        const columnRows = models.response.models[index].columns.map((column,index) => ColumnRow(column,index))
        return(
            <div key = {index}>
                <Draggable handle="strong">
                    <div className="noCursor bg-white">
                    <strong className="cursor">
                        <div className="w-25 bg-secondary text-white text-center">
                            {models.response.models[index].name}
                        </div>
                    </strong>
                        <table className="table table-bordered table-striped table-hover w-25">
                            <tbody>
                                {columnRows}
                            </tbody>
                        </table>
                    </div>
                </Draggable>
            </div>
        )
    }

    const modelTables = models.response.models.map((model,index) => ModelTable(model,index))

    return(
        <div className="container">
            <h2>Models</h2>
                {modelTables}
        </div>
    )
}
