import React, { Component } from 'react';
import {Collapse, Container, Row, Col } from 'react-bootstrap';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import ModelBuilder from './components/ModelBuilder';
import { NavBar } from './components/NavBar';
import Catalog from './components/Catalog';
import { getModel } from './services/getModel';

class App extends Component {
  constructor(props) {
    super(props);
    this.modelBuilder = React.createRef();
  }
  state = {
    appState: "Catalog",
    modelBuilder: {
      "models": [{"name": "humans"},{"name":"abductions"}],
      "logState": false,
      "openSQLPanel": false,
      "addModel": {}
    },
    contextMenuOpen: false,
    catalogModel: {}
  }
  

  handleAllClicks = (e) => {
    console.log("handleAllClicks");
    if(this.state.contextMenuOpen===true) {
      this.setState({contextMenuOpen: false});
    }
  };

  // addModelToModelBuilder = (nodeId) => {

  //   this.setState({modelBuilder: {...this.state.modelBuilder, "addModel": 
  // }

  selectModel = (nodeId) => {
    // console.log("selectModel");
    // console.log(nodeId);
    getModel(nodeId)
      .then(response => {
        // console.log(response)
        if(this.state.appState === "Catalog") {
          this.setState({"catalogModel":response})
        }
      });
  }

  openContextMenu = (openState) => {
    // console.log("openContextMenu");
    if(openState===true) {
      this.setState({contextMenuOpen: true});
    } else {
      this.setState({contextMenuOpen: false});
    }
  }

  logState = () => {
    this.setState({"logState": true})
  }
  openSQLPanel = () => {
    this.setState({"openSQLPanel": true})
  }

  addModel = () => {
    console.log("Not yet implemented"); //TODO: add input model from catalog
  }

  openModelBuilder = () => {
    this.setState({"appState": "ModelBuilder"})
  }

  openCatalog = () => {
    this.setState({"appState": "Catalog"})
  }

  componentDidUpdate() {
    if(this.state.logState === true) {
      console.log("App State:");
      console.log(this.state);
      this.setState({"logState": false})
    }
    if(this.state.openSQLPanel === true) this.setState({"openSQLPanel": false});
  }

  render() {
    return (
      <div id="main" onClick={this.handleAllClicks} onContextMenu={this.handleAllClicks}>
        <NavBar
          addModel={this.addModel}
          logState={this.logState}
          openSQLPanel={this.openSQLPanel}
          openModelBuilder={this.openModelBuilder}
          openCatalog={this.openCatalog}
          appState={this.state.appState}
          openContextMenu={this.openContextMenu}
          contextMenuOpen={this.state.contextMenuOpen}
          selectModel={this.selectModel}
          />
          <div className="body">
          <ModelBuilder
            modelBuilder={this.state.modelBuilder}
            ref={this.modelBuilder}
            logState={this.state.logState}
            openSQLPanel={this.state.openSQLPanel}
            appState={this.state.appState}
            openContextMenu={this.openContextMenu}
            contextMenuOpen={this.state.contextMenuOpen}
          />
          <Catalog
            appState={this.state.appState}
            catalogModel={this.state.catalogModel}
            selectModel={this.selectModel}
          />
          </div>
        </div>
    );
  }
}

export default App;
