const topbar = document.getElementById("top-bar")

const canvas = document.getElementById("line-canvas")
const decor_canvas = document.getElementById("decor-canvas")

// Based on X
let view_size = 50
let view_radius = view_size/2

let width, height

let unitPerPixel
let hWidth, hHeight
let canvas_bounds

let step_distance = .05
let record_steps = 60
let steps_per_record = 20

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

function getPointChargeFieldLinePoint(charge, alpha)
{
    return [
        Math.cos(2*Math.PI*alpha)*close_spawn_distance + charge.x,
        Math.sin(2*Math.PI*alpha)*close_spawn_distance + charge.y,
    ]
}

function getFieldLinePoints(charge)
{
    if (charge.q < 0)
        return []

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

    return points
}

function getField(x, y)
{
    let fx = 0
    let fy = 0
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        switch (charge.type) 
        {
            case 0:
                const angle = Math.atan2(y-charge.y, x-charge.x)
                const mag = k*charge.q/Math.hypot(y-charge.y, x-charge.x)
                fx += mag * Math.cos(angle)
                fy += mag * Math.sin(angle)
                break;
        }
    })

    return [fx, fy]
}

const point_charge_distance = point_charge_size/unitPerPixel
console.log(point_charge_distance)
function inNegative(x, y)
{
    let in_neg = false
    neg_charges.map((charge) => {
        if (Math.hypot(x-charge.x, y-charge.y) <= point_charge_distance)
            in_neg = true
    })
    return in_neg
}

function getFieldLine([sx, sy])
{
    const new_line = [[sx, sy]]
    let x = sx
    let y = sy

    for (let i = 0; i < record_steps; i++)
    {
        const past_steps = []
        for (let j = 0; j < steps_per_record; j++)
        {
            const [fx, fy] = getField(x, y)
            const angle = Math.atan2(fy, fx)
            x += Math.cos(angle)*step_distance
            y += Math.sin(angle)*step_distance

            past_steps.push([x, y])
        }

        if (inNegative(x, y))
        {
            let lastStep = past_steps.length-1
            
            while (lastStep > 0 && inNegative(past_steps[lastStep][0], past_steps[lastStep][1]))
            {
                lastStep--;
            }
            x = past_steps[lastStep][0]
            y = past_steps[lastStep][1]
        }


        new_line.push([x, y])
    }

    return new_line
}

function drawFieldLines() 
{
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        const start_points = getFieldLinePoints(charge)

        let start = Date.now()
        const space_lines = start_points.map(getFieldLine)
        console.log("Calculation time: "+((Date.now()-start)/1000))

        space_lines.map(line => {
            const screen_line = line.map(getScreenPosA)    

            ctx.strokeStyle = "white"
            ctx.lineWidth = .5
            ctx.beginPath()
            ctx.moveTo(screen_line[0][0], screen_line[0][1])
            for (let i = 1; i < screen_line.length; i++)
            {
                ctx.lineTo(screen_line[i][0], screen_line[i][1])
            }
            // ctx.closePath()
            ctx.stroke()

            const lastPoint = line[line.length-1]
            const field = getField(lastPoint[0], lastPoint[1])

            drawArrow(ctx, lastPoint[0], lastPoint[1], Math.atan2(field[1], field[0]), "white")
        })
        
    })
}

function clearContext(context)
{
    context.clearRect(0, 0, width, height);
}

function update()
{
    neg_charges = []
    Object.keys(charges).map((key) => {
        const charge = charges[key]
        if (charge.q < 0)
            neg_charges.push(charge)
    })

    clearContext(ctx)
    drawFieldLines()
    drawCharges()
}

update()

const mouse_field_distance = 40
document.body.onmousemove = (e) => {
    const x = e.clientX-canvas_bounds.x
    const y = e.clientY-canvas_bounds.y

    const space_pos = getSpacePos(x, y)

    const field = getField(space_pos[0], space_pos[1])
    const c = Math.hypot(field[0], field[1])
    const normal_field = [field[0]/c, field[1]/c]

    clearContext(decor_ctx)
    decor_ctx.strokeStyle = "red"
    decor_ctx.beginPath(); // Start a new path
    decor_ctx.moveTo(x, y); // Move the pen to (30, 50)

    const nx = x+normal_field[0]*mouse_field_distance
    const ny = y-normal_field[1]*mouse_field_distance

    decor_ctx.lineTo(nx, ny); 
    decor_ctx.stroke(); // Render the path

    const end_space_pos = getSpacePos(nx, ny)

    // drawArrow(decor_ctx, 0, 0, Math.PI/2, "red")
    drawArrow(decor_ctx, 
        end_space_pos[0], 
        end_space_pos[1], 
        Math.atan2(normal_field[1], normal_field[0]), "red")
}