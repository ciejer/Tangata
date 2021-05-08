const express = require('express');
var spawn = require('child_process').spawn;
const app = express(),
      port = 3080;
const fs = require('fs');
var cors = require('cors');
const yaml = require('js-yaml');
const YAWN = require('yawn-yaml/cjs')
const mongoose = require('mongoose');
const { Octokit } = require("@octokit/rest");//Octokit is github api, for creating pull requests
const simpleGit = require('simple-git'); //simple-git is git client, for cloning to local, branching, and making changes where dbt can run & compile.

//Configure Mongoose for settings
mongoose.connect('mongodb://localhost/tangata');
mongoose.set('debug', true);

//Add models
require('./models/Users');
const auth = require('./routes/auth');

// load passport.js auth
require('./config/passport'); //must be last to load

const Users = mongoose.model('Users');
var whitelist = ['http://sqlgui.chrisjenkins.nz', 'http://localhost', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(express.json(), cors(corsOptions));

app.use(require('./routes/index'));

// place holder for the data
// const users = [];


const octokit = new Octokit({ 
  auth: process.env.GitHubToken, //This is set in system environment variables for now
});


var rawCatalog,catalog, rawManifest, manifest;

const populateFullCatalogNode = (nodeID, nodeOrSource) => {
  var catalogNode = catalog[nodeOrSource+"s"][nodeID];
  var manifestNode = manifest[nodeOrSource+"s"][nodeID];
  // console.log("populateFullCatalogNode");
  // console.log(nodeOrSource);
  // console.log(catalogNode);
  // console.log(manifestNode);
  var tempFullCatalogNode = {
    "name": catalogNode.metadata.name.toLowerCase(),
    "nodeID": nodeID,
    "type": catalogNode.metadata.type,
    "database": manifestNode.database.toLowerCase(),
    "schema": manifestNode.schema.toLowerCase(),
    "description": manifestNode.description,
    "owner": catalogNode.metadata.owner,
    "path": manifestNode.path,
    "enabled": manifestNode.config.enabled,
    "materialization": manifestNode.config.materialized,
    "post_hook": manifestNode.config["post-hook"],
    "pre_hook": manifestNode.config["pre-hook"],
    "tags": manifestNode.tags,
    "depends_on": manifestNode.depends_on,
    "raw_sql": manifestNode.raw_sql,
    "compiled_sql": manifestNode.compiled_sql,
    "model_type": nodeOrSource,
    "bytes_stored": catalogNode.stats.bytes?catalogNode.stats.bytes.value:null,
    "last_modified": catalogNode.stats.last_modified?catalogNode.stats.last_modified.value:null,
    "row_count": catalogNode.stats.row_count?catalogNode.stats.row_count.value:null,
    "yaml_path": manifestNode.patch_path,
    "model_path": manifestNode.original_file_path,
    "columns": {},
    "referenced_by": [],
    "lineage": []
  }
  for (const [key, value] of Object.entries(catalogNode.columns)) {
    var catalogColumnNode = value;
    var manifestColumnNode = manifestNode.columns[key];
    tempFullCatalogNode.columns[catalogColumnNode.name.toLowerCase()] = {
      "name": catalogColumnNode.name.toLowerCase(),
      "type": catalogColumnNode.type,
      "description": manifestColumnNode?manifestColumnNode.description:null,
      "tests": []
    };
  };
  return tempFullCatalogNode
};

const compileCatalogNodes = (id) => {
  
  rawCatalog = fs.readFileSync('./user_folders/'+id+'/dbt/target/catalog.json');
  catalog = JSON.parse(rawCatalog);
  rawManifest = fs.readFileSync('./user_folders/'+id+'/dbt/target/manifest.json');
  manifest = JSON.parse(rawManifest);
  var tempCatalogNodes = {};
  for (const [key, value] of Object.entries(catalog.nodes)) {
    tempCatalogNodes[key] = populateFullCatalogNode(key, "node"); //push node to model
  }
  for (const [key, value] of Object.entries(catalog.sources)) {
    tempCatalogNodes[key] = populateFullCatalogNode(key, "source"); //push node to model
  }
  for (const [key, value] of Object.entries(manifest.nodes)) {
    if(value.resource_type==="test") {
      if(value.depends_on.nodes.length===1 && value.column_name !== undefined && value.column_name !== null) {
        // console.log(value);
        // console.log(value.column_name);
        // console.log(value.depends_on.nodes[0]);
        // console.log(tempCatalogNodes[value.depends_on.nodes].columns);
        tempCatalogNodes[value.depends_on.nodes].columns[value.column_name.toLowerCase()].tests.push({"type": value.test_metadata.name,"severity": value.config.severity});
      } else if (value.test_metadata !== undefined && value.test_metadata.name === "relationships") {
        // console.log(value);
        // console.log(value.test_metadata.kwargs.model.split('\'')[1]);
        const catalogNode=Object.entries(tempCatalogNodes).filter(catalogNode => catalogNode[1].name === value.test_metadata.kwargs.model.split('\'')[1])[0]
        if(catalogNode !== undefined) {
          const catalogNodeName=catalogNode[0];
          // console.log(catalogNodeName);
          // console.log(tempCatalogNodes[catalogNodeName]);
          tempCatalogNodes[catalogNodeName].columns[value.column_name.toLowerCase()].tests.push({"type": value.test_metadata.name,"severity": value.config.severity, "related_model": value.test_metadata.kwargs.to.split('\'')[1], "related_field": value.test_metadata.kwargs.field.toLowerCase()})
        }
      }
    } 
  }
  Object.entries(tempCatalogNodes).map((catalogNode,index) => {
    if(Object.entries(catalogNode)[1][1].depends_on) {
      Object.entries(catalogNode)[1][1].depends_on.nodes.map((nodeAncestor,index) => {
        if(tempCatalogNodes[nodeAncestor]) {
          tempCatalogNodes[nodeAncestor].referenced_by.push(Object.entries(catalogNode)[1][1].nodeID);
        }
      })
        
  }
    
    });
  return tempCatalogNodes;
};


const compileSearchIndex = (catalogToIndex) => {
  var tempCatalogIndex = [];
  for (const [key, value] of Object.entries(catalogToIndex)) {
    tempCatalogIndex.push({"searchable": value.name, "nodeID": value.nodeID, "modelName": value.name, "modelDescription": value.description, "type": "model_name"}); //push the model itself
    if(value.description) tempCatalogIndex.push({"searchable": value.description, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "model_description"}) ;// model description
    // console.log(value.columns);
    for (const [columnKey, columnValue] of Object.entries(value.columns)) {
      tempCatalogIndex.push({"searchable": columnKey, "columnName": columnKey, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "column_name"}); // column name
      if(columnValue.description) tempCatalogIndex.push({"searchable": columnValue.description, "columnName":columnKey, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "column_description"}); // column name
    }
    // console.log(value.tags);
    for (const [tagKey, tagValue] of Object.entries(value.tags)) {
      tempCatalogIndex.push({"searchable": tagValue, "tagName": tagValue, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "tag_name"}); // tag name
    }
  }
  return tempCatalogIndex;
}

const getModelLineage = (fullCatalog, id) => {
  const modelLineage = (currentModel, id) => {
    var tempLineage = []
    const recurseForwardLineage = (currentRecursedModel, id) => {
      // console.log(currentRecursedModel);
      if(currentRecursedModel && currentRecursedModel.referenced_by) {
        currentRecursedModel.referenced_by.map((value) => {
          if(tempLineage.filter((item, index) => { return (item.id === currentRecursedModel.nodeID+"_"+value)}).length===0) {
            tempLineage.push({ id: currentRecursedModel.nodeID+"_"+value, source: currentRecursedModel.nodeID, target: value, animated: true }); //push edge
          }
          if(tempLineage.filter((item, index) => { return (item.id === value)}).length===0) {
            tempLineage.push({ id: value, data: { label: value.split(".").pop().replace(/_/g, '_\u200B') }, connectable: false}); //push node
          }
          recurseForwardLineage(fullCatalog[value], id);
        });
      }
    };
    const recurseBackLineage = (currentRecursedModel, id) => {
      // console.log(currentRecursedModel.name);
      if(currentRecursedModel && currentRecursedModel.depends_on && currentRecursedModel.depends_on.nodes) {
        currentRecursedModel.depends_on.nodes.map((value) => {
          if(tempLineage.filter((item, index) => { return(item.id === currentRecursedModel.nodeID+"_"+value)}).length===0) {
            tempLineage.push({ id: currentRecursedModel.nodeID+"_"+value, target: currentRecursedModel.nodeID, source: value, animated: true }); //push edge
          }
          if(tempLineage.filter((item, index) => { return(item.id === value)}).length===0) {
            tempLineage.push({ id: value, data: { label: value.split(".").pop().replace(/_/g, '_\u200B') }, connectable: false}); //push node
          }
          recurseBackLineage(fullCatalog[value], id);
        });
      }
    };
    // console.log(currentModel);
    recurseBackLineage(currentModel, id);
    tempLineage.push({ id: currentModel.nodeID, style: {"borderColor": "tomato","borderWidth": "2px"}, connectable: false, data: { label: currentModel.name.replace(/_/g, '_\u200B') }}); //push node
    recurseForwardLineage(currentModel, id);
    // return Array.from(new Set(tempLineage));
    return tempLineage.filter((item, index) => {
      // if(currentModel && currentModel.name==='litmos_learning_path_course_stage') {
      // console.log(item);
      // console.log(index);
      // console.log(tempLineage.indexOf(item));}
      return tempLineage.indexOf(item) === index;
    });
  };
  for(catalogNode in fullCatalog) {
    // console.log(fullCatalog[catalogNode]);
    if(["node", "source"].includes(fullCatalog[catalogNode].model_type)) {
      fullCatalog[catalogNode].lineage = modelLineage(fullCatalog[catalogNode], id);
    }
  }
}

const refreshMetadata = (id) => {
  if (fs.existsSync('./user_folders/'+id+'/dbt/target/catalog.json')) {
    var assemblingFullCatalog = compileCatalogNodes(id);
    var assemblingCatalogIndex = compileSearchIndex(assemblingFullCatalog);
    getModelLineage(assemblingFullCatalog, id); //this updates fullCatalog before it gets saved
    fs.writeFileSync('./user_folders/'+id+'/catalog.json', JSON.stringify(assemblingFullCatalog), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    fs.writeFileSync('./user_folders/'+id+'/catalogindex.json', JSON.stringify(assemblingCatalogIndex), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  } else {
    console.log('User Metadata does not yet exist');
  }
}

const fullCatalog = (id) => {
  if (fs.existsSync('./user_folders/'+id+'/catalog.json')) {
    return JSON.parse(fs.readFileSync('./user_folders/'+id+'/catalog.json'));
  } else {
    return {"error": "catalog.json not yet created"}
  }
}

const catalogIndex = (id) => {
  if (fs.existsSync('./user_folders/'+id+'/catalogindex.json')) {
    return JSON.parse(fs.readFileSync('./user_folders/'+id+'/catalogindex.json'));
  } else {
    return {"error": "catalogindex.json not yet created"}
  }
}

const userConfig = (id) => {
  if (fs.existsSync('./user_folders/'+id+'/user.json')) {
    return JSON.parse(fs.readFileSync('./user_folders/'+id+'/user.json'));
  } else {
    return {"error": "user.json not yet created"}
  }
}

const setUserConfig = (id, newConfig) => {
    fs.writeFileSync('./user_folders/'+id+'/user.json', JSON.stringify(newConfig), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}


// console.log(fullCatalog["model.trustpower.litmos_learning_path_course_stage"]);
// console.log(modelLineage(fullCatalog["model.trustpower.litmos_learning_path_course_stage"]));

const getModel = (modelName, id) => {
  if(Object.keys(fullCatalog(id)).length <= 0) {
    console.log("Catalog does not exist. Building...")
    refreshMetadata(id);
  }
  if(Object.keys(fullCatalog(id)).length > 0) { //if there's still no catalog
    return fullCatalog(id)[modelName];
  } else {
    return {"error": "catalog not yet created"}
  }
}

const searchModels = (searchString, id) => {
  if(catalogIndex(id).length > 0) {
    var regexp_needle = new RegExp(searchString, 'i')
    // console.log(catalogIndex(id));
    return catalogIndex(id).filter(function (v) {
      return regexp_needle.test(v.searchable)
    }).sort((a,b) =>
      (Math.abs(a.searchable.length-searchString.length)>Math.abs(b.searchable.length-searchString.length)) //Closest length match gets promted
      ?1
      :(Math.abs(a.searchable.length-searchString.length)===Math.abs(b.searchable.length-searchString.length)
        ?(
          (a.type==="model_name"?1:0)>(b.type==="model_name"?1:0) //Models get promoted
          ?-1
          :(Math.abs(a.searchable.length-searchString.length)===Math.abs(b.searchable.length-searchString.length) && (a.type==="model_name"?1:0)===(b.type==="model_name"?1:0)
            ?(
              (a.nodeDescription!==null?1:0)>(b.nodeDescription!==null?1:0) //Objects with descriptions get promoted
              ?-1
              :1
            )
            :-1
          )
        )
        :-1
      )
    );
  } else {
    return {"error": "catalog not yet created"}
  }
}

const findOrCreateMetadataYML = (yaml_path, model_path, model_name, source_schema, model_or_source, id) => {
  // console.log("findOrCreateMetadataYML");
  // console.log(yaml_path);
  // console.log(model_path);
  // console.log(model_name);

  const useSchemaYML = (id) => {
    const createNewYML = (schemaPath, modelName, source_schema) => {
      if(model_or_source==='model') {
        var newYAML = {
          version: 2,
          models: [
            {
              "name": modelName
            }
          ]
        };
      } else {
        var newYAML = {
          version: 2,
          sources: [
            {
              "name": source_schema,
              "tables": [
                {
                  "name": modelName
                }
              ]
            }
          ]
        };
      }
      
      var yamlToWrite = yaml.dump(newYAML);
      fs.writeFileSync(schemaPath, yamlToWrite, 'utf8');
      return schemaPath;
    }

    var path = './user_folders/'+id+'/dbt/'+model_path.replaceAll('\\','/');
    path = path.substr(0,path.lastIndexOf('/'));
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    const schemaPath = path+'/schema.yml'
    try {
      if (fs.existsSync(schemaPath)) {
        let currentSchemaYML = yaml.load(fs.readFileSync(schemaPath,'utf8'));
        if(model_or_source==='model') {
          if(currentSchemaYML.models.filter(model => model.name === model_name).length>0) {
            return schemaPath;
          } else {
            // console.log('pushing model');
            currentSchemaYML.models.push({
              "name": model_name
            });
            fs.writeFileSync(schemaPath, yaml.dump(currentSchemaYML), 'utf8');
          }
        } else {
          if(currentSchemaYML.sources.filter(source => source.name === source_schema).length>0 && currentSchemaYML.sources.filter(source => source.name === source_schema)[0].tables.filter(source_table => source_table.name === model_name).length>0) {
            return schemaPath;
          } else {
            if(currentSchemaYML.sources.filter(source => source.name === source_schema).length===0) { //add source and table
              // console.log('pushing source and table');
              currentSchemaYML.sources.push(
                {
                  "name": source_schema,
                  "tables": [
                    {
                      "name": model_name
                    }
                  ]
                }
              );
            } else { //add just sourcetable
              // console.log('pushing sourcetable');
              currentSchemaYML.sources.filter(source => source.name === source_schema)[0].tables.push(
                {
                  "name": model_name
                }
              );
            }
            fs.writeFileSync(schemaPath, yaml.dump(currentSchemaYML), 'utf8');
          }
        }
        return schemaPath;
      } else {
        return createNewYML(schemaPath, model_name, source_schema);
      }
    } catch(err) {
      console.log(err);
      return createNewYML(schemaPath, model_name, source_schema);
    }
  };
  // console.log(source_schema);
  // console.log(model_name);
  if(model_or_source === 'source') {
    var path = './user_folders/'+id+'/dbt/'+model_path.replaceAll('\\','/');
    // console.log(path);
    try {
      if (fs.existsSync(path)) {
        // console.log(fs.readFileSync(path,'utf8'));
        const currentSchemaYML = yaml.load(fs.readFileSync(path,'utf8'));
        // console.log(currentSchemaYML);
        // console.log(fs.existsSync(path));
        // console.log(currentSchemaYML.sources);
        if((currentSchemaYML.sources) && (currentSchemaYML.sources.filter(source => source.name === source_schema).length>0) && (currentSchemaYML.sources.filter(source => source.name === source_schema)[0].tables.filter(source_table => source_table.name === model_name).length>0)) {
          return path;
        } else {
          // console.log(currentSchemaYML.sources[0]);
          if(currentSchemaYML.sources.filter(source => source.name === source_schema).length===0) { //add source and table
            // console.log('pushing source and table');
            currentSchemaYML.sources.push(
              {
                "name": source_schema,
                "tables": [
                  {
                    "name": model_name
                  }
                ]
              }
            );
          } else { //add just sourcetable
            // console.log('pushing sourcetable');
            currentSchemaYML.sources.filter(source => source.name === source_schema)[0].tables.push(
              {
                "name": model_name
              }
            );
          }
          fs.writeFileSync(path, yaml.dump(currentSchemaYML), 'utf8');
        }
        return path;
      } else {
        return useSchemaYML(id);
      }
    } catch(err) {
      console.log(err);
      return useSchemaYML(id);
    }
  } else if(yaml_path ) {
    var path = './user_folders/'+id+'/dbt/'+yaml_path.replaceAll('\\','/');
    try {
      if (fs.existsSync(path)) {
        let currentSchemaYML = yaml.load(fs.readFileSync(path,'utf8'));
        if(currentSchemaYML.models.filter(model => model.name === model_name).length>0) {
          return path;
        } else {
          currentSchemaYML.models.push({
            "name": model_name
          });
          fs.writeFileSync(path, yaml.dump(currentSchemaYML), 'utf8');
        }
        return path;
      } else {
        return useSchemaYML(id);
      }
    } catch(err) {
      console.log(err);
      return useSchemaYML(id);
    }
  } else {
    return useSchemaYML(id);
  }
}

const checkoutChangeBranch = (id) => {
  var git = simpleGit('./user_folders/'+id+'/dbt');
  return new Promise(function(resolve, reject) {
    git.branchLocal()
    .then(branchLocal => {
      if(branchLocal.current==='master' || branchLocal.current==='main') {
        if(branchLocal.branches.currentBranch) {
          git.checkout('currentBranch')
          .then(currentBranch => {console.log("checked out"); resolve();})
        } else {
          git.checkoutLocalBranch('currentBranch')
          .then(currentBranch => {console.log("checked out"); resolve();})
        }
      } else {
        resolve();
      };
    });
  })
  
}




app.get('/api/model_old/:modelJsonFilename', auth.required, (req, res) => { //TODO: remove once new model api available
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    // TODO: Check security on all calls
    let rawmodel = fs.readFileSync('./user_folders/'+id+'/dbt/models/' + req.params.modelJsonFilename);
    let model = JSON.parse(rawmodel);
    res.json(model);
  });
});

app.get('/api/v1/models/:modelName', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    res.json(getModel(req.params.modelName, id));
  });
});

