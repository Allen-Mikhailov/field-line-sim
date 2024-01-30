// wasm-pack build --target web

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Vector2
{
    x: f32,
    y: f32,
}

#[wasm_bindgen]
impl Vector2 
{
    pub fn new(x: f32, y: f32) -> Vector2 {
        Vector2 {x, y}
    }

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
pub enum ChargeType
{
    Point,
    Sphere,
    Line
}

#[wasm_bindgen]
pub struct Charge
{
    pos: Vector2,
    q: f32,
    charge_type: ChargeType
}

impl Charge
{
    pub fn new(x: f32, y: f32, q: f32, charge_type: ChargeType) -> Charge 
    { return Charge {pos: Vector2 {x, y}, q, charge_type} }

    pub fn get_pos(&mut self) -> &mut Vector2
    { return &mut self.pos; }

    pub fn set_pos(&mut self, pos: Vector2)
    { self.pos = pos; }

    
}

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}