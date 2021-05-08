import {Button, Form, Tabs, Tab, TabContainer } from 'react-bootstrap';
import { postUserConfig } from "../services/postUserConfig";
export default function Config(props) {

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
                <Form.Control
                  autoFocus
                  type="button"
                  value="Get current SSH public key"
                  onClick={(e) => {e.stopPropagation(); props.setSSHKey()}}
                />
                <Form.Control
                  autoFocus
                  type="textarea"
                  value={props.sshKey}
                  // onChange={(e) => setEmail(e.target.value)}
                />
                <Form.Control
                  autoFocus
                  type="button"
                  value="Create new SSH key"
                  onClick={(e) => {
                    e.stopPropagation();
                    let checkIntent = prompt("This will delete your current SSH key. Please type 'New Key' to continue");
                    if(checkIntent === "New Key") {
                      props.generateSSHKey()

                    }
                  }}
                />
              </Form.Group>
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