app.post('/api/v1/reload_dbt', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    console.log('Running dbt_...')
    const dbtRunner = spawn("cd ./user_folders/"+id+"/dbt && dbt docs generate --profiles-dir ../", {shell: true});
    dbtRunner.stderr.on('data', function (data) {
      console.error("dbt_ error:", data.toString());
    });
    dbtRunner.stdout.on('data', function (data) {
      // console.log("dbt_ output:", data.toString());
    });
    dbtRunner.on('exit', function (exitCode) {
      // console.log("dbt_ exited with code: " + exitCode);
      if(exitCode===0) {
        console.log('dbt_ update successful. Updating app catalog...');
        refreshMetadata(id);
        console.log('Update complete.');
      }
    });
    res.sendStatus(200);
  });
});

app.post('/api/v1/update_metadata', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    checkoutChangeBranch(id)
    .then(() => {
      console.log('Got body:', req.body);
      res.sendStatus(200);
      if(req.body.updateMethod==='yamlModelProperty') {
        const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
        // console.log(schemaYMLPath);
        // console.log("^ path that contains model yml config");
        let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
        // console.log(fs.readFileSync(schemaYMLPath,'utf8'));
        // console.log(currentSchemaYML);
        let currentSchemaYMLModel = {};
        if(req.body.node_id.split(".")[0] === 'model') {
          currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
        } else {
          currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
        }
        // console.log(currentSchemaYMLModel);
        currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
        // console.log(currentSchemaYMLModel);
        fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
      } else if(req.body.updateMethod==='yamlModelTags') {
        if(req.body.node_id.split(".")[0] === 'model') {
          let dbtProjectYMLModelPath = ['models',req.body.node_id.split(".")[1]];
          let splitModelPath = req.body.model_path.split(".")[0].split("\\");
          splitModelPath.shift();
          dbtProjectYMLModelPath = dbtProjectYMLModelPath.concat(splitModelPath);
          let dbtProjectPath = "./user_folders/"+id+"/dbt/dbt_project.yml";
          let dbtProjectYML = new YAWN(fs.readFileSync(dbtProjectPath,'utf8'));
          var jsonToInsert = "";
          for(i=0;i<dbtProjectYMLModelPath.length-1;i++) {
            jsonToInsert += "{\"" + dbtProjectYMLModelPath[i] + "\": ";
          }
          jsonToInsert += "{\"tags\": [\""+req.body.new_value.join("\",\"")+"\"]}";
          for(i=0;i<dbtProjectYMLModelPath.length-1;i++) {
            jsonToInsert += "}";
          }
          jsonToInsert = JSON.parse(jsonToInsert);
          var isObject = function(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
          }
          var mergeDeep = function(target, source) {
            let output = Object.assign({}, target);
            if (isObject(target) && isObject(source)) {
              Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                  if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                  else
                    output[key] = mergeDeep(target[key], source[key]);
                } else {
                  Object.assign(output, { [key]: source[key] });
                }
              });
            }
            return output;
          };
          dbtProjectYML.json = mergeDeep(dbtProjectYML.json, jsonToInsert);
          fs.writeFileSync(dbtProjectPath, dbtProjectYML.yaml, 'utf8', (err) => {if (err) console.log(err);});
        } else {
          const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
          // console.log(schemaYMLPath);
          // console.log("^ path that contains model yml config");
          let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
          // console.log(fs.readFileSync(schemaYMLPath,'utf8'));
          // console.log(currentSchemaYML);
          let currentSchemaYMLModel = {};
          currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
          currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
          fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
        }
      } else if(req.body.updateMethod==='yamlModelColumnProperty') {
        const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
        // console.log(schemaYMLPath);
        // console.log("^ path that contains model yml config");
        let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
        let currentSchemaYMLModel = {}
        if(req.body.node_id.split(".")[0] === 'model') {
          currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
        } else {
          currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
        }
        // console.log(currentSchemaYMLModel);
        if(currentSchemaYMLModel.columns) {
          var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
          // console.log(currentSchemaYMLModelColumn);
          if(!currentSchemaYMLModelColumn) {
            // console.log('adding column');
            currentSchemaYMLModel.columns.push({
              "name": req.body.column
            });
            var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
          }
        } else { //add columns section
          currentSchemaYMLModel.columns = [];
          currentSchemaYMLModel.columns.push({
            "name": req.body.column
          });
          var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
        }
        // console.log(currentSchemaYMLModelColumn);
        currentSchemaYMLModelColumn[req.body.property_name] = req.body.new_value;
        // console.log(currentSchemaYMLModelColumn);
        fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
      }
      console.log("response body: ");
      console.log(res.body);
      
    });
  });
});

