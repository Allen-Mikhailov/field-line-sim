import { SideBar, SideBarPage, SideBarPageActionBar } from "./bars.js"

const sideBar = new SideBar()

const simulationsPage = new SideBarPage("simulations", "Worlds")
const simulationActionBar = new SideBarPageActionBar({
    "/imgs/plus.png": () => {console.log("testing")}
})

simulationsPage.addItem(simulationActionBar)

const objectsPage = new SideBarPage("objects", "Objects")

sideBar.addPage(simulationsPage)
sideBar.addPage(objectsPage)

sideBar.render()