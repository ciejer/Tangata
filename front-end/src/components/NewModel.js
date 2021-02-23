import React from 'react'

export const NewModel = ({selected_models}) => {
    console.log(selected_models);
    if (selected_models.length === 0) return(
        <div className="container">
            Please select models.
        </div>

    )

    const ColumnRow = (column,index) => {

        return(
              <tr key = {index} className={index%2 === 0?'odd':'even'}>
                  <td>{index + 1}</td>
                  <td>{column}</td>
              </tr>
          )
    }


    return(
        <div className="container">
            New Model Form Here
        </div>
    )
}
