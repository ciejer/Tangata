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
    selects: [],
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
        var selects = [];
        for(var modelIndex=0;modelIndex < response.models.length;modelIndex++) {
          for(var columnIndex=0;columnIndex<response.models[modelIndex].columns.length;columnIndex++) {
            var columnUsedToJoin = false;
            for(var joinModelIndex=0;joinModelIndex<response.models.length;joinModelIndex++) {
              if('joinConditions' in response.models[modelIndex] && typeof response.models[modelIndex].joinConditions !== 'undefined') {
                // console.log(models.response.models[modelIndex]);
                for(var joinConditionIndex=0;joinConditionIndex<response.models[modelIndex].joinConditions.length;joinConditionIndex++) {
                  if(
                    response.models[modelIndex].name===response.models[modelIndex].joinConditions[joinConditionIndex].conditionField1.model
                    && response.models[modelIndex].columns[columnIndex]===response.models[modelIndex].joinConditions[joinConditionIndex].conditionField1.column
                  ) {
                    columnUsedToJoin = true;
                  }
                }
              }
                  
            }
            if(!columnUsedToJoin) {
              selects.push({"inputColumns": [{"column": response.models[modelIndex].columns[columnIndex],"model": response.models[modelIndex].name}],"alias": response.models[modelIndex].columns[columnIndex]});
            }
          }
        }
        this.setState({selects: selects});
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


  editCondition = (oldCondition, newCondition) => {
      // console.log("editCondition")
      // console.log(oldCondition);
      // console.log(newCondition);
      // console.log(this.state.conditions);
    
    if(newCondition === null) { //Removing a select:
      this.setState({conditions: [...this.state.conditions.filter(conditions => conditions !== oldCondition)]});
    } else if (oldCondition === null) { //Adding a select
      this.setState({conditions: [...this.state.conditions, newCondition]});
    } else {
      var conditionToEditIndex = -1;
      for(var conditionIndex=0;conditionIndex<this.state.conditions.length;conditionIndex++) {
        if(this.state.conditions[conditionIndex] === oldCondition) {
          conditionToEditIndex = conditionIndex;
        }
      }
      let conditions = [...this.state.conditions];
      let condition = {...conditions[conditionToEditIndex]};
      condition = newCondition;
      conditions[conditionToEditIndex] = condition;
      this.setState({conditions: conditions});
    }
  
  }


  editSelect = (oldSelect, newSelect) => {
    console.log("editSelect")
    console.log(oldSelect);
    console.log(newSelect);
    console.log(this.state.selects);
    
    if(newSelect === null) { //Removing a select:
      this.setState({selects: [...this.state.selects.filter(selects => selects !== oldSelect)]});
    } else if (oldSelect === null) { //Adding a select
      this.setState({selects: [...this.state.selects, newSelect]});
    } else {
      var selectToEditIndex = -1;
      for(var selectIndex=0;selectIndex<this.state.selects.length;selectIndex++) {
        if(this.state.selects[selectIndex] == oldSelect) {
          selectToEditIndex = selectIndex;
        }
      }
      let selects = [...this.state.selects];
      let select = {...selects[selectToEditIndex]};
      select = newSelect;
      selects[selectToEditIndex] = select;
      this.setState({selects: selects});
    }
  
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
    console.log("contextMenuOpen");
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
                    clicked={this.state.clicked}
                    contextMenuOpen={this.contextMenuOpen}
                    editSelect={this.editSelect}
                  />
                </div>
              </Col>
              <Col>
                <div className="conditionList">
                  <Conditions 
                      models={this.state.models} 
                      conditions={this.state.conditions}
                      editCondition={this.editCondition}
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
                    selects={this.state.selects}
                    editSelect={this.editSelect}
                    clicked={this.state.clicked}
                    contextMenuOpen={this.contextMenuOpen}
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