app.post('/api/v1/create_pr', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    console.log('Got body:', req.body);
    console.log('Creating Pull Request...')
    console.log(req.body.prTitle);
    console.log(id);
    var prTitle = req.body.prTitle?req.body.prTitle:"Untitled Commit"
    
    var git = simpleGit('./user_folders/'+id+'/dbt');
    checkoutChangeBranch(id)
    .then(() => {
      // console.log("checking diff"); //disabled alongside pull requests - re-add at a later point
        git.add('./*', '-f').commit(prTitle).push("origin", "HEAD", {"-u":null,"--force":null});
          // .then( //pull requests turned off for now - re-add at a later point
            
          //   setTimeout(() => { //this is required to ensure github catches up with the push before opening a pr
          //     octokit.pulls.list({
          //       "owner": "ciejer",
          //       "repo": "sqlgui-dbt-demo",
          //       "head": "currentBranch",
          //       "base": "master"
          //     })
          //       .then(currentPulls => {
          //         if(currentPulls.data.length===0) {
          //           octokit.pulls.create({
          //             "owner": "ciejer",
          //             "repo": "sqlgui-dbt-demo",
          //             "title": prTitle,
          //             "head": "currentBranch",
          //             "base": "master"
          //             });
          //         } else {
          //           console.log("Pull request already exists. No new pull required.");
          //         }
          //       });
              
          //   }, 2000)
          // );
      // git.diff('origin/master', 'currentBranch')
      // .then( gitDiff => {
      //   console.log("diff complete:");
      //   console.log(gitDiff);
      //   if(gitDiff.length > 0) {
          
        // } else {
        //   console.log("No changes from origin/master. No new pull required.");
        // }
      res.sendStatus(200);
      // }); --end of disabled section
    });
  });
});

