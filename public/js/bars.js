const tabBar = document.getElementById("tab-bar")
const toolBar = document.getElementById("tool-bar")
const sideBar = document.getElementById("side-bar")

const sideBarSelect = document.getElementById("side-bar-select")
const sideBarPageContainer = document.getElementById("side-bar-page-container")

fitText(document.getElementById("side-bar-title"), 1)

class SideBarPageActionBar
{
    constructor(actions)
    {
        // Dictionary
        this.actions = actions
    }

    render(parent)
    {
        const container = document.createElement("div")
        container.classList.add("side-bar-page-action-bar")

        parent.pageElement.appendChild(container)
    }
}

class SideBarPage
{
    constructor(name, displayName)
    {
        this.name = name;
        this.displayName = displayName;
        this.items = []
    }

    addItem(item)
    {
        this.items.push(item)
    }

    render(parent)
    {
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
        fitText(pageSelect, .7)

        pageSelect.onclick = () => {
            parent.setActivePage(this.name)
        }

        sideBarSelect.appendChild(pageSelect)

        this.pageSelect = pageSelect

        this.items.map((item) => {
            item.render(this)
        })
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

export {SideBar, SideBarPage, SideBarPageActionBar}