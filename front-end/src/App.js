import React, { Component } from 'react';
import {Collapse, Container, Row, Col } from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import JsonFilenameInput from './components/JsonFilenameInput'
import { Models } from './components/Models'
import { Conditions } from './components/Conditions'
import { Selects } from './components/Selects'
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
    showColumns: true,
    conditions: [],
    clicked: false,
    contextMenuOpen: false,
    highlightedColumns: []
  }

  toggleJoinModal = (joinNum) => {
    this.setState({showJoinModal: joinNum})
  }

  
  openSQLPanel = () => {
    this.setState({openSQLPanel: true})
  }

  // componentDidUpdate() {
  //   console.log("componentDidUpdate");
  //   if(this.state.clicked===true && this.state.contextMenuOpen===true) {
  //     console.log("clicked");
  //     this.setState({clicked: false});
  //     this.setState({contextMenuOpen: false})
  //   }
  // }

  componentDidMount() { // on load
    getModelJson('all_models.json')
      .then(response => {
        this.setState({models: {response}});
        this.setState({conditions: response.conditions});
    });
  }

  saveEditedModel = (previousModel, newModel) => {
    // console.log("saveEditedModel");
    // console.log(previousModel);
    // console.log(newModel);
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

  
  addCondition = (condition) => {
    // console.log("addCondition")
    // console.log(condition);
  }

  editCondition = (oldCondition, newCondition) => {
    // console.log("editCondition")
    // console.log(oldCondition);
    // console.log(newCondition);
    
    this.setState({conditions: [...this.state.conditions.filter(conditions => conditions !== oldCondition), newCondition]});
  
  }

  removeCondition = (condition) => {
    // console.log("removeCondition")
    // console.log(condition);
    this.setState(prevState => ({
      conditions: prevState.conditions.filter(conditions => conditions !== condition) 
    }));
  }

  // this function reorders items on dragdrop
  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  handleAllClicks = (e) => {
    if(this.state.contextMenuOpen===true) {
      this.setState({clicked: true,contextMenuOpen: true});
    }
  }

  contextMenuOpen = (openState) => {
    if(openState===true) {
      this.setState({contextMenuOpen: true});
    } else {
      this.setState({contextMenuOpen: false, clicked: false});
    }
  }

  highlightColumn = (columnsToHighlight) => {
    // console.log("highlightColumn");
    // console.log(columnsToHighlight);
    this.setState({highlightedColumns: columnsToHighlight});
  }

  modelDragEnd = (result) => {
    // dropped outside the list
    // console.log("Start of modelDragEnd");
    //   console.log(result);
    if (!result.destination) {
      return;
    }
    if (result.destination.index===result.source.index) {
      return;
    }
    // console.log("got past checks");
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
    // console.log("Fixed Models");
    // console.log(fixedModels);
    var tempJoinConditions = fixedModels[result.source.index].joinConditions;
    fixedModels[result.source.index].joinConditions = fixedModels[result.destination.index].joinConditions;
    fixedModels[result.destination.index].joinConditions = tempJoinConditions;
    // console.log(fixedModels[result.source.index]);
    if(fixedModels[result.source.index].joinConditions) {
      fixedModels[result.source.index].joinConditions = reorderJoinConditions(fixedModels[result.source.index].joinConditions);
    } else {
      fixedModels[result.destination.index].joinConditions = reorderJoinConditions(fixedModels[result.destination.index].joinConditions);
    }
    // console.log(fixedModels);
    this.setState({models: {...this.state.models, "response": {...this.state.models.response, "models":  fixedModels}}});
    }
  

  render() {
    return (
        <div id="main" onClick={this.handleAllClicks} onContextMenu={this.handleAllClicks}>
          <NavBar addModel={this.addModel} logState={this.logState} openSQLPanel={this.openSQLPanel}></NavBar>
          <Container fluid>
            <Row>
              <Col>
                <div className="modelList">
                  <Models 
                    models={this.state.models} 
                    modelDragEnd={this.modelDragEnd}
                    showColumns={this.state.showColumns}
                    saveEditedModel={this.saveEditedModel}
                    toggleJoinModal = { this.toggleJoinModal }
                    showJoinModal = {this.state.showJoinModal}
                    highlightedColumns = {this.state.highlightedColumns}
                  />
                </div>
              </Col>
              <Col>
                <div className="conditionList">
                  <Conditions 
                      models={this.state.models} 
                      conditions={this.state.conditions}
                      addCondition={this.addCondition}
                      editCondition={this.editCondition}
                      removeCondition={this.removeCondition}
                      clicked={this.state.clicked}
                      contextMenuOpen={this.contextMenuOpen}
                    />
                </div>
                </Col>
                <Col>
                <div className="outputList">
                  <Selects
                    models={this.state.models}
                    highlightColumn={this.highlightColumn}
                  />
                </div>
              </Col>
            </Row>
          </Container>
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
