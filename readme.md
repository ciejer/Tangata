# Elevator pitch
Catalog / lineage becomes the creation tool. To create a new model, select the catalog models that are needed, and click "create".
This zooms into an Alteryx-like development screen, to step through:
- Write description
- Define join conditions
- Filter results
- Select / group by combo.

# Requirements
## Scope for alpha
- Display dummy models
- Interface to create dependent model
- SQL generation for join, select, criteria, group, and basic aggregation functions
- Modular approach
    - Assume all languages have SELECT -> FROM/JOIN -> WHERE -> GROUP structure, but use a modular approach within

## Framework Requirements
- Backend:
    - Generate model list on change
    - Receive & store usage data (for suggested joins)
    - Read/write to git repo, to save models for deployment
        - Create files
        - Edit files
        - Git commit & push as logged in user
        - Squash commits at various points
        - "Propose changes" for pull request
        - Look at Looker for ideas on how git stuff is hidden
- Clean flowing lines between models
- Beautiful front end
- Open source

## Behaviour expectations
- Front end should pull just the list of all models
- Front end should pull down details of requested models quickly

# Things to plan for post alpha

## Design questions
- Untangle lineage lines with many models on screen
- Highlight join logic
    - field = field
    - more complex
- Highlight Group by / granularity
- Table vs View
- Show field type category

## Potential Enhancements past alpha, to consider during early decisions
- Generate model list in backend (dummy for alpha)
- Backend parsing of dbt manifest.json / catalog.json
- Zoom out / zoom in between lineage and new model / edit model screen
- Should suggest things that have been joined to currently selected models before
    - Prioritise by user (self) and frequency
    - Display in context menu of a field (right click on "lead id", menu should contain "join to...")
    - Once nobody uses a join, remove it (perhaps populate based on current git contents?)
- Colour blind mode
- Allow changing already created objects
- Suggest table / incremental / view based on usage
    - Collect usage stats from database
    - Ask expected frequency
        - Use standard tags for dbt project: 5min, hourly, daily, weekly etc
    - Feed frequency requirements up to parent models (and highlight where issues)
- Implement dummy dbt_ macros
    - request dummy for all found macros
- Allow creation of simple dbt_ macros
- Allow more granular visibility of field types
- Force best practise git behaviour - can't edit main branch
    - Allow override
- Security on rest calls
- Implement security for sensitive models
- Store data profiling info in model.json
    - Implement security around data in sensitive models
- Read only access to lineage view as data catalog
- Descriptions - interaction with dbt metadata

# Design
- Backend metadata
    - model_list.json
    - model_1.json
    - model_2.json
    - model_1.sql
    - model_2.sql
    - ...

- Front end
    - load_model_list()
    - load_model(model_1)
    - - Allow loading all from a single file if performant at scale
    - Display model in canvas
    - Drag model around
    - Create join interface
    - Add fields to select interface
    - Add aggregation interface
    - Require group if aggregated
    - Highlight grouping fields
    - Generate SQL function
