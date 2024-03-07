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
import { updateCharges, isInitialized, ChargeTypeToInt, IntToChargeType } from "./index.js"

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

function updateSimulationData()
{
    localStorage.setItem(dataKey, JSON.stringify(simulationsData))
    updateSimulationList(simulationsData)
}

function getSelectedSimulation()
{
    return (tabs.selectedTab||{}).simulationId
}

function reloadSim()
{
    objectsList.updateItems(simulationsData[getSelectedSimulation()].objects)
    updateCharges(simulationsData[getSelectedSimulation()])
    updateSimulationData()
}

function createKey() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function randomCharge(name)
{
    return {
        x: (Math.random()-.5)*2 * 35,
        y: (Math.random()-.5)*2 * 20,
        q: 1,
        type: 0,
        displayName: name
    }
}

function createDefaultObjects(simulation)
{
    simulation.objects["Neg 1"] = {
        x: 0,
        y: 0,
        q: -1,
        type: 0,
        displayName: "Neg 1"
    }
    
    for (let i = 0; i < 3; i++)
    {
        simulation.objects["Pos "+i] = randomCharge("Pos "+i)
    }
}

function createNewSimulation(name)
{
    const newSimulation = {
        "displayName": name,
        "settings": {

        },
        "objects": {

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

function getObjectProperties(object)
{
    const properties = []
    
    // Name
    properties.push({
        "name": "displayName", 
        "displayName": "Name", 
        "type": "string"
    })

    // Type
    properties.push({
        "name": "type", 
        "displayName": "type", 
        "type": "dropdown", 
        "values": ["Point", "Sphere", "Line"]
    })

    // Positions
    if (object.type == ChargeTypeToInt["Point"] 
        || ChargeTypeToInt["Sphere"])
    {
        properties.push({
            "name": "x",
            "displayName": "x",
            "type": "float",
        })

        properties.push({
            "name": "y",
            "displayName": "y",
            "type": "float",
        })

        properties.push({
            "name": "q",
            "displayName": "q",
            "type": "float",
        })
    }

    switch (object.type)
    {
        case ChargeTypeToInt["Point"]:
            break;

    }

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