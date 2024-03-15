import {fitText} from "./fittext.js"

const tabBar = document.getElementById("tab-bar")
const toolBar = document.getElementById("tool-bar")
const sideBar = document.getElementById("side-bar")
const miniSideBar = document.getElementById("mini-side-bar")
const miniSideBarTop = miniSideBar.children[0]
const miniSideBarBot = miniSideBar.children[1]

const allsTabContainer = document.getElementById("alls-tab-container")

const sideBarSelect = document.getElementById("side-bar-select")
const sideBarPageContainer = document.getElementById("side-bar-page-container")

fitText(document.getElementById("tool-bar-title"), {scale: .5})
fitText(document.getElementById("side-bar-title"), {scale: .8})

class SideBarPageActionBar
{
    constructor(title, actions)
    {
        // Dictionary
        this.actions = actions || []

        if (title)
            this.title = title
    }

    addAction(action)
    {
        this.actions.push(action)
    }

    render(parent)
    {
        const container = document.createElement("div")
        container.classList.add("side-bar-page-action-bar")

        if (this.title)
        {
            const titleEl = document.createElement("div")
            titleEl.classList.add("side-bar-page-action-bar-title")
            titleEl.innerText = this.title
            container.appendChild(titleEl)

            fitText(titleEl, {scale: .7})
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
    constructor()
    {
        this.items = {}
        this.item_divs = {}
        this.selected = ""
        this.item_actions = []
        this.temp_item = null
    }

    setItemActions(item_actions)
    {
        this.item_actions = item_actions
    }

    setMainAction(main_action)
    {
        this.main_action = main_action
    }

    updateItems(new_items)
    {
        this.items = new_items

        // Removing Old Items
        Object.keys(this.item_divs).map((key) => {
            if (!this.items[key])
            {
                Object.keys(this.item_divs[key]).map((objectName) => {
                    // console.log("ObjectKey", objectName,  this.item_divs, key)
                    this.item_divs[key][objectName].remove()
                })
                delete this.item_divs[key]
            }
        })

        // Creating and updating elements
        Object.keys(this.items).map((key) => {
            let els = this.item_divs[key]
            if (!els)
            {
                els = {}
                const el = document.createElement("div")
                el.classList.add("side-bar-page-list-item")

                el.onclick = (e) => {
                    this.main_action(key);
                    e.stopPropagation()
                }

                const titleEl = document.createElement("div")
                titleEl.classList.add("title")
                el.appendChild(titleEl)
                els["label"] = titleEl

                fitText(titleEl, {scale: .5})

                const buttonContainer = document.createElement("div")
                buttonContainer.classList.add("container")

                this.item_actions.map(({img, fun}) => {
                    const actionEl = document.createElement("div")
                    actionEl.classList.add("small-button")
                    actionEl.onclick = (e) => {
                        fun(key)
                        e.stopPropagation()
                    }
                    actionEl.style.backgroundImage = `url(${img})`

                    buttonContainer.appendChild(actionEl)
                })

                el.appendChild(buttonContainer)
                els["container"] = el
                this.el.appendChild(el)

                this.item_divs[key] = els
            }

            els["label"].innerText = this.items[key].displayName
        })
    }

    updateSelected(select)
    {
        this.selected = select
        Object.keys(this.items).map((key) => {
            let el = this.item_divs[key]
            el["container"].className = `side-bar-page-list-item ${this.selected==key?"selected":""}`
        })
    }

    createTempItem(onFinalize)
    {
        if (this.temp_item)
        {
            this.temp_item.remove()
        }
    
        const tempElement = document.createElement("div")
        tempElement.classList.add("side-bar-page-list-new")

        const inputElement = document.createElement("input")
        inputElement.type = "text"
        tempElement.appendChild(inputElement)

        let created

        function launch(p)
        {
            if (created) {return;}
            created = true
            if (inputElement.value != "")
            {
                onFinalize(inputElement.value)
            }

            tempElement.remove()
            p.temp_item = null
        }

        fitText(inputElement, {scale: .5})

        inputElement.onkeydown = (e) => {
            if (e.key == "Enter")
                launch(this)
        }
        inputElement.onblur = () => {launch(this)}

        console.log(this)

        this.el.appendChild(tempElement)

        inputElement.focus()

        this.tempElement = tempElement
    }

    render(parent)
    {
        const list = document.createElement("div")
        list.classList.add("side-bar-page-list")

        if (this.height)
            list.style.height = this.height

        this.el = list

        parent.pageElement.appendChild(list)
    }
}

function updateDropdownProperties(sideBarProperties, property, object, els)
{   
    els["label"].innerText = property.displayName
    els["value"].innerText = property.values[object[property.name]] 
        || ("invalid dropdown value: "+object[property.name])

    Object.keys(property.values).map((key) => {
        const str = property.values[key]

        let optionDiv = els["option:"+key]

        if (!optionDiv)
        {
            optionDiv = document.createElement("div")
            optionDiv.className = "property-dropdown-item"
            fitText(optionDiv, {xScale: .8, yScale: .6})
            optionDiv.onclick = (e) => {
                // console.log(property.name, key)
                sideBarProperties.on_update(property.name, parseFloat(key))
                // e.stopPropagation()
            }
            els["dropdown-container"].appendChild(optionDiv)

            els["option:"+key] = optionDiv
        }

        optionDiv.innerText = str
        optionDiv.className = `property-dropdown-item${key == object[property.name]?" selected":""}`
    })
}

class SideBarProperties
{
    constructor()
    {
        this.get_properties = null
        this.on_update = null
        this.propertyEls = {}
        this.object = {}
    }

    setOnUpdate(on_update)
    {
        this.on_update = on_update
    }

    setGetProperties(get_properties)
    {
        this.get_properties = get_properties
    }

    updateObject(object)
    {
        this.object = object
        const properties = object==null?[]:this.get_properties(object)
        const propertyStrings = {}

        properties.map((property, index) => {
            const string = property.name + ":" + property.type
            propertyStrings[string] = property

            let els = this.propertyEls[string]

            if (!els)
            {
                const propertyContainer = document.createElement("div")
                propertyContainer.style.order = ""+index
                els = {
                    "container": propertyContainer
                }

                if (property.type == "string" || property.type == "float")
                {
                    propertyContainer.className = "property-container"

                    // Label
                    const label = document.createElement("div")
                    label.className = "property-label"
                    els["label"] = label
                    propertyContainer.appendChild(label)

                    fitText(label, {xScale: .8, yScale: .6})
                    const input = document.createElement("input")

                    if (property.type == "string")
                        input.type = "string"
                    else
                        input.type = "number"
                    
                    input.className = "property-string"
                    input.onblur = ((e) => {
                        let passedValue = input.value
                        if (property.type == "float")
                            passedValue = parseFloat(input.value)

                        this.on_update(property.name, passedValue)
                    })
                    input.onkeydown = ((e) => {
                        if (e.key == "Enter")
                            input.blur()
                    })
                    els["input"] = input
                    propertyContainer.appendChild(input)

                    fitText(input, {xScale: .8, yScale: .6, property: "value"})
                }

                if (property.type == "dropdown")
                {
                    propertyContainer.className = "property-container"

                    // Label
                    const label = document.createElement("div")
                    label.className = "property-label"
                    els["label"] = label
                    propertyContainer.appendChild(label)

                    fitText(label, {xScale: .8, yScale: .6})
                    const dropdown = document.createElement("div")
                    dropdown.className = "property-dropdown"

                    const dropdownContainer = document.createElement("div")
                    dropdownContainer.className = "property-dropdown-container"
                    dropdownContainer.style.display = "none"
                    els["dropdown-container"] = dropdownContainer


                    let toggled
                    function updateToggle(newToggle)
                    {
                        toggled = newToggle
                        dropdownContainer.style.display = toggled?"block":"none"
                    }
                    updateToggle(false)

                    const dropdownValue = document.createElement("div")
                    dropdownValue.className = "property-dropdown-value"
                    dropdownValue.onclick = () => {
                        updateToggle(!toggled)
                        if (toggled)
                        {
                            dropdownContainer.focus()
                        }
                    }
                    dropdown.appendChild(dropdownValue)

                    dropdownContainer.onclick = (e) => {
                        updateToggle(false)
                        e.stopPropagation()
                    }

                    fitText(dropdownValue, {xScale: .8, yScale: .6})

                    dropdown.appendChild(dropdownContainer)

                    propertyContainer.appendChild(dropdown)

                    els["value"] = dropdownValue

                    updateDropdownProperties(this, property, object, els)
                }
                
                
                this.propertyEls[string] = els
                this.el.appendChild(propertyContainer)
            }

            switch (property.type)
            {
                case "float":
                    els["label"].innerText = property.displayName
                    els["input"].value = object[property.name]
                    break;
                case "string":
                    els["label"].innerText = property.displayName
                    els["input"].value = object[property.name]
                    break;
                case "dropdown":
                    updateDropdownProperties(this, property, object, els)
                    break;
            }
        })

        // Removing Old Elements
        Object.keys(this.propertyEls).map((pString) => {
            if (!propertyStrings[pString])
            {
                Object.keys(this.propertyEls[pString]).map((key) => {
                    this.propertyEls[pString][key].remove()
                })
                delete this.propertyEls[pString]
            }
        })
    }

    render(parent)
    {
        const list = document.createElement("div")
        list.classList.add("side-bar-page-properties")

        this.el = list

        parent.pageElement.appendChild(list)
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
        pageElement.style.display = "none"
        sideBarPageContainer.appendChild(pageElement)

        this.pageElement = pageElement

        if (parent.options.navigation)
        {
            const buttons = Object.keys(parent.pages).length

            const pageSelect = document.createElement("div")
            pageSelect.classList.add("side-bar-select-button")
            pageSelect.style.width = `calc(var(--main-side-bar-space) / ${buttons})`
            pageSelect.innerText = this.displayName
            fitText(pageSelect, {scale: .7})

            pageSelect.onclick = () => {
                parent.setActivePage(this.name)
            }

            sideBarSelect.appendChild(pageSelect)

            this.pageSelect = pageSelect
        }

        this.items.map((item) => {
            item.render(this)
        })
    }
}

class SideBar
{
    constructor(title, options)
    {
        this.title = title
        this.options = options || {}

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
            page.pageElement.style.display = active?"flex":"none"

            if (this.options.navigation)
            {
                page.pageSelect.className = `side-bar-select-button ${active?"selected":""}`
            }
        })
    }

