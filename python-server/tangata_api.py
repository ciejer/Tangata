import os
import json
from yaml import load, dump
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper
import re

class CustomDumper(Dumper):
    #Super neat hack to preserve the mapping key order. See https://stackoverflow.com/a/52621703/1497385
    def represent_dict_preserve_order(self, data):
        return self.represent_dict(data.items())
    # def increase_indent(self, flow=False, indentless=False):
    #     return super(MyDumper, self).increase_indent(flow, False)    

CustomDumper.add_representer(dict, CustomDumper.represent_dict_preserve_order)

dbtpath = '../api/user_folders/608d43419957386b24b565d4/dbt/'

def catalogIndex():
    try:
        f = open("catalogindex.json")
        return json.load(f)
    except IOError:
        print("catalogindex.json not accessible")
    finally:
        f.close()

def catalog():
    try:
        f = open("catalog.json")
        return json.load(f)
    except IOError:
        print("catalog.json not accessible")
    finally:
        f.close()

def searchModels(searchString):
    def modelCompare(inputItem, searchString):
        isModel = 1
        if inputItem['type'] == "model_name":
            isModel = 0
        hasDescription = 1
        if len(inputItem['modelDescription']) > 0:
            hasDescription = 0
        searchStringLengthDiff = abs(len(inputItem['searchable'])-len(searchString))
        print((inputItem['searchable'], inputItem['type'], inputItem['modelName'], searchStringLengthDiff, isModel, hasDescription))
        return (searchStringLengthDiff, isModel, hasDescription)
    print(searchString)
    print(type(catalogIndex()))
    print(catalogIndex()[0]['searchable'])
    denied_metrics = [re.compile(searchString), re.compile("c$")]
    matches = [model for model in catalogIndex() 
           if re.compile(searchString).search(model['searchable'])]
    if len(matches) > 0:

        print(type(matches))
        print(matches)
        matches = sorted(matches, key = lambda k: (modelCompare(k, searchString)))
        results = json.dumps(matches)
        print(json.dumps(matches))
        return '{"results": ' + results + ',"searchString":"' + searchString + '"}'

def get_model(nodeID):
    result = catalog()[nodeID]
    return result

