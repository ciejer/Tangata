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
    selectedModels: [],
    modelIsDragging: 0,
    joins: [],
    reloadDummyComponent: false,
    toggleDrag: true,
    showJoinModal: -1,
    outputModel: ""
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

  selectModel = (e) => {

    var currentSelectionIndex = this.state.selectedModels.indexOf(e)
    if (currentSelectionIndex !== -1) {
      this.setState(prevState => ({ selectedModels: prevState.selectedModels.filter(selectedModels => selectedModels !== e) }));
    } else {
      this.setState(prevState => ({
        selectedModels: [...prevState.selectedModels, e]
      }))
    }

      /* TODO: stop select events on drag */
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
            <div className="col">
            <DisplayModel 
              models={this.state.models} 
              selectModel={this.selectModel} 
              selectedModels={this.state.selectedModels} 
              forceReload={this.forceReload}
            />
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
