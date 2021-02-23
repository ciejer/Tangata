import React from 'react'
import Collapse from 'react-bootstrap/Collapse';
export const NavBar = ({openCreatePanel}) => {
    return(
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">SQL GUI</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
            <div className="nav-item nav-link active" role="button" onClick={() => openCreatePanel()}>Create Model </div>
            {/* <a class="nav-item nav-link active" href="#">Home <span class="sr-only">(current)</span></a>
            <a class="nav-item nav-link" href="#">Features</a>
            <a class="nav-item nav-link" href="#">Pricing</a>
            <a class="nav-item nav-link disabled" href="#">Disabled</a> */}
            </div>
        </div>
    </nav>
    )
}
