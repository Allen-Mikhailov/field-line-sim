import { SideBar, SideBarSubPage, SideBarPage } from "./bars.js"

const sideBar = new SideBar()

const simulationsPage = new SideBarPage("simulations", "Worlds")
const objectsPage = new SideBarPage("objects", "Objects")

sideBar.addPage(simulationsPage)
sideBar.addPage(objectsPage)

sideBar.render()