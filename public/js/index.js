const topbar = document.getElementById("top-bar")

const charge_div_container = document.getElementById("charge-container")
const simulationTimeDisplay = document.getElementById("simulation-time-display")

const canvas = document.getElementById("line-canvas")
const decor_canvas = document.getElementById("decor-canvas")

import { fitText } from "./fittext.js"

const ChargeTypeToInt = {
    "Point": 0,
    "Sphere": 1,
    "Line": 2,
    "External": 3
}

const IntToChargeType = ["Point", "Sphere", "Line", "External"]

import init, { Simulation, Vector2 } from "/pkg/field_line_sim.js";

// Based on X
let view_size = 50
let view_radius = view_size/2

let width, height

let unitPerPixel
let hWidth, hHeight
let canvas_bounds

let step_distance = .05
let record_points = 60
let record_steps = 20

let point_charge_size = 30
let point_charge_start = .01//point_charge_size/unitPerPixel
let charge_density = 10
const close_spawn_distance = .055

const arrow_frequency = 10
const arrow_size = 10
const arrow_angle = Math.PI/4

// If any float has this value the line has ended there
let farValue

let field_line_floats = []

const ctx = canvas.getContext("2d")
const charge_divs = {}

let CreateChargeDiv = (charge) => {}

let charges = {}

let initialized = false

function getScreenPos(x, y)
{
    return [
        x*unitPerPixel+hWidth, 
        hHeight-y*unitPerPixel
    ]
}

function getSpacePos(x, y)
{
    return [
        (x-hWidth)/unitPerPixel,
        -(y-hHeight)/unitPerPixel
    ]
}

function getChargeColor(q)
{
    return q > 0?"#00f":"#f00"
}

function setDashedBorder(div)
{
    let imageString = "url("
    imageString += `"data:image/svg+xml,%3csvg `
    imageString += "width='100%25' height='100%25'"
    imageString += `xmlns='http://www.w3.org/2000/svg'%3e%3crect `
    imageString += `width='100%25' height='100%25' `
    imageString += `fill='none' stroke='black' stroke-width='4' `
    imageString += `stroke-dasharray='50%2c 50' `
    imageString += `stroke-dashoffset='0' `
    imageString += `stroke-linecap='square'/%3e%3c/svg%3e`
    imageString += `")`
    div.style.backgroundImage = imageString
}

function drawArrow(context, sx, sy, angle, style)
{
    const [x, y] = getScreenPos(sx, sy)

    context.fillStyle = style
    context.beginPath();
    context.moveTo(x, y);

    context.lineTo(
        x+Math.cos(angle + Math.PI-arrow_angle)*arrow_size,
        y-Math.sin(angle + Math.PI-arrow_angle)*arrow_size
        )

    context.lineTo(
        x+Math.cos(angle - Math.PI+arrow_angle)*arrow_size,
        y-Math.sin(angle - Math.PI+arrow_angle)*arrow_size
        )

    context.fill(); // Render the path

}

let OnChargeClick

function setOnChargeClick(funct)
{
    OnChargeClick = funct
}

function drawCharges()
{
    const charge_check = {}
    Object.keys(charges).map((key) => {
        const obj = charges[key]
        const div_key = key+":"+obj.type
        let div = charge_divs[div_key]

        let screen_pos = getScreenPos(obj.x, obj.y)

        switch (obj.type)
        {
            case ChargeTypeToInt['Point']:
                if (!obj.active) {return;}

                if (!div)
                {
                    div = document.createElement("div")
                    div.className = "point-charge charge"
                    div.innerText = obj.displayName
                    fitText(div, {scale: .7})

                    div.onclick = () => OnChargeClick(div, obj, key)

                    charge_divs[div_key] = div
                    charge_div_container.appendChild(div)
                    CreateChargeDiv(key, div)
                }

                div.style.borderColor = obj.q > 0? "blue":"red"
                div.style.width  = (point_charge_size*2)+"px"
                div.style.height = (point_charge_size*2)+"px"
                div.style.left = screen_pos[0]+"px"
                div.style.top = screen_pos[1]+"px"

                // setDashedBorder(div)
                
                break;
            case ChargeTypeToInt['Sphere']:
                if (!obj.active) {return;}
                if (!div)
                {
                    div = document.createElement("div")
                    div.className = "sphere-charge charge"
                    div.innerText = obj.displayName
                    fitText(div, {scale: .7})

                    div.onclick = () => OnChargeClick(div, obj, key)

                    charge_divs[div_key] = div
                    charge_div_container.appendChild(div)
                    CreateChargeDiv(key, div)
                }

                div.style.backgroundColor = obj.q > 0? "blue":"red"
                div.style.width  = (unitPerPixel*obj.r*2)+"px"
                div.style.height = (unitPerPixel*obj.r*2)+"px"
                div.style.left = screen_pos[0]+"px"
                div.style.top = screen_pos[1]+"px"
                
                break;

            case ChargeTypeToInt["Line"]:
                if (!obj.active) {return;}
                if (!div)
                {
                    div = document.createElement("div")
                    div.className = "line-charge charge"
                    // div.innerText = obj.displayName
                    // fitText(div, {scale: .7})

                    div.onclick = () => OnChargeClick(div, obj, key)

                    charge_divs[div_key] = div
                    charge_div_container.appendChild(div)
                    CreateChargeDiv(key, div)
                }

                div.style.backgroundColor = obj.q > 0? "blue":"red"
                div.style.width  = (unitPerPixel*obj.l)+"px"
                div.style.height = "3px"
                div.style.left = screen_pos[0]+"px"
                div.style.top = screen_pos[1]+"px"
                div.style.rotate = `${-obj.a}rad`
        }

        charge_check[div_key] = true
    })

    Object.keys(charge_divs).map((key) => {
        const div = charge_divs[key]

        if (!charge_check[key])
        {
            div.remove()
            delete charge_divs[key]
        }
    })
}


