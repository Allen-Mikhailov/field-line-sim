import { SideBar, SideBarPage, SideBarPageActionBar } from "./bars.js"

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