def findOrCreateMetadataYML(yaml_path, model_path, model_name, source_schema, model_or_source):
    def useSchemaYML():
        print("using useSchemaYML")
        def createNewYML(schemaPath, modelName, sourceSchema):
            print("createNewYML")
            if(model_or_source=='model'):
                print("createNewYML - model")
                newYAML = {"version": 2,"models": [{"name": modelName}]}
            else:
                print("createNewYML - source")
                newYAML = {"version": 2,"sources": [{"name": source_schema,"tables": [{"name": modelName}]}]}
            yamlToWrite = dump(newYAML, Dumper=CustomDumper)
            print(yamlToWrite)
            newYamlWrite = open(schemaPath, "w")
            newYamlWrite.write(yamlToWrite)
            return schemaPath
        path = dbtpath + model_path.replace('\\','/')
        print(path)
        print(path.rindex('/'))
        print(path[0,path.rindex('/')])
        path = path[0,path.rindex('/')]
        directory = os.path.dirname(path)
        if not os.path.exists(directory):
            print("useSchemaYML - directory doesn't exist")
            os.makedirs(directory)
        schemaPath = path+'/schema.yml'
        try:
            if os.path.isfile(schemaPath):
                print("useSchemaYML - schemaPath exists")
                schemaPathRead = open(schemaPath, "r")
                currentSchemaYML = load(schemaPathRead, Loader=Loader)
                schemaPathRead.close()
                if model_or_source == 'model':
                    print("useSchemaYML - is model")
                    if len(list(filter(lambda d: d['name'] == model_name, currentSchemaYML['models']))) > 0:
                        print("useSchemaYML - found model in file")
                        return schemaPath
                    else:
                        print('useSchemaYML - pushing model')
                        currentSchemaYML['models'].append({"name": model_name})
                        schemaPathWrite = open(schemaPath, "w")
                        schemaPathWrite.write(dump(currentSchemaYML), Dumper=CustomDumper)
                        schemaPathWrite.close()
                else:
                    print("useSchemaYML - source")
                    if len(list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))) > 0 and len(list(filter(lambda d: d['name'] == model_name, list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))[0]['tables']))) > 0:
                        print("useSchemaYML - found source in file")
                        return schemaPath
                    else:
                        print("useSchemaYML - did not find source in file")
                        if len(list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))) == 0: #add source and table
                            print("pushing source and table")
                            currentSchemaYML['sources'].append({"name": source_schema,"tables": [{"name": model_name}]})
                        else: #add just source table
                            print("pushing just table")
                            list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))['tables'].append({"name": model_name})
                        schemaPathWrite = open(schemaPath, "w")
                        schemaPathWrite.write(dump(currentSchemaYML, Dumper=CustomDumper))
                        schemaPathWrite.close()
                return schemaPath
            else:
                return createNewYML(schemaPath, model_name, source_schema)
        except:
            return createNewYML(schemaPath, model_name, source_schema)
    print(source_schema)
    print(model_name)
    if model_or_source == 'source':
        print("is source")
        path = dbtpath + model_path.replace('\\','/')
        print(path)
        try:
            if os.path.isfile(path):
                print("first try path is file")
                pathRead = open(path, "r")
                currentSchemaYML = load(pathRead, Loader=Loader)
                pathRead.close()
                print("opened yaml")
                if len(list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))) > 0 and len(list(filter(lambda d: d['name'] == model_name, list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))[0]['tables']))) > 0:
                    print("found source on first try")
                    return path
                else:
                    print("did not source on first try")
                    if len(list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))) == 0: #add source and table
                        print("pushing source and table")
                        currentSchemaYML['sources'].append({"name": source_schema,"tables": [{"name": model_name}]})
                    else: #add just source table
                        print("pushing just table")
                        list(filter(lambda d: d['name'] == source_schema, currentSchemaYML['sources']))['tables'].append({"name": model_name})
                    pathWrite = open(path, "w")
                    pathWrite.write(dump(currentSchemaYML, Dumper=CustomDumper))
                    pathWrite.close()
                return path
            else:
                return useSchemaYML()
        except:
            return useSchemaYML()
    elif len(yaml_path) > 0:
        path = dbtpath + yaml_path.replace('\\','/')
        try:
            if os.path.isfile(path):
                pathRead = open(path, "r")
                currentSchemaYML = load(pathRead, Loader=Loader)
                pathRead.close()
                if len(list(filter(lambda d: d['name'] == model_name, currentSchemaYML['models']))) > 0:
                    print("found model in file")
                    return path
                else:
                    print('pushing model')
                    print(currentSchemaYML)
                    currentSchemaYML['models'].append({"name": model_name})
                    print('now pushed, list is now:')
                    print(currentSchemaYML)
                    pathWrite = open(path, "w")
                    pathWrite.write(dump(currentSchemaYML, Dumper=CustomDumper))
                    pathWrite.close()
                return path
            else:
                return useSchemaYML()
        except:
            return useSchemaYML()
    else:
        return useSchemaYML()

def update_metadata(jsonBody):
    print(jsonBody)
    if jsonBody['updateMethod'] == 'yamlModelProperty':
        schemaYMLPath = findOrCreateMetadataYML(jsonBody['yaml_path'], jsonBody['model_path'], jsonBody['model'], jsonBody['node_id'].split(".")[2], jsonBody['node_id'].split(".")[0])
        schemaPathRead = open(schemaYMLPath, "r")
        currentSchemaYML = load(schemaPathRead, Loader=Loader)
        schemaPathRead.close()
        if jsonBody['node_id'].split(".")[0] == 'model':
            currentSchemaYMLModel = list(filter(lambda d: d['name'] == jsonBody['model'], currentSchemaYML['models']))[0]
        else:
            currentSchemaYMLModel = list(filter(lambda d: d['name'] == jsonBody['model'], list(filter(lambda d: d['name'] == jsonBody['node_id'].split(".")[2], currentSchemaYML['sources']))[0]['tables']))
        print(currentSchemaYMLModel)
        currentSchemaYMLModel[jsonBody['property_name']] = jsonBody['new_value']
        print(currentSchemaYMLModel)
        pathWrite = open(schemaYMLPath, "w")
        pathWrite.write(dump(currentSchemaYML, Dumper=CustomDumper))
        pathWrite.close()
#         let currentSchemaYMLModel = {};
#         if(req.body.node_id.split(".")[0] === 'model') {
#           currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
#         } else {
#           currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
#         }
#         // console.log(currentSchemaYMLModel);
#         currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
#         // console.log(currentSchemaYMLModel);
#         fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
    return "success"


# '../api/user_folders/608d43419957386b24b565d4/dbt/models/analytics/schema.yml'



