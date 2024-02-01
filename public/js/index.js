const topbar = document.getElementById("top-bar")

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

let step_distance = .005
let record_points = 60
let record_steps = 200

let neg_charges = []

console.log("Updatinggggg")


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
}

update_screen_size()

const ctx = canvas.getContext("2d")
const decor_ctx = decor_canvas.getContext("2d")

const k = 1 //8.99 * Math.pow(10, 9)
const nano = Math.pow(10, -9)

const point_charge_size = 30
const point_charge_start = point_charge_size/unitPerPixel
const charge_density = 10
const close_spawn_distance = .01

const arrow_size = 10
const arrow_angle = Math.PI/4

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

function getScreenPosA([x, y])
{
    return getScreenPos(x, y)
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

        const screen_pos = getScreenPos(obj.x, obj.y)

        switch (obj.type)
        {
            // Point Charge
            case 0:
                ctx.strokeStyle = getChargeColor(obj.q)
                ctx.lineWidth = 2
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(Math.floor(screen_pos[0]), Math.floor(screen_pos[1]), point_charge_size, 0, Math.PI*2)
                ctx.closePath()
                ctx.stroke();
                // ctx.fill();
                break
                
        }
    })
}


const point_charge_distance = point_charge_size/unitPerPixel
console.log(point_charge_distance)


function clearContext(context)
{
    context.clearRect(0, 0, width, height);
}

function update()
{
    const simulation = new Simulation(
        record_points, 
        step_distance, 
        record_steps, 
        charge_density, 
        close_spawn_distance, 
        point_charge_start, 
        1)

    const charge_array = []
    Object.keys(charges).map((key) => {
        charge_array.push(charges[key])
    })

    console.log(charge_array)
    simulation.create_all_field_lines(charge_array)

    neg_charges = []
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        if (charge.q < 0)
            neg_charges.push(charge)
    })

    clearContext(ctx)
    // drawFieldLines()



    drawCharges()
}

init().then(() => {
    update()
});
