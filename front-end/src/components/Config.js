import {Button, Form, Tabs, Tab, TabContainer } from 'react-bootstrap';
import React, { useRef, useState } from 'react';
import { postUserConfig } from "../services/postUserConfig";
import { postFileUpload } from "../services/postFileUpload";
import { refreshMetadata } from "../services/refreshMetadata";
export default function Config(props) {
  const [copySuccess, setCopySuccess] = useState('');
  const [dbtMethod, setdbtMethod] = useState('dbtLiveDB');
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

  function uploadFile(uploadedFiles, uploadType) {
    console.log(uploadedFiles[0]);
    if(uploadedFiles.length>0) {
      const uploadData = new FormData();
      uploadData.append('file', uploadedFiles[0]);
      postFileUpload(uploadData, uploadType, props.user)
      .then(response=> {
        console.log(response);
        if(response.ok === true) {
          console.log("Success");
          props.toastSender("" + uploadType + " Upload Successful.","success");
        } else {
          response.text()
          .then(responseText=> {
            console.log(response);
            console.log(responseText);
            props.toastSender("" + uploadType + " Upload Failed: \n" + responseText,"error");
          });
        }
      });
    }
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
                  rows={2}
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
          <Tab eventKey="dbtConfig" title="DBT Config" className="border-right border-left border-bottom p-3">
            <Form>
              <Form.Group size="lg" controlId="dbtConfigMethod">
                <Form.Label>dbt_ Config Method</Form.Label>
                <div key={'custom-inline-radio'} className="mb-3">
                  <Form.Check
                    custom
                    inline
                    label="Live Database Connection"
                    type='radio'
                    id={'dbtLiveDB'}
                    checked={props.userConfig.dbtmethod==="LiveDB"}
                    onClick={(e) => {e.stopPropagation(); updateConfigValue("LiveDB", "dbtmethod")}}
                  />
                  <Form.Check
                    custom
                    inline
                    label="Upload Compiled Metadata"
                    type='radio'
                    id={'dbtUploadMetadata'}
                    checked={props.userConfig.dbtmethod==="UploadMetadata"}
                    onClick={(e) => {e.stopPropagation(); updateConfigValue("UploadMetadata", "dbtmethod")}}
                  />
                </div>
              </Form.Group>
              <hr/>
              <div className={props.userConfig.dbtmethod==="LiveDB"?null:"d-none"}>
                <Form.Group size="lg" controlId="uploadProfilesYML">
                  <Form.Label>Upload Profiles.YML</Form.Label>
                  <Form.File
                    className="position-relative"
                    required
                    name="profilesYMLUpload"
                    onChange={(e) => uploadFile(e.target.files, "ProfilesYML") }
                    // isInvalid={!!errors.file}
                    // feedback={errors.file}
                    id="profilesYMLUpload"
                    feedbackTooltip
                  />
                  <Form.Text id="profilesYMLHelpBlock" muted>
                    To connect to your database, DBT requires a profiles.yml file. See <a href="https://docs.getdbt.com/dbt-cli/configure-your-profile">the dbt_ docs</a> for setup details.
                  </Form.Text>
                </Form.Group>
                <Button
                  variant="primary"
                  className="m-1"
                  onClick={(e) => {e.stopPropagation(); props.checkDBTConnection()}}
                >
                  Check DBT Connection
                </Button>
              </div>
              <div className={props.userConfig.dbtmethod==="UploadMetadata"?null:"d-none"}>
                <p><i>To run without connecting to your database, the catalog requires metadata from dbt_.<br/>
                Run <code>dbt docs generate</code> in your dbt_ project, and upload the Manifest and Catalog from /target.</i></p>
                <Form.Group size="lg" controlId="uploadManifestJSON">
                  <Form.Label>Upload manifest.json</Form.Label>
                  <Form.File
                    className="position-relative"
                    required
                    name="manifestJSONUpload"
                    onChange={(e) => uploadFile(e.target.files, "ManifestJSON") }
                    // isInvalid={!!errors.file}
                    // feedback={errors.file}
                    id="manifestJSONUpload"
                    feedbackTooltip
                  />
                </Form.Group>
                <Form.Group size="lg" controlId="uploadCatalogJSON">
                  <Form.Label>Upload catalog.json</Form.Label>
                  <Form.File
                    className="position-relative"
                    required
                    name="catalogJSONUpload"
                    onChange={(e) => uploadFile(e.target.files, "CatalogJSON") }
                    // isInvalid={!!errors.file}
                    // feedback={errors.file}
                    id="catalogJSONUpload"
                    feedbackTooltip
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  className="m-1"
                  onClick={(e) => {e.stopPropagation(); refreshMetadata(props.user);}}
                >
                  Load Metadata
                </Button>
              </div>
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