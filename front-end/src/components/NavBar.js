import React from 'react'
const reactState = process.env.NODE_ENV;
export const NavBar = ({addModel, logState, openSQLPanel}) => {
    const debugLogState = (reactState) => {
        if ( reactState === 'development') {
            return(
                <div className="nav-item nav-link active" role="button" onClick={() => logState()}>Show state in console </div>
                );
        } else return null;
    }
    return(
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">SQL GUI</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
            <div className="nav-item nav-link active" role="button" onClick={() => addModel()}>Add Model </div>
            <div className="nav-item nav-link active" role="button" onClick={() => openSQLPanel()}>Open SQL Panel </div>
            {debugLogState(reactState)}
            {/* <a class="nav-item nav-link active" href="#">Home <span class="sr-only">(current)</span></a>
            <a class="nav-item nav-link" href="#">Features</a>
            <a class="nav-item nav-link" href="#">Pricing</a>
            <a class="nav-item nav-link disabled" href="#">Disabled</a> */}
            </div>
        </div>
    </nav>
    )
}

