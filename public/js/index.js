const topbar = document.getElementById("top-bar")

const charge_div_container = document.getElementById("charge-container")

const canvas = document.getElementById("line-canvas")
const decor_canvas = document.getElementById("decor-canvas")

import init, { Simulation, ChargeType } from "/pkg/field_line_sim.js";

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

const k = 1 //8.99 * Math.pow(10, 9)
const nano = Math.pow(10, -9)

const point_charge_size = 30
let point_charge_start = point_charge_size/unitPerPixel
const charge_density = 10
const close_spawn_distance = .01

const arrow_size = 10
const arrow_angle = Math.PI/4

function update_screen_size()
{
    width = canvas.offsetWidth
    height = canvas.offsetHeight

    canvas_bounds = canvas.getBoundingClientRect()

    console.log(width, height)

    canvas.setAttribute("width", width)
    canvas.setAttribute("height", height)

    decor_canvas.setAttribute("width", width)
    decor_canvas.setAttribute("height", height)

    hWidth = width/2 
    hHeight = height/2 

    unitPerPixel = (width/2)/view_size

    point_charge_start = point_charge_size/unitPerPixel
}

update_screen_size()

const ctx = canvas.getContext("2d")
const charge_divs = {}

const charges = {
    "test-charge": {
        x: 0,
        y: 0,
        q: -1,
        type: 0,
    },
}

for (let i = 0; i < 3; i++)
{
    const newCharge = {
        x: (Math.random()-.5)*2 * 35,
        y: (Math.random()-.5)*2 * 20,
        q: 1,
        type: 0
    }
    charges[""+i] = newCharge
}

console.log(charges)

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

function drawCharges()
{
    Object.keys(charges).map((key) => {
        const obj = charges[key]
        let div = charge_divs[key]
        if (!div)
        {
            div = document.createElement("div")
            div.className = "charge"

            charge_div_container.appendChild(div)
        }

        div.style.borderColor = obj.q > 0? "blue":"red"
        div.style.width  = (point_charge_size*2)+"px"
        div.style.height = (point_charge_size*2)+"px"
        const screen_pos = getScreenPos(obj.x, obj.y)

        div.style.left = screen_pos[0]+"px"
        div.style.top = screen_pos[1]+"px"


        // switch (obj.type)
        // {
        //     // Point Charge
        //     case 0:
        //         ctx.strokeStyle = getChargeColor(obj.q)
        //         ctx.lineWidth = 2
        //         ctx.setLineDash([5, 5]);
        //         ctx.beginPath();
        //         ctx.arc(Math.floor(screen_pos[0]), Math.floor(screen_pos[1]), point_charge_size, 0, Math.PI*2)
        //         ctx.closePath()
        //         ctx.stroke();
        //         // ctx.fill();
        //         break
                
        // }
    })
}


function clearContext(context)
{
    context.clearRect(0, 0, width, height);
}

function update_field_lines()
{
    const point_charge_distance = point_charge_size/unitPerPixel
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
        charge_array.push(charges[key])
    })

    let start = Date.now()
    simulation.create_all_field_lines(charge_array);
    const float_array = simulation.get_recorded_points();
    console.log("Calculation time: "+((Date.now()-start)/1000))
    
    let i = 0;
    const line_length = (record_points+1)*2

    const line_color = "rgba(255, 255, 255, .5)"

    ctx.strokeStyle = line_color
    ctx.lineWidth = 1

    while (i < float_array.length)
    {
        ctx.beginPath()
        const start_point = getScreenPos(float_array[i], float_array[i+1])

        let lastX = float_array[i]
        let lastY = float_array[i+1]

        let sLastX = float_array[i]
        let sLastY = float_array[i+1]

        ctx.moveTo(Math.round(start_point[0]), Math.round(start_point[1]))
        for (let j = 1; j < record_points; j++)
        {
            const pIndex = i + j*2

            // Hit charge edge and ended search
            if (Math.abs(float_array[pIndex]-lastX) > 5000)
                break;

            const point = getScreenPos(float_array[pIndex], float_array[pIndex+1])
            ctx.lineTo(Math.round(point[0]), Math.round(point[1]))

            sLastX = lastX
            sLastY = lastY

            lastX = float_array[pIndex]
            lastY = float_array[pIndex+1]

            // if (j%arrow_frequency == 0 || j == record_points-1)
            //     drawArrow(ctx, lastX, lastY, Math.atan2(
            //         lastY - sLastY, lastX - sLastX
            //         ), line_color)
        }
        ctx.stroke()

        drawArrow(ctx, lastX, lastY, Math.atan2(
            lastY - sLastY, lastX - sLastX
            ), line_color)

        

        i += line_length
    }
}

function update()
{
    

    clearContext(ctx)
    update_field_lines()

    drawCharges()
}

init().then(async () => {
    update()
});
