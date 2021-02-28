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
    this.setState({models: {...this.state.models, "response": {...this.state.models.response, "models":  this.reorder(
        this.state.models.response.models,
        result.source.index,
        result.destination.index
    )}}});
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
