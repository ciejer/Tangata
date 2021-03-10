import React, { Component } from 'react';
import {Container } from 'react-bootstrap';
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
    console.log("catalogColumns");
    const columnRows = () => {
      return Object.entries(this.props.catalogModel.columns).map((value) => {
        console.log(value);
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
          </tr>
        );
      });
    }
    if(Object.keys(this.props.catalogModel.columns).length > 0) { //if this has columns
      console.log("this has columns");
      return(
        <div className="row mt-md-3">
          <div className="col">
            <h5>Columns:</h5>
            <table className="table">
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
                </tr>
              </thead>
            {columnRows()}
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
      return (
          <Container className="catalogContainer display-block">
            <div className="row justify-content-md-left">
              <div className="col col-md-auto">
                <h3 className="mb-md-0">{this.props.catalogModel.metadata.name.toLowerCase()}</h3>
              </div>
              {/* <div className="col font-italic align-self-end">
                {this.props.catalogModel.config.materialized} --waiting for Manifest
              </div> */}
            </div>
            <div className="row mt-md-3">
                {this.catalogDescription()}
            </div>
            {this.catalogColumns()}
          </Container>
            
      );
    }
  }
}

export default Catalog;
