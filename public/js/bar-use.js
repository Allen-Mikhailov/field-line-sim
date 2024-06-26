import { 
    SideBar, 
    SideBarPage, 
    SideBarPageActionBar, 
    SideBarList, 
    SideBarProperties,
    
    MiniSideBarButton, 
    MiniSideBar, 
    
    Tabs, 
    Tab 
} from "./bars.js"

import {fitText} from "./fittext.js"
import { updateCharges, 
    isInitialized, 
    ChargeTypeToInt, 
    IntToChargeType, 
    setOnChargeClick 
} from "./index.js"

// Getting Data
const dataKey = "simulation-data:0.0"
let simulationsData = JSON.parse(localStorage.getItem(dataKey) || "{}")
console.log("Similation Data: ", simulationsData)

let selected = "simulations"
let selectedObject

const sideBar = new SideBar()
const miniSideBar = new MiniSideBar();
const tabs = new Tabs();

// Simulations Page
const simulationsPage = new SideBarPage("simulations", "Simulations")
const simulationActionBar = new SideBarPageActionBar("Simulations")
const simulationsList = new SideBarList()

// Objects Page
const objectsPage = new SideBarPage("objects", "Objects")
const objectsActionBar = new SideBarPageActionBar("Objects")
const objectsList = new SideBarList()
const objectPropertiesActionBar = new SideBarPageActionBar("Properties")
const objectProperties = new SideBarProperties()

const SimulationsButton = new MiniSideBarButton("simulations", "/imgs/file.png", "top")
const ObjectsButton = new MiniSideBarButton("objects", "/imgs/shapes.png", "top")
const SettingsButton = new MiniSideBarButton("settings", "/imgs/settings.png", "bot")

let updateSimulationList = undefined

var extend = function (obj, ext) {
    for (var key in ext) if (ext.hasOwnProperty(key)) obj[key] = ext[key];
    return obj;
};

function updateSimulationData()
{
    localStorage.setItem(dataKey, JSON.stringify(simulationsData))
    updateSimulationList(simulationsData)
}

function getSelectedSimulation()
{
    return (tabs.selectedTab||{}).simulationId
}

function updateItems()
{
    const simulation = simulationsData[getSelectedSimulation()]

    if (simulation)
    {
        objectsList.updateItems(simulation.objects)
        objectProperties.updateObject(selectedObject?simulation.objects[selectedObject]:null)
    } else {
        objectsList.updateItems({})
        objectProperties.updateObject(null)
    }
    
}

function reloadSim()
{
    updateItems()
    const simulation = simulationsData[getSelectedSimulation()]
    updateCharges(simulation)
    updateSimulationData()
}

function createKey() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const defaultCharge = () => {return {
    x: 0,
    y: 0,
    q: 1,
    type: 0,
    a: 0,
    r: 1,
    l: 10,
    active: true,
    displayName: "default"
}}

function randomCharge(name)
{
    return extend(defaultCharge(), {
        x: Math.floor((Math.random()-.5)*2 * 35),
        y: Math.floor((Math.random()-.5)*2 * 20),
        q: 1,
        type: 0,
        displayName: name
    })
}

function createDefaultObjects(simulation)
{
    simulation.objects["Neg 1"] = extend(defaultCharge(), {
        x: 0,
        y: 0,
        q: -1,
        type: 0,
        displayName: "Neg 1"
    })
    
    for (let i = 0; i < 3; i++)
    {
        simulation.objects["Pos "+i] = randomCharge("Pos "+i)
    }
}

function createNewSimulation(name)
{
    const newSimulation = {
        "displayName": name,
        "objects": {
            "settings": {
                type: "settings",
                displayName: "settings",
                charge_density: 10,
                record_points: 60,
                record_steps: 20,
                step_distance: .05
            }
        }
    }

    createDefaultObjects(newSimulation)

    simulationsData[name] = newSimulation
    updateSimulationData()
}

function createNewObject(name)
{
    const simulation = simulationsData[getSelectedSimulation()]
    simulation.objects[createKey()] = randomCharge(name)

    reloadSim()
}

function removeSimulation(name)
{
    console.log(name)
    Object.keys(tabs.tabs).map(key => {
        console.log(key, name)
        if (key == "simulation:"+name)
        {
            tabs.removeTab(tabs.tabs[key])
        }
    })
    delete simulationsData[name]
    updateSimulationData()
}

function removeObject(key)
{
    const simulationId = getSelectedSimulation()
    const simulation = simulationsData[simulationId]
    if (!simulation)
        return console.log("no simulation with key \""+simulationId+"\" found")

    if (!simulation.objects[key])
        return console.log("No object with key \""+key+"\" in simulation \""+simulationId+"\" found")
    delete simulation.objects[key]
    reloadSim()
}

class SimulationTab extends Tab
{
    constructor(id)
    {
        super(SimulationTab.createId(id), id);
        this.simulationId = id;
    }

    render()
    {
        const container = super.render()

        const simulationTab = document.getElementById("simulation-tab")
        simulationTab.style.display = "block"

        reloadSim()
    }

    close()
    {
        super.close()
        const simulationTab = document.getElementById("simulation-tab")
        simulationTab.style.display = "none"
    }

    after_close()
    {
        if (!getSelectedSimulation())
        {
            console.log("closed")
            updateItems()
        }
    }

