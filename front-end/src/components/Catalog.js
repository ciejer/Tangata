import React, { Component, useState } from 'react';
import {Container, Tabs, Tab, Accordion, Card, Button, Modal } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import  LayoutFlow  from './Lineage';
import ContentEditable from 'react-contenteditable'

class Catalog extends Component {

  catalogDescription = () => {
    if(this.props.catalogModel.description) {
      return this.props.catalogModel.description;
    } else {
      return "This model does not yet have a description. In future releases, this will be editable here.";
    };
  }

  catalogDependsOn = () => {
    // console.log("this.props.catalogModel.depends_on");
    // console.log(this.props.catalogModel.depends_on);

    const ancestorModels = () => this.props.catalogModel.depends_on.nodes.map((value,index) => {
      return(
        <div key={"catalogDependsOnModel"+index} title={value}>
          {index===0?(<b>Models:<br/></b>):null}
          {value.split(".").pop()}
        </div>
      )
    });
    const ancestorMacros = () => this.props.catalogModel.depends_on.macros.map((value,index) => {
      return(
        <div key={"catalogDependsOnMacro"+index} title={value}>
          {index===0?(<b>Macros:<br/></b>):null}
          {value.split(".").pop()}
        </div>
      )
    });
    return (
      <>
        {ancestorModels()}
        {ancestorMacros()}
      </>
    )
  }

  catalogDependencies = () => {
    // console.log("this.props.catalogModel.referenced_by");
    // console.log(this.props.catalogModel.referenced_by);

    const dependentModels = () => this.props.catalogModel.referenced_by.map((value,index) => {
      return(
        <div key={"catalogDependentModel"+index} title={value}>
          {index===0?(<b>Models:<br/></b>):null}
          {value.split(".").pop()}
        </div>
      )
    });
    return (
      <>
        {dependentModels()}
      </>
    )
  }

  

  catalogColumns = () => {

    const columnRows = () => {
      return Object.entries(this.props.catalogModel.columns).map((value,index) => {
        const testList = (tests) => {
          // console.log(tests);
          return tests.map((key,testIndex) => {
            // console.log(key);
            // console.log(value);
            if(key.type==="relationships") {
              return (
                <div key={"catalogTest"+index+"."+testIndex} className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
                  is found in {key.related_model}.{key.related_field}
                </div>
              )
            }
            return (
              <div key={"catalogTest"+index+"."+testIndex} className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
                {key.type}
              </div>
            )
          })
        }
        return(
          <tr key={"columnRow"+value[0]}>
            <td>
              {value[0].toLowerCase()}
            </td>
            <td>
              {value[1].type.toLowerCase()}
            </td>
            <td>
              {value[1].comment}
            </td>
            <td>
              {testList(value[1].tests)}
            </td>
          </tr>
        );
      });
    }
    if(Object.keys(this.props.catalogModel.columns).length > 0) { //if this has columns
      return(
        <div className="row mt-md-3">
          <div className="col">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>
                    Name
                  </th>
                  <th>
                    Type
                  </th>
                  <th>
                    Description
                  </th>
                  <th>
                    Tests
                  </th>
                </tr>
              </thead>
              <tbody>
                {columnRows()}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return(
        <div className="row">
          <div className="col col-md-auto">
            This model does not appear to contain any rows.
          </div>
        </div>
      );
    };
  }

  updateMetadata = (e) => {
    console.log("updateMetadata");
    console.log(e);
    console.log(e.target.dataset.metadatafield);
    console.log(e.target.innerText);
    console.log(this.props.catalogModel.yaml_path);
    console.log(this.props.catalogModel.model_path);
    var metadataBody = {};
    switch(e.target.dataset.metadatafield) {
      case "Description":
        metadataBody = {
          "updateMethod": "yamlModelProperty",
          "yaml_path": this.props.catalogModel.yaml_path,
          "model": this.props.catalogModel.nodeID,
          "property_name": "description",
          "new_value": e.target.innerText
        }
        fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/update_metadata', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadataBody)
        });
      break;
      default:
        console.log("updateMetadata: no switch case found");
    }
  }

  lineageModal = (lineage) => {
    function LineageModal(lineage) {
      const [show, setShow] = useState(false);
    
      const handleClose = () => setShow(false);
      const handleShow = () => setShow(true);
      // console.log("lineageModal");
      // console.log(lineage);
    
      return (
        <>
          <Button variant="primary" onClick={handleShow}>
            Show Lineage
          </Button>
    
          <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body className="lineagebox">
              <LayoutFlow className="lineagebox" lineageArray={lineage}/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
    }
    return <LineageModal lineage={lineage}/>
  }

  render() {
    if(this.props.appState !== "Catalog") return null;
    if(Object.keys(this.props.catalogModel).length === 0) { //Default catalog screen
      return (
        <div>
          Welcome to the Catalog. Search in the bar above to find models.
        </div>
      );
    } else {
      const tags = this.props.catalogModel.tags.join(", ")
      return (
          <Container className="catalogContainer display-block">
            <div className="row justify-content-md-left">
              <div className="col col-md-auto pr-md-3">
                <h3 className="mb-md-0">{this.props.catalogModel.name.toLowerCase()}</h3>
              </div>
              <div className="col font-italic align-self-end pl-md-0">
                {this.props.catalogModel.materialization}
              </div>
              <div className="col align-self-end pl-md-0 text-right">
                tags: <i>{tags}</i>
              </div>
            </div>
            <div className="row justify-content-between pt-md-1">
              <div className="col col-md-auto">
                {this.props.catalogModel.database.toLowerCase()}.{this.props.catalogModel.schema.toLowerCase()}.{this.props.catalogModel.name.toLowerCase()}
              </div>
              <div className="col col-md-auto">
                {this.props.catalogModel.row_count?Number(this.props.catalogModel.row_count).toLocaleString()+" rows":null}
              </div>
            </div>
            <div className="row mt-md-3">
                <ContentEditable
                  innerRef={this.description}
                  html={this.catalogDescription()}
                  onBlur={this.updateMetadata}
                  data-metadatafield="Description"
                />
            </div>
            <div className="row mt-md-3">
              <div className="col col-md-auto">
                {this.lineageModal(this.props.catalogModel.lineage)}
              </div>
            </div>
            <Accordion className="mt-md-3" defaultActiveKey="0">
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="0">
                    Columns
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <div className="container">
                    {this.catalogColumns()}
                  </div>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    SQL
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <div className="container">
                    <div className="row mt-md-3 mb-md-3">
                      <div className="col col-md-auto">
                        <Tabs defaultActiveKey="raw" id="uncontrolled-tab-example" className="ml-md-1">
                          <Tab eventKey="raw" title="raw SQL" className="py-md-3 catalogSQL">
                            {this.props.catalogModel.raw_sql}
                          </Tab>
                          <Tab eventKey="processed" title="processed SQL" className="py-md-3 catalogSQL">
                            {this.props.catalogModel.compiled_sql}
                          </Tab>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="2">
                    Depends On
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                  <div className="container">
                    <div className="row mt-md-3 mb-md-3">
                      <div className="col col-md-auto">
                        {this.catalogDependsOn()}
                      </div>
                    </div>
                  </div>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="3">
                    Dependencies
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="3">
                  <div className="container">
                    <div className="row mt-md-3 mb-md-3">
                      <div className="col col-md-auto">
                        {this.catalogDependencies()}
                      </div>
                    </div>
                  </div>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Container>
            
      );
    }
  }
}

export default Catalog;
