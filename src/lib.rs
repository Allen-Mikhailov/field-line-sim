// wasm-pack build --target web
use std::vec;
use std::f32::consts;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Vector2
{
    x: f32,
    y: f32,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct SimData
{
    record_frames: u32,
    step_distance: f32,
    steps_per_record: u32,
}

#[wasm_bindgen]
impl Vector2 
{
    pub fn new(x: f32, y: f32) -> Vector2 {
        Vector2 {x, y}
    }

    pub fn from_angle(a: f32, mag: f32) -> Vector2
    { return Vector2 { x: (a.cos()*mag), y: (a.sin()*mag) } }

    pub fn add(&mut self, v2: &Vector2)
    { self.x += v2.x; self.y += v2.y; }

    pub fn sub(&mut self, v2: &Vector2)
    { self.x -= v2.x; self.y -= v2.y; }

    pub fn add_from_angle(&mut self, a: f32, mag: f32)
    { self.x += a.cos()*mag; self.y += a.sin()*mag}

    pub fn sub_from_angle(&mut self, a: f32, mag: f32)
    { self.x -= a.cos()*mag; self.y -= a.sin()*mag}

    pub fn get_x(&self) -> f32
    { return self.x; }

    pub fn get_y(&self) -> f32 
    { return self.y; }

    pub fn set_x(&mut self, x: f32) 
    { self.x = x; }

    pub fn set_y(&mut self, y: f32)
    { self.y = y; }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum ChargeType
{
    Point,
    Sphere,
    Line
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Charge
{
    pos: Vector2,
    q: f32,
    charge_type: ChargeType
}

#[wasm_bindgen]
impl Charge
{
    pub fn new(x: f32, y: f32, q: f32, charge_type: ChargeType) -> Charge 
    { return Charge {pos: Vector2 {x, y}, q, charge_type} }

    pub fn get_pos(&mut self) -> Vector2
    { return self.pos; }

    pub fn set_pos(&mut self, pos: Vector2)
    { self.pos = pos; }

    pub fn get_q(&self) -> f32
    { return self.q; }

    pub fn set_q(&mut self, q: f32)
    { self.q = q; } 

    pub fn get_charge_type(&self) -> ChargeType
    { return self.charge_type; }

    pub fn set_charge_type(&mut self, charge_type: ChargeType)
    { self.charge_type = charge_type }
}

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) -> u32{
    console_log!("testing");
    return 5;
}

pub fn get_field(charges: &Vec<Charge>, pos: &Vector2) -> Vector2
{
    let mut field: Vector2 = Vector2 { x: 0f32, y: 0f32 };
    for charge in charges.iter() {
        match charge.charge_type {
            ChargeType::Point=>{
                let a: f32   = f32::atan2(charge.pos.y - pos.y, charge.pos.x-pos.x);
                let mag: f32 = charge.q/f32::hypot(charge.pos.y - pos.y, charge.pos.x-pos.x);
                field.add_from_angle(a, mag);
            }, 
            ChargeType::Sphere=>{
                
            }, 
            ChargeType::Line=>{
                
            }, 
        }
    }

    return field;
}