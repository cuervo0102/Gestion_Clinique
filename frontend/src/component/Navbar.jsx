import React from "react";
import '../tooplate-style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-default navbar-static-top" role="navigation">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle"
            data-toggle="collapse"
            data-target=".navbar-collapse"
          >
            <span className="icon icon-bar"></span>
            <span className="icon icon-bar"></span>
            <span className="icon icon-bar"></span>
          </button>


          <a href="index.html" className="navbar-brand">
            <span
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                color: "#ee4379",
                fontFamily: "'Georgia', serif",
              }}
            >
              A
            </span>
            esthetic Center
          </a>
        </div>


        <div className="collapse navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a href="#top" className="smoothScroll">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="smoothScroll">
                About Us
              </a>
            </li>
            <li>
              <a href="#team" className="smoothScroll">
                Doctors
              </a>
            </li>
            <li>
              <a href="#news" className="smoothScroll">
                News
              </a>
            </li>
            <li>
              <a href="#google-map" className="smoothScroll">
                Contact
              </a>
            </li>
            <li className="appointment-btn">
              <a href="#appointment">Make an appointment</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
