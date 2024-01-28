const topbar = document.getElementById("top-bar")

const canvas = document.getElementById("line-canvas")
const decor_canvas = document.getElementById("line-canvas")

// Based on X
let view_size = 50
let view_radius = view_size/2

let width, height

const k = 1 //8.99 * Math.pow(10, 9)
const nano = Math.pow(10, -9)

let unitPerPixel
let hWidth, hHeight

console.log(width, height)

function update_screen_size()
{
    width = canvas.offsetWidth
    height = canvas.offsetHeight

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

const point_charge_size = 10
const point_charge_start = point_charge_size/unitPerPixel
const charge_density = 10
const close_spawn_distance = .01

const charges = {
    "test-charge": {
        x: 0,
        y: 0,
        q: 1,
        type: 0,
    }
}

function getScreenPos(x, y)
{
    return [x*unitPerPixel+hWidth, hHeight-y*unitPerPixel]
}

function getChargeColor(q)
{
    return q > 0?"#f00":"#000"
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

function getPointChargeFieldLinePoint(charge, alpha)
{
    return [
        Math.cos(2*Math.PI*alpha)*close_spawn_distance + charge.x,
        Math.sin(2*Math.PI*alpha)*close_spawn_distance + charge.y,
    ]
}

function getFieldLinePoints(charge)
{
    let funct;
    switch (charge.type)
    {
        // Point Charge
        case 0:
            funct = getPointChargeFieldLinePoint
            break;
            
    }

    const points = []
    const lineCount = charge.q * charge_density;
    for (let i = 0; i < lineCount; i++)
    {
        const alpha = i/lineCount;
        points.push(funct(charge, alpha))
    }
}

function getField(x, y)
{
    let fx = 0
    let fy = 0
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        switch (charge.type) 
        {
            case 1:
                const angle = Math.atan2(y-charge.y, x-charge.x)
                const mag = k*charge.q/Math.hypot(y-charge.y, x-charge.x)
                fx += mag * Math.cos(angle)
                yy += mag * Math.sin(angle)
                break;
        }
    })

    return [fx, fy]
}

function getFieldLine(point)
{

}

function drawFieldLines() 
{
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        const start_points = getFieldLinePoints(charge)
    })
}

function clearContext(context)
{
    context.fillStyle = "rgba(0, 0, 0, 0)"
    context.fillRect(0, 0, width, height)
}

function update()
{
    clearContext(ctx)

    drawFieldLines()
    drawCharges()
}

function frame_update()
{
    update()

    requestAnimationFrame(frame_update)
}

frame_update()