function clearContext(context)
{
    context.clearRect(0, 0, width, height);
}

const vaildCharges = {
    "0": true,
    "1": true,
    "2": true,
    "3": true
}

function update_field_lines()
{
    const point_charge_distance = close_spawn_distance//point_charge_size/unitPerPixel

    if (charges["settings"])
    {
        record_points = charges["settings"].record_points
        step_distance = charges["settings"].step_distance
        record_steps = charges["settings"].record_steps
        charge_density = charges["settings"].charge_density
    }

    const simulation = new Simulation(
        record_points, 
        step_distance, 
        record_steps, 
        charge_density, 
        close_spawn_distance, 
        point_charge_distance, 
        1)

    const charge_array = []
    Object.keys(charges).map((key) => {
        if (vaildCharges[charges[key].type])
            charge_array.push(charges[key])
    })

    let start = Date.now()
    simulation.create_all_field_lines(charge_array);
    field_line_floats = simulation.get_recorded_points();
    simulationTimeDisplay.innerText = ""+((Date.now()-start)/1000)+" seconds"
    
}



function render_field_lines()
{
    clearContext(ctx)

    let i = 0;
    const line_length = (record_points+1)*2

    const line_color = "rgb(150, 150, 150)"

    ctx.strokeStyle = line_color
    ctx.lineWidth = 1

    const arrows = []

    while (i < field_line_floats.length)
    {
        ctx.beginPath()
        const start_point = getScreenPos(field_line_floats[i], field_line_floats[i+1])

        let current_line_length = Math.min(field_line_floats.indexOf(farValue, i)-i, line_length)/2;
        if (current_line_length < 0)
            current_line_length = record_points+1

        let lastX = field_line_floats[i]

        let lastY = field_line_floats[i+1]

        let sLastX = field_line_floats[i]
        let sLastY = field_line_floats[i+1]

        ctx.moveTo(Math.round(start_point[0]), Math.round(start_point[1]))
        for (let j = 1; j < record_points+1; j++)
        {
            const pIndex = i + j*2

            // Hit charge edge and ended search
            if (Math.abs(field_line_floats[pIndex]-lastX) > 100)
                break;

            const point = getScreenPos(field_line_floats[pIndex], field_line_floats[pIndex+1])
            ctx.lineTo(Math.round(point[0]), Math.round(point[1]))

            // ctx.fillStyle = "red"
            // ctx.fillArc(Math.round(point[0]), Math.round(point[1]), 5, 0, Math.PI*2)

            sLastX = lastX
            sLastY = lastY

            lastX = field_line_floats[pIndex]
            lastY = field_line_floats[pIndex+1]

            // console.log(j)

            let spawn_arrow = (current_line_length < arrow_frequency*2)? 
                (Math.floor(current_line_length/2) == j):(j%arrow_frequency == 0 && j+5 < current_line_length) 
                ;

            if (spawn_arrow)
                arrows.push([lastX, lastY, Math.atan2(
                    lastY - sLastY, lastX - sLastX
                    )])
        }
        ctx.stroke()

        arrows.map((arrow) => {
            drawArrow(ctx, arrow[0], arrow[1], arrow[2], line_color)
        })
        

        i += line_length
    }
}

function update_screen_size()
{
    width = canvas.offsetWidth
    height = canvas.offsetHeight

    canvas_bounds = canvas.getBoundingClientRect()

    // console.log(width, height)

    canvas.setAttribute("width", width)
    canvas.setAttribute("height", height)

    decor_canvas.setAttribute("width", width)
    decor_canvas.setAttribute("height", height)

    hWidth = width/2 
    hHeight = height/2 

    unitPerPixel = (width/2)/view_size

    point_charge_start = point_charge_size/unitPerPixel
}

function render_update()
{
    update_screen_size()
    render_field_lines()
    drawCharges()
}

window.addEventListener('resize', render_update);

init().then(async () => {
    farValue = Vector2.neg1().get_x()
    initialized = true
});

function updateCharges(simulation)
{
    console.log("Loading Simulation with ", simulation.objects)
    charges = simulation.objects
    update_field_lines()
    render_update()
}

function isInitialized()
{
    return initialized
}

export {updateCharges, isInitialized, ChargeTypeToInt, IntToChargeType, setOnChargeClick}