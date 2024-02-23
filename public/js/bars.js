const tabBar = document.getElementById("tab-bar")
const toolBar = document.getElementById("tool-bar")
const sideBar = document.getElementById("side-bar")

const sideBarSelect = document.getElementById("side-bar-select")
const sideBarPageContainer = document.getElementById("side-bar-page-container")

fitText(document.getElementById("tab-bar-title"), .8)

class SideBarPageActionBar
{
    constructor(actions, title)
    {
        // Dictionary
        this.actions = actions

        if (title)
            this.title = title
    }

    render(parent)
    {
        const container = document.createElement("div")
        container.classList.add("side-bar-page-action-bar")

        if (this.title)
        {
            const titleEl = document.createElement("div")
            titleEl.classList.add("side-bar-page-action-bar-title")
            titleEl.innerHTML = this.title
            container.appendChild(titleEl)

            fitText(titleEl, .7)
        }

        const buttonContainer = document.createElement("div")
        buttonContainer.classList.add("container")

        this.actions.map(({img, fun}) => {
            const button = document.createElement("div")
            button.style.backgroundImage = `url(${img})`
            button.classList.add("small-button")

            button.onclick = fun

            buttonContainer.appendChild(button)
        })

        container.appendChild(buttonContainer)

        parent.pageElement.appendChild(container)
    }
}

class SideBarList
{
    constructor(item_actions, height)
    {
        this.items = {}
        this.item_divs = {}
        this.item_actions = item_actions
        this.selected = null

        if (height)
            this.height = height
    }

    updateItems(new_items)
    {
        this.items = new_items

        // Removing Old Items
        Object.keys(this.item_divs).map((key) => {
            if (!this.items[key])
            {
                this.item_divs[key].remove()
                delete this.item_divs[key]
            }
        })

        // Creating and updating elements
        Object.keys(this.items).map((key) => {
            let el = this.item_divs[key]
            if (!el)
            {
                el = document.createElement("div")
                el.classList.add("")
            }
        })
    }

    render(parent)
    {
        const list = document.createElement("div")
        list.classList.add("side-bar-page-list")

        if (this.height)
            list.style.height = this.height

        parent.appendChild(list)
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
        Object.keys(this.pages).map((key) => {
            console.log("render", key)
            const page = this.pages[key]
            page.render(this)
        })

        this.setActivePage(this.activePage)
    }
}

export {SideBar, SideBarPage, SideBarPageActionBar}