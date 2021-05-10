import {Button, Form, Tabs, Tab, TabContainer } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import { postUserConfig } from "../services/postUserConfig";
export default function Config(props) {
  const [copySuccess, setCopySuccess] = useState('');
  const sshKeyRef = useRef(null);
  function copyToClipboard(e) {
    sshKeyRef.current.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess('Copied!');
  };


  console.log(props.userConfig);
  function updateConfigValue(newValue, updatedField) {
    var newConfig = {...props.userConfig};
    newConfig[updatedField] = newValue;
    props.setUserConfig(newConfig);
    postUserConfig(props.user, newConfig);
  }
  if(props.appState === "Config") {
    return (
      <div className="container mt-3">
        <h1>Config</h1>
        <Tabs defaultActiveKey="userdetails" id="config">
          <Tab eventKey="userdetails" title="User Details" className="border-right border-left border-bottom p-3">
            <Form>
              {/* <Form.Group size="lg" controlId="loginEmail"> //let's not change email addresses for now.
                <Form.Label>Email</Form.Label>
                <Form.Control
                  autoFocus
                  type="email"
                  value={props.user.email}
                  onChange={(e) => updateConfigValue(e.target.value, "email")}
                />
              </Form.Group> */}
              <Form.Group size="lg" controlId="firstname">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={props.userConfig.firstname}
                  onChange={(e) => updateConfigValue(e.target.value, "firstname")}
                />
              </Form.Group>
              <Form.Group size="lg" controlId="lastname">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={props.userConfig.lastname}
                  onChange={(e) => updateConfigValue(e.target.value, "lastname")}
                />
              </Form.Group>
            </Form>
          </Tab>
          <Tab eventKey="gitConfig" title="Git Config" className="border-right border-left border-bottom p-3">
            <Form>
              <Form.Group size="lg" controlId="gitSSHKey">
                <Form.Label>SSH Key</Form.Label>
                <br/>
                <Button
                  variant="primary"
                  onClick={(e) => {e.stopPropagation(); props.setSSHKey()}}
                  className="m-1"
                >
                  Get current SSH public key
                </Button>
                <Button
                  variant="warning"
                  className="m-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    let checkIntent = prompt("This will delete any current SSH keys. Please type 'New Key' to continue");
                    if(checkIntent === "New Key") {
                      props.generateSSHKey()
                    }
                  }}
                >
                  Create new SSH Key
                </Button>
                <Form.Control
                  autoFocus
                  as="textarea"
                  rows={6}
                  value={props.sshKey}
                  ref={sshKeyRef}
                  // onChange={(e) => setEmail(e.target.value)}
                />
                {
                /* Logical shortcut for only displaying the 
                    button if the copy command exists */
                document.queryCommandSupported('copy') &&
                  <div>
                    <Button variant="primary" onClick={copyToClipboard} className="m-1">Copy</Button> 
                    {copySuccess}
                  </div>
                }
                <Form.Text id="gitSSHHelpBlock" muted>
                  Where to add your key:<br/>
                  <a href="https://github.com/settings/ssh/new">GitHub SSH Keys - Add New</a><br/>
                  <a href="https://gitlab.com/profile/keys">GitLab SSH Keys - Add an SSH key</a><br/>
                </Form.Text>
              </Form.Group>
              <Form.Group size="lg" controlId="gitrepo">
                <Form.Label>Git SSH URL</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={props.userConfig.gitrepo || ''}
                  onChange={(e) => updateConfigValue(e.target.value, "gitrepo")}
                />
                <Form.Text id="gitSSHHelpBlock" muted>
                  Examples:<br/>
                  git@github.com:yourname/yourproject.git<br/>
                  git@gitlab.com:yourname/yourproject.git
                </Form.Text>
              </Form.Group>
                <Button
                  variant="primary"
                  className="m-1"
                  onClick={(e) => {e.stopPropagation(); props.openGitConnection()}}
                >
                  Clone Git Repository
                </Button>
            </Form>
          </Tab>
          {/* <Tab eventKey="password" title="Change Password" className="border-right border-left border-bottom p-3">
          <Form>
              <Form.Group size="lg" controlId="loginPassword">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  // onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group size="lg" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  // onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group size="lg" controlId="repeatNewPassword">
                <Form.Label>Repeat New Password</Form.Label>
                <Form.Control
                  type="password"
                  // onChange={(e) => setPassword(e.target.value)}
                />`
              </Form.Group>
            </Form>
          </Tab> */}
        </Tabs>
      </div>
    );
  } else {
    return("");
  }
}