import React, { Component } from 'react';
import {Collapse, Container, Row, Col } from 'react-bootstrap';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import Login from './components/Login';
import Config from './components/Config';
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
    catalogModel: {},
    user: {},
    userConfig: {}
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
    getModel(nodeId, this.state.user)
      .then(response => {
        // console.log(response)
        if(!response.error) {
          if(this.state.appState === "Catalog") {
            this.setState({"catalogModel":response})
          }
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

  openConfig = () => {
    this.setState({"appState": "Config"})
  }

  componentDidUpdate() {
    if(this.state.logState === true) {
      console.log("App State:");
      console.log(this.state);
      this.setState({"logState": false})
    }
    if(this.state.openSQLPanel === true) this.setState({"openSQLPanel": false});
  }
  componentDidMount() {
    if(Object.keys(this.state.user).length === 0) {
      if(sessionStorage.getItem("user")) {
        this.setUser(JSON.parse(sessionStorage.getItem("user")))
      }
      if(sessionStorage.getItem("userconfig")) {
        this.setUserConfig(JSON.parse(sessionStorage.getItem("userconfig")))
      }
    }
  }

  setUser = (newUser) => {
    this.setState({"user": newUser.user})
  }
  setUserConfig = (newUserConfig) => {
    this.setState({"userConfig": newUserConfig})
  }
  

  render() {
    if(Object.keys(this.state.user).length === 0) {
      return (
        <div id="main">
          <Login
            setUser={this.setUser}
            setUserConfig={this.setUserConfig}
          />
        </div>
      )
    } else {
      return (
        <div id="main" onClick={this.handleAllClicks} onContextMenu={this.handleAllClicks}>
          <NavBar
            addModel={this.addModel}
            logState={this.logState}
            openSQLPanel={this.openSQLPanel}
            openModelBuilder={this.openModelBuilder}
            openCatalog={this.openCatalog}
            openConfig={this.openConfig}
            appState={this.state.appState}
            openContextMenu={this.openContextMenu}
            contextMenuOpen={this.state.contextMenuOpen}
            selectModel={this.selectModel}
            user={this.state.user}
            setUser={this.setUser}
            userConfig={this.state.userConfig}
            setUserConfig={this.setUserConfig}
            />
            <div className="body">
            {/* <ModelBuilder
              modelBuilder={this.state.modelBuilder}
              ref={this.modelBuilder}
              logState={this.state.logState}
              openSQLPanel={this.state.openSQLPanel}
              appState={this.state.appState}
              openContextMenu={this.openContextMenu}
              contextMenuOpen={this.state.contextMenuOpen}
              user={this.state.user}
            /> */}
            <Catalog
              appState={this.state.appState}
              catalogModel={this.state.catalogModel}
              selectModel={this.selectModel}
              user={this.state.user}
              userConfig={this.state.userConfig}
            />
            <Config
              appState={this.state.appState}
              user={this.state.user}
              userConfig={this.state.userConfig}
              setUserConfig={this.setUserConfig}
            />
            </div>
          </div>
      );
    }
  }
}

export default App;
