import React, { Component} from 'react';
import {Collapse} from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import { DisplayModel } from './components/DisplayModel'
import { NavBar } from './components/NavBar'
import { getModelJson } from './services/getModelJson'
import { SQLPanel } from './components/SQLPanel';

class App extends Component {
  
  state = {
    model: {},
    models: [],
    openSQLPanel: false,
    showJoinModal: -1,
    outputModel: "",
    showColumns: true
  }

  toggleJoinModal = (joinNum) => {
    this.setState({showJoinModal: joinNum})
  }

  
  openSQLPanel = () => {
    this.setState({openSQLPanel: true})
  }

  componentDidMount() { // on load
    getModelJson('all_models.json')
      .then(response => {
        this.setState({models: {response}})
    });
  }

  saveEditedModel = (previousModel, newModel) => {
    this.setState(prevState => ({
      models: prevState.models.response.models.filter(models => models !== previousModel) 
    }));
    this.setState({models: {...this.state.models, "response": {...this.state.models.response, "models": [...this.state.models.response.models.filter(models => models !== previousModel), newModel]}}});
  }


  logState = () => {
    console.log(this.state);
  }

  addModel = () => {
    console.log("Not yet implemented"); //TODO: add input model from catalog
  }
  // this function reorders items on dragdrop
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  modelDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    if (result.destination.index===result.source.index) {
      return;
    }
    const reorderJoinConditions = (joinConditions) => {
      var newJoinCondition = JSON.parse(JSON.stringify(joinConditions));
      for(var joinConditionIndex=0;joinConditionIndex<joinConditions.length;joinConditionIndex++) {
        newJoinCondition[joinConditionIndex].conditionField1 = joinConditions[joinConditionIndex].conditionField2;
        newJoinCondition[joinConditionIndex].conditionField2 = joinConditions[joinConditionIndex].conditionField1;
        newJoinCondition[joinConditionIndex].fullName = 
          joinConditions[joinConditionIndex].conditionField2.model
          +"."+joinConditions[joinConditionIndex].conditionField2.column
          +" "+joinConditions[joinConditionIndex].conditionOperator
          +" "+joinConditions[joinConditionIndex].conditionField1.model
          +"."+joinConditions[joinConditionIndex].conditionField1.column
      }
      return(newJoinCondition);
    }
    var fixedModels = this.reorder(
      this.state.models.response.models,
      result.source.index,
      result.destination.index
    );
    var tempJoinConditions = fixedModels[result.source.index].joinConditions;
    fixedModels[result.source.index].joinConditions = fixedModels[result.destination.index].joinConditions;
    fixedModels[result.destination.index].joinConditions = tempJoinConditions;
    if(fixedModels[result.destination.index].joinConditions.length>0) {
      fixedModels[result.destination.index].joinConditions = reorderJoinConditions(fixedModels[result.destination.index].joinConditions);
    } else {
      fixedModels[result.source.index].joinConditions = reorderJoinConditions(fixedModels[result.source.index].joinConditions);
    }
    this.setState({models: {...this.state.models, "response": {...this.state.models.response, "models":  fixedModels}}});
    }
  

  render() {
    return (
        <div id="main">
          <NavBar addModel={this.addModel} logState={this.logState} openSQLPanel={this.openSQLPanel}></NavBar>
          <div className="row">
            {/* <JsonFilenameInput 
              onChangeForm={this.onChangeForm}
              getModelJson={this.getModelJson}
              JsonFilenameInput={this.JsonFilenameInput}
              >
            </JsonFilenameInput> */}
            <div className="col modelList">
            <DisplayModel 
              models={this.state.models} 
              modelDragEnd={this.modelDragEnd}
              showColumns={this.state.showColumns}
              saveEditedModel={this.saveEditedModel}
              toggleJoinModal = { this.toggleJoinModal }
              showJoinModal = {this.state.showJoinModal}
            />
            </div>
            <div className="col conditionList">
              Conditions go here
            </div>
            <div className="col outputList">
              Outputs go here
            </div>
          </div>
            <Collapse in={ this.state.openSQLPanel } timeout={2000} dimension={'width'}>
                <div>
              <div id="sqlPanelSideBar" className="sidePanelContent">
                <div className="sideBarExitButton">
                  <XCircle onClick={() => this.setState({openSQLPanel: false})}></XCircle>
                </div>
                <SQLPanel
                  state={this.state}
                >
                </SQLPanel>
              </div>
              </div>
              </Collapse>
          </div>
          
    );
  }
}

export default App;
