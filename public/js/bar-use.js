import { 
    SideBar, 
    SideBarPage, 
    SideBarPageActionBar, 
    SideBarList, 
    
    MiniSideBarButton, 
    MiniSideBar, 
    
    Tabs, 
    Tab 
} from "./bars.js"

import fitText from "./fittext.js"
import { updateCharges, isInitialized } from "./index.js"

const dataKey = "simulation-data:0.0"

let selected = "simulations"

let simulationsData = JSON.parse(localStorage.getItem(dataKey) || "{}")
console.log(simulationsData)

let updateSimulationList = undefined


function updateSimulationData()
{
    localStorage.setItem(dataKey, JSON.stringify(simulationsData))
    updateSimulationList(simulationsData)
}

function createDefaultObjects(simulation)
{
    simulation.objects["test-charge"] = {
        x: 0,
        y: 0,
        q: -1,
        type: 0,
    }
    
    for (let i = 0; i < 3; i++)
    {
        const newCharge = {
            x: (Math.random()-.5)*2 * 35,
            y: (Math.random()-.5)*2 * 20,
            q: 1,
            type: 0
        }
        simulation.objects[""+i] = newCharge
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

function removeSimulation(name)
{
    delete simulationsData[name]
    updateSimulationData()
}

const sideBar = new SideBar()
const miniSideBar = new MiniSideBar();
const tabs = new Tabs();

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

        updateCharges(simulationsData[this.simulationId])
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

const simulationsPage = new SideBarPage("simulations", "Simulations")
const simulationActionBar = new SideBarPageActionBar("Simulations")
simulationsPage.addItem(simulationActionBar)

const simulationsList = new SideBarList([{
    "img": "/imgs/clear.png",
    "fun": (key) => {removeSimulation(key)}
}])

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
simulationsList.setMainAction(selectListItem)

updateSimulationList = (items) => simulationsList.updateItems(items)
simulationActionBar.addAction({
    "img": "/imgs/plus.png", 
    "fun": () => simulationsList.createTempItem(createNewSimulation)}
)

simulationsPage.addItem(simulationsList)


const objectsPage = new SideBarPage("objects", "Objects")

sideBar.addPage(simulationsPage)
sideBar.addPage(objectsPage)

sideBar.render()

function updateSelected(nselected)
{
    selected = nselected
    sideBar.setActivePage(selected)
    miniSideBar.select(selected)
}

const SimulationsButton = new MiniSideBarButton(
    "simulations", 
    "/imgs/file.png", 
    ()=>{updateSelected(selected=="simulations"?null:"simulations")}, 
    "top"
)

const ObjectsButton = new MiniSideBarButton(
    "objects", 
    "/imgs/shapes.png", 
    ()=>{updateSelected(selected=="objects"?null:"objects")},  
    "top"
)

const SettingsButton = new MiniSideBarButton(
    "settings", 
    "/imgs/settings.png", 
    ()=>{console.log("tests")}, 
    "bot"
    )

miniSideBar.addButton(SimulationsButton)
miniSideBar.addButton(ObjectsButton)
miniSideBar.addButton(SettingsButton)

miniSideBar.render()

sideBar.setActivePage("simulations")
SimulationsButton.toggleSelected(true)

updateSimulationData()