    render()
    {
        if (!this.options.navigation)
            document.getElementById("side-bar-select").remove()

        Object.keys(this.pages).map((key) => {
            const page = this.pages[key]
            page.render(this)
        })

        this.setActivePage(this.activePage)
    }
}

class MiniSideBar
{
    constructor()
    {
        this.selected = undefined
        this.buttons = {}
    }
    
    addButton(button)
    {
        this.buttons[button.name] = button
    }

    select(selected)
    {
        this.selected = selected;

        Object.keys(this.buttons).map((key) => {
            this.buttons[key].toggleSelected(this.selected == key)
        })
    }

    render()
    {
        Object.keys(this.buttons).map((key) => {
            this.buttons[key].render(this)
        })
    }
}

class MiniSideBarButton
{
    constructor(name, icon, location)
    {
        this.name = name;
        this.icon = icon;
        this.location = location;

        this.el = undefined;
    }

    addAction(action)
    {
        this.action = action
    }

    render(miniSideBar)
    {
        const el = document.createElement("div")
        el.classList.add("mini-bar-side-button")

        el.onclick = () => {this.action(this, miniSideBar)}

        const borderEl = document.createElement("div")
        borderEl.classList.add("border")
        el.appendChild(borderEl)

        const imgEl = document.createElement("div")
        imgEl.classList.add("image")
        imgEl.style.backgroundImage = `url(${this.icon})`
        el.appendChild(imgEl)

        const parent = this.location=="top"?miniSideBarTop:miniSideBarBot
        parent.appendChild(el)

        this.el = el;
    }

