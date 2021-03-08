import React, { Component } from 'react';
import {Collapse, Container, Row, Col } from 'react-bootstrap';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import ModelBuilder from './components/ModelBuilder'
import { NavBar } from './components/NavBar'

class App extends Component {
  constructor(props) {
    super(props);
    this.modelBuilder = React.createRef();
  }
  state = {
    modelBuilder: {
      "active": true,
      "models": [{"name": "humans"},{"name":"abductions"}],
      "logState": false,
      "openSQLPanel": false
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
      <>
        <NavBar 
          addModel={this.addModel}
          logState={this.logState}
          openSQLPanel={this.openSQLPanel}/>
        <ModelBuilder
          modelBuilder={this.state.modelBuilder}
          ref={this.modelBuilder}
          logState={this.state.logState}
          openSQLPanel={this.state.openSQLPanel}
        />
      </>
          
    );
  }
}

export default App;
