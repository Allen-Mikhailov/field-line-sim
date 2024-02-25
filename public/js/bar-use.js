import { SideBar, SideBarPage, SideBarPageActionBar, MiniSideBarButton, MiniSideBar } from "./bars.js"

const sideBar = new SideBar()

const simulationsPage = new SideBarPage("simulations", "Worlds")
const simulationActionBar = new SideBarPageActionBar([
    {"img": "/imgs/plus.png", "fun": () => {console.log("testing")}},
    {"img": "/imgs/run.png", "fun": () => {console.log("testing")}}
], "Worlds")

simulationsPage.addItem(simulationActionBar)

sideBar.addPage(simulationsPage)

const objectsPage = new SideBarPage("objects", "Objects")

sideBar.addPage(objectsPage)

sideBar.render()

const miniSideBar = new MiniSideBar();

const WorldsButton = new MiniSideBarButton("worlds", "/imgs/plus.png", ()=>{console.log("tests")}, "top")
miniSideBar.addButton(WorldsButton)

const SettingsButton = new MiniSideBarButton("settings", "/imgs/plus.png", ()=>{console.log("tests")}, "bot")
miniSideBar.addButton(SettingsButton)

miniSideBar.render()