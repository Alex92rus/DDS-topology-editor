/** @jsx React.DOM */

/*
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 */

var TopologyEditor = React.createClass({
    getInitialState: function() {
        return {
            topologyId: 'new topology',
            properties: [],
            tasks: [],
            collections: [],
            main: {
                id: 'main',
                tasks: [],
                collections: [],
                groups: []
            },
            invalidInput: false,
            fluid: false
        };
    },

    toggleFluid: function() {
        this.setState({ fluid: !this.state.fluid });
    },

    resetState: function() {
        this.replaceState({
            topologyId: 'new topology',
            properties: [],
            tasks: [],
            collections: [],
            main: {
                id: 'main',
                tasks: [],
                collections: [],
                groups: []
            },
            invalidInput: false
        });
    },

    handleTopologyChange: function(topologyId, properties, tasks, collections, main) {
        this.setState({
            topologyId: topologyId,
            properties: properties,
            tasks: tasks,
            collections: collections,
            main: main
        });
    },

    handleTopologyIdChange: function(topologyId) {
        this.setState({
            topologyId: topologyId
        });
    },

    handleInputChange: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
    },

    handleAddProperty: function(e) {
        e.preventDefault();
        if (e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        if (_.some(this.state.properties, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var nextProperties = this.state.properties.concat([{ id: e.target[0].form[0].value }]);
        this.refs.addPropertyBtn.toggle();
        this.setState({
            properties: nextProperties
        });
    },

    handleRemoveProperty: function(key) {
        var nextProperties = this.state.properties;
        var removedProperty = nextProperties.splice(key, 1);
        var nextTasks = this.state.tasks;
        nextTasks.forEach(function(task, index) {
            task.properties = _.filter(task.properties, function(property) {
                return property.id !== removedProperty[0].id;
            })
        });
        this.setState({
            properties: nextProperties,
            tasks: nextTasks
        });
    },

    handleEditProperty: function(key, newproperty) {
        if (_.some(this.state.properties, { 'id': newproperty.id })) {
            return;
        }
        var nextProperties = this.state.properties;
        var oldId = nextProperties[key].id;
        nextProperties[key] = newproperty;
        var nextTasks = this.state.tasks;
        nextTasks.forEach(function(task, index) {
            task.properties.forEach(function(property, index) {
                if (property.id === oldId) {
                    property.id = newproperty.id;
                }
            })
        });
        this.setState({
            properties: nextProperties
        });
    },

    handleAddTask: function(e) {
        e.preventDefault();
        if (e.target[0].form[0].value === "" || e.target[0].form[1].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        if (_.some(this.state.tasks, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedProperties = [];
        this.state.properties.forEach(function(property, index) {
            for(var i = 0; i < e.target[0].form[index+5].value; i++) {
                selectedProperties.push({ id: property.id });
            }
        });
        var newTask = {
            id: e.target[0].form[0].value,
            exe: {
                valueText: e.target[0].form[1].value
            },
            properties: selectedProperties
        }

        if (e.target[0].form[2].checked === true) {
            newTask.exe.reachable = "true";
        }

        if (e.target[0].form[3].value !== "") {
            newTask.env = {};
            newTask.env.valueText = e.target[0].form[3].value;
            if (e.target[0].form[4].checked == true) {
                newTask.env.reachable = "true";
            }
        }

        var nextTasks = this.state.tasks.concat([newTask]);
        this.refs.addTaskBtn.toggle();
        this.setState({
            tasks: nextTasks
        });
    },

    handleEditTask: function(tasks) {
        this.setState({
            tasks: tasks
        });
    },

    handleRemoveTask: function(key) {
        var nextTasks = this.state.tasks;
        var removedTask = nextTasks.splice(key, 1);
        var nextCollections = this.state.collections;
        nextCollections.forEach(function(collection, index) {
            collection.tasks = _.filter(collection.tasks, function(task) {
                return task !== removedTask[0].id;
            });
        });
        var nextMainTasks = this.state.main.tasks;
        nextMainTasks = _.filter(nextMainTasks, function(task) {
            return task !== removedTask[0].id;
        });
        var nextGroups = this.state.main.groups;
        nextGroups.forEach(function(group, index) {
            group.tasks = _.filter(group.tasks, function(task) {
                return task !== removedTask[0].id;
            })
        });
        var nextMain = {
            id: this.state.main.id,
            tasks: nextMainTasks,
            collections: this.state.main.collections,
            groups: nextGroups
        }
        this.setState({
            tasks: nextTasks,
            collections: nextCollections,
            main: nextMain
        });
    },

    handleAddCollection: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        if(_.some(this.state.collections, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        this.state.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var nextCollections = this.state.collections.concat([{
            id: e.target[0].form[0].value,
            tasks: selectedTasks
        }]);
        this.refs.addCollectionBtn.toggle();
        this.setState({
            collections: nextCollections
        });
    },

    handleEditCollection: function(collections) {
        this.setState({
            collections: collections
        });
    },

    handleRemoveCollection: function(key) {
        var nextCollections = this.state.collections;
        var removedCollection = nextCollections.splice(key, 1);
        var nextMainCollections = this.state.main.collections;
        nextMainCollections = _.filter(nextMainCollections, function(collection) {
            return collection !== removedCollection[0].id;
        });
        var nextGroups = this.state.main.groups;
        nextGroups.forEach(function(group, index) {
            group.collections = _.filter(group.collections, function(collection) {
                return collection !== removedCollection[0].id;
            })
        });
        var nextMain = {
            id: this.state.main.id,
            tasks: this.state.main.tasks,
            collections: nextMainCollections,
            groups: nextGroups
        }
        this.setState({
            collections: nextCollections,
            main: nextMain
        });
    },

    handleAddGroup: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        if(_.some(this.state.main.groups, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        var selectedCollections = [];
        var tasksIndex = 0;
        this.state.tasks.forEach(function(task, index) {
            tasksIndex++;
            for(var i = 0; i < e.target[0].form[index+2].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        this.state.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[tasksIndex+index+2].value; i++) {
                selectedCollections.push(collection.id);
            }
        });
        var nextGroups = this.state.main.groups.concat([{
            id: e.target[0].form[0].value,
            n: e.target[0].form[1].value,
            tasks: selectedTasks,
            collections: selectedCollections
        }]);
        var nextMain = {
            id: this.state.main.id,
            tasks: this.state.main.tasks,
            collections: this.state.main.collections,
            groups: nextGroups
        }
        this.setState({
            main: nextMain
        });
        this.refs.addGroupBtn.toggle();
    },

    handleEditGroup: function(groups) {
        var nextMain = {
            id: this.state.main.id,
            tasks: this.state.main.tasks,
            collections: this.state.main.collections,
            groups: groups
        }
        this.setState({
            main: nextMain
        });
    },

    handleRemoveGroup: function(key) {
        var nextGroups = this.state.main.groups;
        nextGroups.splice(key, 1);
        var nextMain = {
            id: this.state.main.id,
            tasks: this.state.main.tasks,
            collections: this.state.main.collections,
            groups: nextGroups
        }
        this.setState({
            main: nextMain
        });
    },

    handleEditMain: function(main) {
        this.setState({
            main: main
        });
    },

    hideAddPropertyButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addPropertyBtn.toggle();
    },

    hideAddTaskButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addTaskBtn.toggle();
    },

    hideAddCollectionButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addCollectionBtn.toggle();
    },

    hideAddGroupButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addGroupBtn.toggle();
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var ButtonInput = ReactBootstrap.ButtonInput;
        var PropertyCheckboxes = [];
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];

        this.state.properties.forEach(function(property, i) {
            PropertyCheckboxes.push(
                <div className="ct-box ct-box-property" key={"t-box" + i}>
                    <div className="element-name" title={property.id}>{property.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
                </div>
            );
        });

        this.state.tasks.forEach(function(task, i) {
            TaskCheckboxes.push(
                <div className="ct-box ct-box-task" key={"t-box" + i}>
                    <div className="element-name" title={task.id}>{task.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
                </div>
            );
        });

        this.state.collections.forEach(function(collection, i) {
            CollectionCheckboxes.push(
                <div className="ct-box ct-box-collection" key={"c-box" + i}>
                    <div className="element-name" title={collection.id}>{collection.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
                </div>
            );
        });

        return (
            <div>
                <TopBar topologyId={this.state.topologyId} onTopologyIdChange={this.handleTopologyIdChange} onToggleFluid={this.toggleFluid} />

                <div className={this.state.fluid ? "container-fluid" : "container"}>
                    <div className="row">
                        <div className="col-xs-3">
                            <ul className="list-group left-pane">
                                <FileActions
                                    onFileLoad={this.handleTopologyChange}
                                    topologyId={this.state.topologyId}
                                    properties={this.state.properties}
                                    tasks={this.state.tasks}
                                    collections={this.state.collections}
                                    main={this.state.main} />

                                <li className="list-group-item properties-header">
                                    properties
                                    <OverlayTrigger trigger="click" placement="right" ref="addPropertyBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new property">
                                            <form onSubmit={this.handleAddProperty}>
                                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : ""} />
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddPropertyButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-property-btn" title="add new property"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item properties">
                                    <PropertyList
                                        properties={this.state.properties}
                                        onRemoveProperty={this.handleRemoveProperty}
                                        onEditProperty={this.handleEditProperty} />
                                </li>

                                <li className="list-group-item tasks-header">
                                    tasks
                                    <OverlayTrigger trigger="click" placement="right" ref="addTaskBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new task">
                                            <form onSubmit={this.handleAddTask}>
                                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } />
                                                <Input type="text" addonBefore="exe" onChange={this.handleInputChange} className={this.state.invalidInput ? "mono invalid-input" : "mono" } />
                                                <Input type="checkbox" label="exe reachable (optional)"/>
                                                <Input type="text" addonBefore="env" className="mono" />
                                                <Input type="checkbox" label="env reachable (optional)"/>
                                                <p>Properties in this task:</p>
                                                {PropertyCheckboxes}
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddTaskButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-task-btn" title="add new task"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item tasks">
                                    <TaskList
                                        properties={this.state.properties}
                                        tasks={this.state.tasks}
                                        onRemoveTask={this.handleRemoveTask}
                                        onEditTask={this.handleEditTask} />
                                </li>

                                <li className="list-group-item collections-header">
                                    collections
                                    <OverlayTrigger trigger="click" placement="right" ref="addCollectionBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new collection">
                                            <form onSubmit={this.handleAddCollection}>
                                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : ""} />
                                                <p>Tasks in this collection:</p>
                                                {TaskCheckboxes}
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddCollectionButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item collections">
                                    <CollectionList
                                        collections={this.state.collections}
                                        tasks={this.state.tasks}
                                        onRemoveCollection={this.handleRemoveCollection}
                                        onEditCollection={this.handleEditCollection} />
                                </li>

                                <li className="list-group-item groups-header">
                                    groups
                                    <OverlayTrigger trigger="click" placement="right" ref="addGroupBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new group">
                                            <form onSubmit={this.handleAddGroup}>
                                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : ""} />
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <Input type="number" min="1" step="1" addonBefore="n" defaultValue="1" />
                                                    </div>
                                                </div>
                                                <p>Tasks in this group:</p>
                                                {TaskCheckboxes}
                                                <p>Collections in this group:</p>
                                                {CollectionCheckboxes}
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddGroupButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item groups">
                                    <GroupList
                                        groups={this.state.main.groups}
                                        tasks={this.state.tasks}
                                        collections={this.state.collections}
                                        onRemoveGroup={this.handleRemoveGroup}
                                        onEditGroup={this.handleEditGroup} />
                                </li>

                                <li className="list-group-item">
                                    <button type="button" className="btn btn-sm btn-default" onClick={this.resetState}>
                                        <span className="glyphicon glyphicon-remove" title="reset the topology"></span> reset
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="col-xs-9">
                            <MainEditor tasks={this.state.tasks} collections={this.state.collections} main={this.state.main} onEditMain={this.handleEditMain}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
