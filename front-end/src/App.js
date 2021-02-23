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

class App extends Component {
  
  state = {
    model: {},
    models: [],
    numberOfModels: 0,
    openCreatePanel: false,
    selectedModels: [],
    modelIsDragging: 0
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

  componentDidMount() { // on load
    getModelJson('all_models.json')
      .then(response => {
        this.setState({models: {response}})
        console.log(this.state);
    });
  }

  selectModel = (e) => {

    console.log(e);
    var currentSelectionIndex = this.state.selectedModels.indexOf(e)
    if (currentSelectionIndex !== -1) {
      this.setState(prevState => ({ selectedModels: prevState.selectedModels.filter(selectedModels => selectedModels !== e) }));
    } else {
      this.setState(prevState => ({
        selectedModels: [...prevState.selectedModels, e]
      }))
    }
    console.log(this.state.selectedModels);

      /* TODO: stop select events on drag */
  }

  render() {
    return (
        <div id="main">
        <NavBar openCreatePanel={this.openCreatePanel}></NavBar>
        <div className="row">
          {/* <JsonFilenameInput 
            onChangeForm={this.onChangeForm}
            getModelJson={this.getModelJson}
            JsonFilenameInput={this.JsonFilenameInput}
            >
          </JsonFilenameInput> */}
          <div className="col">
          <DisplayModel models={this.state.models} selectModel={this.selectModel} selectedModels={this.state.selectedModels}></DisplayModel>
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
          </div>
          
          
    );
  }
}

export default App;
