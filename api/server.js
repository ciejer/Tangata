const express = require('express');
var spawn = require('child_process').spawn;
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;
const fs = require('fs');
var cors = require('cors');
const yaml = require('js-yaml');

// place holder for the data
// const users = [];

var whitelist = ['http://sqlgui.chrisjenkins.nz', 'http://localhost', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    // if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    // } else {
      // callback(new Error('Not allowed by CORS'))
    // }
  }
}

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

const compileCatalogNodes = () => {
  rawCatalog = fs.readFileSync('./dbt/target/catalog.json');
  catalog = JSON.parse(rawCatalog);
  rawManifest = fs.readFileSync('./dbt/target/manifest.json');
  manifest = JSON.parse(rawManifest);
  var tempCatalogNodes = [];
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
var fullCatalog = compileCatalogNodes();

const compileSearchIndex = (catalogToIndex) => {
  var tempCatalogIndex = [];
  for (const [key, value] of Object.entries(catalogToIndex)) {
    tempCatalogIndex.push({"searchable": value.name, "nodeID": value.nodeID, "modelName": value.name, "modelDescription": value.description, "type": "model_name"}); //push the model itself
    if(value.description) tempCatalogIndex.push({"searchable": value.description, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "model_description"}) ;// model description
    // console.log(value.columns);
    for (const [columnKey, columnValue] of Object.entries(value.columns)) {
      tempCatalogIndex.push({"searchable": columnKey, "columnName":columnKey, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "column_name"}); // column name
      if(columnValue.description) tempCatalogIndex.push({"searchable": columnValue.description, "columnName":columnKey, "modelName": value.name, "nodeID": value.nodeID, "modelDescription": value.description, "type": "column_description"}); // column name
    }
  }
  return tempCatalogIndex;
}
const catalogIndex = compileSearchIndex(fullCatalog);

const getModelLineage = () => {
  const modelLineage = (currentModel) => {
    var tempLineage = []
    const recurseForwardLineage = (currentRecursedModel) => {
      // console.log(currentRecursedModel);
      if(currentRecursedModel && currentRecursedModel.referenced_by) {
        currentRecursedModel.referenced_by.map((value) => {
          if(tempLineage.filter((item, index) => { return (item.id === currentRecursedModel.nodeID+"_"+value)}).length===0) {
            tempLineage.push({ id: currentRecursedModel.nodeID+"_"+value, source: currentRecursedModel.nodeID, target: value, animated: true }); //push edge
          }
          if(tempLineage.filter((item, index) => { return (item.id === value)}).length===0) {
            tempLineage.push({ id: value, data: { label: value.split(".").pop().replace(/_/g, '_\u200B') }, connectable: false}); //push node
          }
          recurseForwardLineage(fullCatalog[value]);
        });
      }
    };
    const recurseBackLineage = (currentRecursedModel) => {
      // console.log(currentRecursedModel.name);
      if(currentRecursedModel && currentRecursedModel.depends_on && currentRecursedModel.depends_on.nodes) {
        currentRecursedModel.depends_on.nodes.map((value) => {
          if(tempLineage.filter((item, index) => { return(item.id === currentRecursedModel.nodeID+"_"+value)}).length===0) {
            tempLineage.push({ id: currentRecursedModel.nodeID+"_"+value, target: currentRecursedModel.nodeID, source: value, animated: true }); //push edge
          }
          if(tempLineage.filter((item, index) => { return(item.id === value)}).length===0) {
            tempLineage.push({ id: value, data: { label: value.split(".").pop().replace(/_/g, '_\u200B') }, connectable: false}); //push node
          }
          recurseBackLineage(fullCatalog[value]);
        });
      }
    };
    // console.log(currentModel);
    recurseBackLineage(currentModel);
    tempLineage.push({ id: currentModel.nodeID, style: {"borderColor": "tomato","borderWidth": "2px"}, connectable: false, data: { label: currentModel.name.replace(/_/g, '_\u200B') }}); //push node
    recurseForwardLineage(currentModel);
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
    if(fullCatalog[catalogNode].model_type==="node") {
      fullCatalog[catalogNode].lineage = modelLineage(fullCatalog[catalogNode]);
    }
  }
}
getModelLineage();

// console.log(fullCatalog["model.trustpower.litmos_learning_path_course_stage"]);
// console.log(modelLineage(fullCatalog["model.trustpower.litmos_learning_path_course_stage"]));

const getModel = (modelName) => {
  return fullCatalog[modelName];
}

const searchModels = (searchString) => {
  var regexp_needle = new RegExp(searchString, 'i')
  return catalogIndex.filter(function (v) {
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
}

const findOrCreateMetadataYML = (yaml_path, model_path, model_name, source_schema, model_or_source) => {
  // console.log("findOrCreateMetadataYML");
  // console.log(yaml_path);
  // console.log(model_path);
  // console.log(model_name);

  const useSchemaYML = () => {
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

    var path = './dbt/'+model_path.replaceAll('\\','/');
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
            console.log('pushing model');
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
              console.log('pushing source and table');
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
              console.log('pushing sourcetable');
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
  console.log(source_schema);
  console.log(model_name);
  if(model_or_source === 'source') {
    var path = './dbt/'+model_path.replaceAll('\\','/');
    console.log(path);
    try {
      if (fs.existsSync(path)) {
        console.log(fs.readFileSync(path,'utf8'));
        const currentSchemaYML = yaml.load(fs.readFileSync(path,'utf8'));
        console.log(currentSchemaYML);
        console.log(fs.existsSync(path));
        // console.log(currentSchemaYML.sources);
        if((currentSchemaYML.sources) && (currentSchemaYML.sources.filter(source => source.name === source_schema).length>0) && (currentSchemaYML.sources.filter(source => source.name === source_schema)[0].tables.filter(source_table => source_table.name === model_name).length>0)) {
          return path;
        } else {
          console.log(currentSchemaYML.sources[0]);
          if(currentSchemaYML.sources.filter(source => source.name === source_schema).length===0) { //add source and table
            console.log('pushing source and table');
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
            console.log('pushing sourcetable');
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
        return useSchemaYML();
      }
    } catch(err) {
      console.log(err);
      return useSchemaYML();
    }
  } else if(yaml_path ) {
    var path = './dbt/'+yaml_path.replaceAll('\\','/');
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
        return useSchemaYML();
      }
    } catch(err) {
      console.log(err);
      return useSchemaYML();
    }
  } else {
    return useSchemaYML();
  }
}

app.use(bodyParser.json(), cors(corsOptions));

app.get('/api/model_old/:modelJsonFilename', (req, res) => { //TODO: remove once new model api available
  // TODO: Check security on all calls
  let rawmodel = fs.readFileSync('./dbt/models/' + req.params.modelJsonFilename);
  let model = JSON.parse(rawmodel);
  res.json(model);
});

app.get('/api/v1/models/:modelName', (req, res) => {
  // TODO: Check security on all calls
  res.json(getModel(req.params.modelName));
});

app.post('/api/v1/reload_dbt', (req, res) => {
  console.log('Running dbt_...')
  const dbtRunner = spawn("cd dbt && dbt docs generate", {shell: true});
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
      fullCatalog = compileCatalogNodes();
      console.log('Update complete.');
    }
  });
  res.sendStatus(200);
});

app.post('/api/v1/update_metadata', (req, res) => {
  // TODO: Check security on all calls
  console.log('Got body:', req.body);
  res.sendStatus(200);
  if(req.body.updateMethod==='yamlModelProperty') {
    const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0]);
    console.log(schemaYMLPath);
    console.log("^ path that contains model yml config");
    let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
    // console.log(fs.readFileSync(schemaYMLPath,'utf8'));
    console.log(currentSchemaYML);
    let currentSchemaYMLModel = {};
    if(req.body.node_id.split(".")[0] === 'model') {
      currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
    } else {
      currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
    }
    console.log(currentSchemaYMLModel);
    currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
    console.log(currentSchemaYMLModel);
    fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
  } else if(req.body.updateMethod==='yamlModelColumnProperty') {
    const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0]);
    console.log(schemaYMLPath);
    console.log("^ path that contains model yml config");
    let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
    let currentSchemaYMLModel = {}
    if(req.body.node_id.split(".")[0] === 'model') {
      currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
    } else {
      currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
    }
    console.log(currentSchemaYMLModel);
    if(currentSchemaYMLModel.columns) {
      var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
      console.log(currentSchemaYMLModelColumn);
      if(!currentSchemaYMLModelColumn) {
        console.log('adding column');
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
    console.log(currentSchemaYMLModelColumn);
    currentSchemaYMLModelColumn[req.body.property_name] = req.body.new_value;
    console.log(currentSchemaYMLModelColumn);
    fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
  }
});

app.get('/api/v1/model_search/:searchString', (req, res) => {
  // TODO: Check security on all calls
  res.json(searchModels(req.params.searchString));
});

app.get('/api/v1/catalog_index', (req, res) => {
  // TODO: Check security on all calls
  res.json(catalogIndex);
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
