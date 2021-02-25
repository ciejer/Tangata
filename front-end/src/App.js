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

class App extends Component {
  
  state = {
    model: {},
    models: [],
    numberOfModels: 0,
    openCreatePanel: false,
    selectedModels: [],
    modelIsDragging: 0,
    joins: [],
    reloadDummyComponent: false
  }


  // getModelJson = () => {
  //   getModelJson("all_models.json")
  //     .then(response => {
  //       this.setState({models: {response}})
  //       });
  //       console.log(this.state);
  // }

  
  openCreatePanel = () => {
    this.setState({openCreatePanel: true})
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
    var joinModels = {"models": selectedModels, "editing": false};
    this.setState(prevState => ({
      joins: [...prevState.joins, joinModels]
    }));
  }

  editJoin = (join) => {
    console.log("edit join");
    console.log(join);
    this.setState(prevState => ({
      joins: prevState.joins.filter(joins => joins !== join) 
    }));
    const newJoin = Object.assign({}, join);
            newJoin.editing = true;
    this.setState(prevState => ({
      joins: [...prevState.joins, newJoin]
    }));
  }

  saveEditedJoin = (join, editedJoin) => {
    console.log("saving join...");
    console.log("edit join");
    console.log(join);
    console.log(editedJoin);
    this.setState(prevState => ({
      joins: prevState.joins.filter(joins => joins !== join) 
    }));
    const newJoin = Object.assign({}, editedJoin);
            newJoin.editing = false;
    this.setState(prevState => ({
      joins: [...prevState.joins, newJoin]
    }));
  }

  removeJoin = (join) => {
    console.log(this.state.joins);
    console.log(join);
    this.setState(prevState => ({ joins: prevState.joins.filter(joins => joins !== join) }));
    console.log(this.state.joins);
  }
  

  render() {
    return (
        <div id="main">
        <NavBar openCreatePanel={this.openCreatePanel} createJoin={this.createJoin}></NavBar>
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
        <Collapse in={ this.state.openCreatePanel } timeout={2000} dimension={'width'}>
            <div>
          <div id="createModelSideBar" className="sidePanelContent">
            <div className="sideBarExitButton">
              <XCircle onClick={() => this.setState({openCreatePanel: false})}></XCircle>
            </div>
            <NewModel selectedModels={ this.state.selectedModels } models={this.state.models}></NewModel>
          </div>
          </div>
          </Collapse>
          <JoinElements 
            joins={this.state.joins}
            removeJoin={this.removeJoin}
            models={this.state.models}
            forceReload={this.forceReload}
            editJoin={this.editJoin}
            saveEditedJoin={this.saveEditedJoin}
          ></JoinElements>
          </div>
          
    );
  }
}

export default App;