    toggleSelected(value)
    {
        this.el.className = `mini-bar-side-button ${value?"selected":""}`
    }
}

class Tabs
{
    constructor()
    {
        this.tabs = {}
        this.selectedTab = null
    }

    selectRawTab(tab)
    {
        if (this.selectedTab)
            this.selectedTab.close()

        this.selectedTab = tab

        if (tab)
            tab.render()

        Object.keys(this.tabs).map((key) => {
            const ctab = this.tabs[key]
            if (ctab.buttonEl)
                ctab.buttonEl.className = `tab-button ${ctab==tab?"selected":""}`
        })
    }

    selectTab(tab)
    {
        this.selectRawTab(this.selectedTab == tab?null:tab)
    }

    removeTab(tab)
    {
        if (tab.buttonEl)
            tab.buttonEl.remove()

        if (tab.tabContainer)
            tab.tabContainer.remove()
        
        delete this.tabs[tab.id]
        
        if (this.selectedTab === tab)
        {
            tab.close()
            let newSelect = null
            Object.keys(this.tabs).map((tabId) => {
                newSelect = this.tabs[tabId]
            })
            this.selectRawTab(newSelect)
        }
    }

    addTab(tab)
    {
        const tabButtonEl = document.createElement("div")
        tabButtonEl.classList.add("tab-button")

        tabButtonEl.onclick = () => this.selectTab(tab)

        const tabButtonTitle = document.createElement("div")
        tabButtonTitle.classList.add("tab-button-title")
        tabButtonTitle.innerText = tab.displayName
        tabButtonEl.appendChild(tabButtonTitle)

        fitText(tabButtonTitle, {xScale: 100, yScale: .4})

        const tabButtonX = document.createElement("div")
        tabButtonX.classList.add("small-button")
        tabButtonX.style.backgroundImage = `url("/imgs/x.png")`
        tabButtonX.onclick = (e) => {
            this.removeTab(tab)
            e.stopPropagation()
        }
        tabButtonEl.appendChild(tabButtonX)

        const tabBorderRemovalTop = document.createElement("div")
        tabBorderRemovalTop.className = "anti-border top"
        tabButtonEl.appendChild(tabBorderRemovalTop)

        const tabBorderRemovalBottom = document.createElement("div")
        tabBorderRemovalBottom.className = "anti-border bottom"
        tabButtonEl.appendChild(tabBorderRemovalBottom)

        if (this.tabs[tab.id])
            this.removeTab(this.tabs[tab.id])

        tab.buttonEl = tabButtonEl
        this.tabs[tab.id] = tab

        tabBar.appendChild(tabButtonEl)
    }
}

class Tab
{
    constructor(id, displayName)
    {
        this.id = id
        this.displayName= displayName || id
    }

    render()
    {
        const tabContainer = document.createElement("div")
        tabContainer.classList.add("tab-container")

        allsTabContainer.appendChild(tabContainer)

        this.containerEl = tabContainer

        return tabContainer
    }

    close()
    {
        if (this.containerEl)
            this.containerEl.remove()
    }
}

export {
    SideBar, 
    SideBarPage, 
    SideBarPageActionBar, 
    SideBarList, 
    SideBarProperties,
    
    MiniSideBar, 
    MiniSideBarButton,

    Tabs,
    Tab

}