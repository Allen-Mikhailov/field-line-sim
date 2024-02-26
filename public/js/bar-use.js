import { SideBar, SideBarPage, SideBarPageActionBar, SideBarList, MiniSideBarButton, MiniSideBar } from "./bars.js"

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

function createNewSimulation(name)
{
    const newSimulation = {
        "displayName": name,
        "settings": {

        },
        "objects": {

        }
    }

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

const simulationsPage = new SideBarPage("simulations", "Simulations")
const simulationActionBar = new SideBarPageActionBar("Simulations")
simulationsPage.addItem(simulationActionBar)

const simulationsList = new SideBarList([{
    "img": "/imgs/clear.png",
    "fun": (key) => {removeSimulation(key)}
}])
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