const tabBar = document.getElementById("tab-bar")
const toolBar = document.getElementById("tool-bar")
const sideBar = document.getElementById("side-bar")

const sideBarSelect = document.getElementById("side-bar-select")
const sideBarPageContainer = document.getElementById("side-bar-page-container")

fitText(document.getElementById("side-bar-title"), .8)

class SideBarSubPage
{
    constructor(name, displayName)
    {
        this.name = name
    }

    render(parent)
    {

    }
}

class SideBarPage
{
    constructor(name, displayName)
    {
        this.name = name;
        this.displayName = displayName;
        this.subpages = {}
    }

    addSubPage(page)
    {
        this.subpages[page.name] = page
    }

    render(parent)
    {
        console.log("render2")
        const pageElement = document.createElement("div")
        pageElement.classList.add("side-bar-page")
        pageElement.style.visibility = "hidden"
        sideBarPageContainer.appendChild(pageElement)

        this.pageElement = pageElement

        const buttons = Object.keys(parent.pages).length

        const pageSelect = document.createElement("div")
        pageSelect.classList.add("side-bar-select-button")
        pageSelect.style.width = `calc(var(--side-bar-space) / ${buttons})`
        pageSelect.innerHTML = this.displayName
        fitText(pageSelect, .8)

        pageSelect.onclick = () => {
            parent.setActivePage(this.name)
        }

        sideBarSelect.appendChild(pageSelect)

        this.pageSelect = pageSelect
    }
}

class SideBar
{
    constructor()
    {
        this.pages = {}
        this.activePage = null
    }

    addPage(page)
    {
        if (!this.activePage)
            this.activePage = page.name
        this.pages[page.name] = page
    }

    setActivePage(name)
    {
        Object.keys(this.pages).map((key) => {
            const page = this.pages[key];
            const active = name == page.name;
            page.pageSelect.className = `side-bar-select-button ${active?"selected":""}`
            page.pageElement.style.visibility = active?"visible":"hidden"
        })
    }

    render()
    {
        console.log("render")
        Object.keys(this.pages).map((key) => {
            console.log("render", key)
            const page = this.pages[key]
            page.render(this)
        })

        this.setActivePage(this.activePage)
    }
}

export {SideBar, SideBarPage, SideBarSubPage}