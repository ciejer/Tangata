import React, { Component } from 'react';
import {Container, Tabs, Tab, Accordion, Card, Button } from 'react-bootstrap';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class Catalog extends Component {

  catalogDescription = () => {
    if(this.props.catalogModel.description) {
      return(
        <div className="col col-md-auto">
          {this.props.catalogModel.description}
        </div>
      );
    } else {
      return(
        <div className="col col-md-auto">
          This model does not yet have a description. In future releases, this will be editable here.
        </div>
      );
    };
  }

  catalogColumns = () => {
    const columnRows = () => {
      return Object.entries(this.props.catalogModel.columns).map((value) => {
        const testList = (tests) => {
          // console.log(tests);
          return tests.map((key,value) => {
            // console.log(key);
            // console.log(value);
            if(key.type==="relationships") {
              return (
                <div key="key" className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
                  is found in {key.related_model}.{key.related_field}
                </div>
              )
            }
            return (
              <div key="key" className={"test-"+key.severity.toLowerCase()} title={"On fail: "+key.severity}>
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
                {this.catalogDescription()}
            </div>
            <Accordion className="mt-md-5">
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
