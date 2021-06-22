/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

import '.././Navbars/index.css'

function Header({ color, image, routes }) {
  const location = useLocation();
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  return (
    <div>
      <div class="row">
        <div class="col-xs-0 col-sm-0 col-md-0 col-lg-7 color">
        </div>
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-5 color">
        <Navbar expand="lg" className={
                          window.innerWidth <= 990
                            ? 'menu color'
                            : 'menu1 color'
                        }>
        <Container fluid >
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2 top">
            <span class="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="nav mr-auto" navbar>
              {routes.map((prop, key) => {
                if (!prop.redirect)
                  return (
                    <div >
                      <li
                        className={
                          prop.upgrade
                            ? "active active-pro"
                            : activeRoute(prop.layout + prop.path)
                        }
                        key={key}
                      >
                        <NavLink
                          to={prop.layout + prop.path}
                          className="nav-link"
                          activeClassName="active"
                        >
                          <i className={prop.icon} />
                          <p>{prop.name}</p>
                        </NavLink>
                      </li>
                    </div>
                  );
                return null;
              })}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      </div>
    </div>
     
    </div>

  );
}

export default Header;