#       if(req.body.updateMethod==='yamlModelProperty') {
#         const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
#         // console.log(schemaYMLPath);
#         // console.log("^ path that contains model yml config");
#         let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
#         // console.log(fs.readFileSync(schemaYMLPath,'utf8'));
#         // console.log(currentSchemaYML);
#         let currentSchemaYMLModel = {};
#         if(req.body.node_id.split(".")[0] === 'model') {
#           currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
#         } else {
#           currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
#         }
#         // console.log(currentSchemaYMLModel);
#         currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
#         // console.log(currentSchemaYMLModel);
#         fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
#       } else if(req.body.updateMethod==='yamlModelTags') {
#         if(req.body.node_id.split(".")[0] === 'model') {
#           let dbtProjectYMLModelPath = ['models',req.body.node_id.split(".")[1]];
#           let splitModelPath = req.body.model_path.split(".")[0].split("\\");
#           splitModelPath.shift();
#           dbtProjectYMLModelPath = dbtProjectYMLModelPath.concat(splitModelPath);
#           let dbtProjectPath = "./user_folders/"+id+"/dbt/dbt_project.yml";
#           let dbtProjectYML = new YAWN(fs.readFileSync(dbtProjectPath,'utf8'));
#           var jsonToInsert = "";
#           for(i=0;i<dbtProjectYMLModelPath.length-1;i++) {
#             jsonToInsert += "{\"" + dbtProjectYMLModelPath[i] + "\": ";
#           }
#           jsonToInsert += "{\"tags\": [\""+req.body.new_value.join("\",\"")+"\"]}";
#           for(i=0;i<dbtProjectYMLModelPath.length-1;i++) {
#             jsonToInsert += "}";
#           }
#           jsonToInsert = JSON.parse(jsonToInsert);
#           var isObject = function(item) {
#             return (item && typeof item === 'object' && !Array.isArray(item));
#           }
#           var mergeDeep = function(target, source) {
#             let output = Object.assign({}, target);
#             if (isObject(target) && isObject(source)) {
#               Object.keys(source).forEach(key => {
#                 if (isObject(source[key])) {
#                   if (!(key in target))
#                     Object.assign(output, { [key]: source[key] });
#                   else
#                     output[key] = mergeDeep(target[key], source[key]);
#                 } else {
#                   Object.assign(output, { [key]: source[key] });
#                 }
#               });
#             }
#             return output;
#           };
#           dbtProjectYML.json = mergeDeep(dbtProjectYML.json, jsonToInsert);
#           fs.writeFileSync(dbtProjectPath, dbtProjectYML.yaml, 'utf8', (err) => {if (err) console.log(err);});
#         } else {
#           const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
#           // console.log(schemaYMLPath);
#           // console.log("^ path that contains model yml config");
#           let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
#           // console.log(fs.readFileSync(schemaYMLPath,'utf8'));
#           // console.log(currentSchemaYML);
#           let currentSchemaYMLModel = {};
#           currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
#           currentSchemaYMLModel[req.body.property_name] = req.body.new_value;
#           fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
#         }
#       } else if(req.body.updateMethod==='yamlModelColumnProperty') {
#         const schemaYMLPath = findOrCreateMetadataYML(req.body.yaml_path, req.body.model_path, req.body.model, req.body.node_id.split(".")[2], req.body.node_id.split(".")[0], id);
#         // console.log(schemaYMLPath);
#         // console.log("^ path that contains model yml config");
#         let currentSchemaYML = yaml.load(fs.readFileSync(schemaYMLPath,'utf8'));
#         let currentSchemaYMLModel = {}
#         if(req.body.node_id.split(".")[0] === 'model') {
#           currentSchemaYMLModel = currentSchemaYML.models.filter(model => model.name === req.body.model)[0];
#         } else {
#           currentSchemaYMLModel = currentSchemaYML.sources.filter(source => source.name === req.body.node_id.split(".")[2])[0].tables.filter(source_table => source_table.name === req.body.model)[0];
#         }
#         // console.log(currentSchemaYMLModel);
#         if(currentSchemaYMLModel.columns) {
#           var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
#           // console.log(currentSchemaYMLModelColumn);
#           if(!currentSchemaYMLModelColumn) {
#             // console.log('adding column');
#             currentSchemaYMLModel.columns.push({
#               "name": req.body.column
#             });
#             var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
#           }
#         } else { //add columns section
#           currentSchemaYMLModel.columns = [];
#           currentSchemaYMLModel.columns.push({
#             "name": req.body.column
#           });
#           var currentSchemaYMLModelColumn = currentSchemaYMLModel.columns.filter(column => column.name === req.body.column)[0];
#         }
#         // console.log(currentSchemaYMLModelColumn);
#         currentSchemaYMLModelColumn[req.body.property_name] = req.body.new_value;
#         // console.log(currentSchemaYMLModelColumn);
#         fs.writeFileSync(schemaYMLPath, yaml.dump(currentSchemaYML), 'utf8', (err) => {if (err) console.log(err);});
#       }
