import React from 'react'

const JsonFilenameInput = ({ onChangeForm, getModelJson }) => {
      return (
        <form onSubmit={(e) => {e.preventDefault(); getModelJson()}} >
          <label>
            Name:
            </label>
            <input type="text" name="jsonFilename" id="jsonFilename" defaultValue="all_models.json" onChange= {(e) => onChangeForm(e)} />
          
          <input type="button" onClick= {(e) => getModelJson()}  value="Get File"></input>
        </form>
      );
  }
export default JsonFilenameInput