app.get('/api/v1/model_search/:searchString', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    console.log("Search: "+req.params.searchString);
    console.log(result.toAuthJSON()._id);
    let returnValue = {"results": searchModels(req.params.searchString, id)};
    returnValue.searchString = req.params.searchString;
    console.log(returnValue.searchString);
    res.json(returnValue);
  });
});

app.get('/api/v1/catalog_index', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    res.json(catalogIndex(id));
  });
});



app.post('/api/v1/refresh_metadata', auth.required, (req, res) => {
  console.log("Refresh Metadata");
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    refreshMetadata(id);
    res.sendStatus(200);
  });
});

app.get('/api/v1/get_user_config', auth.required, (req, res) => {
  console.log("Get User Config");
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    res.json({"user": userConfig(id)});
  });
});

app.post('/api/v1/set_user_config', auth.required, (req, res) => {
  const { payload: { id } } = req;
  Users.findById(id, function(err, result) {
    console.log("Set User Config");
    console.log("Got Body: " + JSON.stringify(req.body));
    setUserConfig(id, req.body);
    res.sendStatus(200);
  });
});

// app.post('/api/user', (req, res) => {
//   const user = req.body.user;
//   console.log('Adding user::::::::', user);
//   users.push(user);
//   res.json("user addedd");
// });


// app.get('/', (req,res) => {
//     res.send('App Works !!!!');
// });

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
