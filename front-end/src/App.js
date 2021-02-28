import React, { Component} from 'react';
import {Collapse} from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import { DisplayModel } from './components/DisplayModel'
import { NavBar } from './components/NavBar'
import { NewModel } from './components/NewModel'
import { getModelJson } from './services/getModelJson'
import { JoinElements } from './components/JoinElements'
import { SQLPanel } from './components/SQLPanel';

class App extends Component {
  
  state = {
    model: {},
    models: [],
    numberOfModels: 0,
    openSQLPanel: false,
    joins: [],
    reloadDummyComponent: false,
    toggleDrag: true,
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

  forceReload = () => {
    this.setState({reloadDummyComponent: false})
  }

  componentDidMount() { // on load
    getModelJson('all_models.json')
      .then(response => {
        this.setState({models: {response}})
    });
  }


  createJoin = () => {
    var selectedModels = [];
    if(this.state.selectedModels.length === 0) return null;
    this.state.selectedModels.forEach(thisModel => {
      selectedModels.push({"model": thisModel})
    });
    var joinModels = {"models": selectedModels, "conditions": []};
    this.setState(prevState => ({
      joins: [...prevState.joins, joinModels]
    }));
    this.setState({selectedModels: []})
    this.setState({outputModel: "join_"+(this.state.joins.length)}); // length doesn't update until function finishes, so no need to subtract 1
  }


  saveEditedJoin = (join, editedJoin) => {
    this.setState(prevState => ({
      joins: prevState.joins.filter(joins => joins !== join) 
    }));
    this.setState(prevState => ({
      joins: [...prevState.joins, editedJoin]
    }));
  }

  saveEditedModel = (previousModel, newModel) => {
    this.setState(prevState => ({
      models: prevState.models.response.models.filter(models => models !== previousModel) 
    }));
    this.setState({models: {...this.state.models, "response": {...this.state.models.response, "models": [...this.state.models.response.models.filter(models => models !== previousModel), newModel]}}});
  }

  removeJoin = (join) => {
    this.setState(prevState => ({ joins: prevState.joins.filter(joins => joins !== join) }));
    if(this.state.joins.length>1) {
      this.setState({outputModel: "join_"+(this.state.joins.length-2)}); // length doesn't update until function finishes: subtract 2 as zero indexed
    } else {
      this.setState({outputModel: this.state.models.response.models[this.state.models.response.models.length-1].name});
    }
    //TODO: remove join from selected models
    //TODO: check and remove downstream joins
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
          <NavBar addModel={this.addModel} createJoin={this.createJoin} logState={this.logState} openSQLPanel={this.openSQLPanel}></NavBar>
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
              Joins go here
            </div>
            <div className="col outputList">
              Outputs go here
            </div>
          </div>
            <JoinElements 
              joins={this.state.joins}
              removeJoin={this.removeJoin}
              models={this.state.models}
              forceReload={this.forceReload}
              editJoin={this.editJoin}
              saveEditedJoin={this.saveEditedJoin}
              toggleJoinModal = { this.toggleJoinModal }
              showJoinModal = {this.state.showJoinModal}
              selectedModels = {this.state.selectedModels}
              selectModel = {this.selectModel}
            ></JoinElements>
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
