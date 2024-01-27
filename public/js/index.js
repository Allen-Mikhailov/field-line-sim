const topbar = document.getElementById("top-bar")

const canvas = document.getElementById("line-canvas")

// Based on X
let view_size = 50
let view_radius = view_size/2

const width = canvas.offsetWidth
const height = canvas.offsetHeight

let unitPerPixel = (width/2)/view_size

// Just gets rid of a divide from the cop
let hWidth = width/2 
let hHeight = height/2 

console.log(width, height)

canvas.setAttribute("width", width)
canvas.setAttribute("height", height)

const ctx = canvas.getContext("2d")
const point_charge_size = 10

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
                ctx.fillStyle = getChargeColor(obj.q)
                ctx.beginPath();
                ctx.arc(Math.floor(screen_pos[0]), Math.floor(screen_pos[1]), point_charge_size, 0, Math.PI*2)
                ctx.fill();
                break
                
        }
    })
}

function getFieldLinePoints(charge)
{

}

function drawFieldLines() 
{

}

function update()
{
    drawFieldLines()
    drawCharges()
}

update()