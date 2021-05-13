import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Tabs, Tab, TabContainer} from "react-bootstrap";
import { postLoginUser } from "../services/postLoginUser";
import { postRegisterUser } from "../services/postRegisterUser";
import { refreshMetadata } from "../services/refreshMetadata";
import { getUserConfig } from "../services/getUserConfig";
// import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  function validateLoginForm() {
    return email.length > 0 && password.length > 0;
  }
  function validateRegisterForm() {
    return email.length > 0 && password.length > 0 && firstName.length > 0;
  }

  function handleLogin(event) {
    event.preventDefault(); //stop the click catcher
    var loginBody = {"user": {"email": email, "password": password}};
    postLoginUser(loginBody)
        .then(response => {
            props.setUser(response);
            sessionStorage.setItem("user", JSON.stringify(response));
            refreshMetadata(response.user);
            getUserConfig(response.user)
                .then(response => {
                    props.setUserConfig(response.user);
                }
            );
        }
    );
    
  }

  function handleRegister(event) {
    event.preventDefault(); //stop the click catcher
    var registerBody = {"user": {"email": email, "password": password, "config": {"firstname": firstName, "lastname": lastName}}};
    postRegisterUser(registerBody)
        .then(response => {
            props.setUser(response);
            sessionStorage.setItem("user", JSON.stringify(response));
            refreshMetadata(response.user);
            getUserConfig(response.user)
                .then(response => {
                    props.setUserConfig(response.user);
                }
            );
        }
    );
    
  }

  return (
    <div className="Login">
      <Tabs defaultActiveKey="login" id="loginOrRegister">
        <Tab eventKey="login" title="Login">
          <Form onSubmit={handleLogin}>
            <Form.Group size="lg" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateLoginForm()}>
              Login
            </Button>
          </Form>
        </Tab>
        <Tab eventKey="register" title="Sign Up">
          <Form onSubmit={handleRegister}>
            <Form.Group size="lg" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateRegisterForm()}>
              Sign Up
            </Button>
          </Form>
        </Tab>
      </Tabs>
      
    </div>
  );
}