    static createId(key)
    {
        return "simulation:"+key
    }
}

function selectListItem(key)
{
    simulationsList.updateSelected(key)

    if (tabs.tabs[SimulationTab.createId(key)])
    {
        tabs.selectTab(tabs.tabs[SimulationTab.createId(key)])
    } else {
        const newTab = new SimulationTab(key)
        tabs.addTab(newTab)
        tabs.selectTab(tabs.tabs[SimulationTab.createId(key)])
    }
}

const propertyList = {
    displayName: {
        "name": "displayName", 
        "displayName": "Name", 
        "type": "string"
    },
    chargeType: {
        "name": "type", 
        "displayName": "type", 
        "type": "dropdown", 
        "values": {0: "Point", 1: "Sphere", 2: "Line", 3: "External"}
    },
    active: {
        "name": "active", 
        "displayName": "active", 
        "type": "toggle"
    },
    charge: {
        "name": "q",
        "displayName": "charge",
        "type": "float",
    },
    angle: {
        "name": "a",
        "displayName": "angle",
        "type": "float",
    },
    length: {
        "name": "l",
        "displayName": "length",
        "type": "float",
    },
    radius: {
        "name": "r",
        "displayName": "radius",
        "type": "float",
    },
    x: {
        "name": "x",
        "displayName": "x",
        "type": "float",
    },
    y: {
        "name": "y",
        "displayName": "y",
        "type": "float",
    },
    record_points: {
        "name": "record_points",
        "displayName": "Record Points",
        "type": "float"
    },
    step_distance: {
        "name": "step_distance",
        "displayName": "Step Distance",
        "type": "float"
    },
    record_steps: {
        "name": "record_steps",
        "displayName": "Record Steps",
        "type": "float"
    },
    charge_density: {
        "name": "charge_density",
        "displayName": "Charge Density",
        "type": "float"
    }
}

const baseCharge = ["displayName", "chargeType", "active", "charge"]

const typeProperties = {
    [ChargeTypeToInt["Point"]]: [...baseCharge, "x", "y"],
    [ChargeTypeToInt["Sphere"]]: [...baseCharge, "radius", "x", "y"],
    [ChargeTypeToInt["Line"]]: [...baseCharge, "x", "y", "angle", "length"],
    [ChargeTypeToInt["External"]]: [...baseCharge, "angle"],
    ["settings"]: ["record_points", "record_steps", "step_distance", "charge_density"]
}

function getObjectProperties(object)
{
    const properties = []
    
    typeProperties[""+object.type].map((property) => {
        properties.push(propertyList[property])
    })

    return properties
}   

function updateSelectedObject()
{
    objectsList.updateSelected(selectedObject)
    const simulation = simulationsData[getSelectedSimulation()]
    objectProperties.updateObject(selectedObject?simulation.objects[selectedObject]:null)
}

function updateObjectProperties(property, value)
{
    const simulation = simulationsData[getSelectedSimulation()]
    const object = simulation.objects[selectedObject]
    object[property] = value
    objectProperties.updateObject(selectedObject?simulation.objects[selectedObject]:null)
    reloadSim()
}

function selectObjectListItem(key)
{
    selectedObject = key==selectedObject?null:key
    updateSelectedObject()
}

setOnChargeClick((div, obj, key) => {
    selectObjectListItem(key)
})

function updateSelected(nselected)
{
    selected = nselected
    sideBar.setActivePage(selected)
    miniSideBar.select(selected)
}

simulationsList.setMainAction(selectListItem)
simulationsList.setItemActions([{
    "img": "/imgs/clear.png",
    "fun": (key) => {removeSimulation(key)}
}])
updateSimulationList = (items) => simulationsList.updateItems(items)
simulationActionBar.addAction({
    "img": "/imgs/plus.png", 
    "fun": () => simulationsList.createTempItem(createNewSimulation)}
)

simulationsPage.addItem(simulationActionBar)
simulationsPage.addItem(simulationsList)

objectsActionBar.addAction({
    "img": "/imgs/plus.png", 
    "fun": () => {
        if (getSelectedSimulation())
            objectsList.createTempItem(createNewObject)
    }
})

objectsList.setItemActions([{
    "img": "/imgs/clear.png",
    "fun": (key) => removeObject(key)
}])

objectsList.setMainAction(selectObjectListItem)

objectProperties.setGetProperties(getObjectProperties)
objectProperties.setOnUpdate(updateObjectProperties)

objectsPage.addItem(objectsActionBar)
objectsPage.addItem(objectsList)
objectsPage.addItem(objectPropertiesActionBar)
objectsPage.addItem(objectProperties)

sideBar.addPage(simulationsPage)
sideBar.addPage(objectsPage)

sideBar.render()

SimulationsButton.addAction(()=>{updateSelected(selected=="simulations"?null:"simulations")})
ObjectsButton.addAction(()=>{updateSelected(selected=="objects"?null:"objects")})
SettingsButton.addAction(()=>{console.log("settings")})

miniSideBar.addButton(SimulationsButton)
miniSideBar.addButton(ObjectsButton)
miniSideBar.addButton(SettingsButton)

miniSideBar.render()

sideBar.setActivePage("simulations")
SimulationsButton.toggleSelected(true)

updateSimulationData()