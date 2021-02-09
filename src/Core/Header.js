import React from 'react';
import {Link} from 'react-router-dom';

function Header() {
  return (
    // <div className="text-white container">
      <nav className="container navbar navbar-expand-md navbar-dark pt-2">
        <Link to="/" className="navbar-brand display-1"><h1>NurlanDev</h1></Link>
        <button type="button" className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
            <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ml-auto">
                <Link to="/skills" className="nav-item nav-link h5">Skills</Link>
                <Link to="/projects" className="nav-item nav-link h5">Projects</Link>
                <Link to="/contacts" className="nav-item nav-link h5">Contacts</Link>
            </div>
        </div>
    </nav>
    // </div>
  );
}

export default Header;