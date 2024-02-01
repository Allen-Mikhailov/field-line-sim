// wasm-pack build --target web
use std::vec;
use std::f32::consts::PI;
use js_sys::{Array, Object};
use wasm_bindgen::JsValue;
use wasm_bindgen::JsCast;
use js_sys::Reflect;

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
impl Vector2 
{
    pub fn new(x: f32, y: f32) -> Vector2 {
        Vector2 {x, y}
    }

    pub fn from_angle(a: f32, mag: f32) -> Vector2
    { return Vector2 { x: (a.cos()*mag), y: (a.sin()*mag) } }

    pub fn mag(&self) -> f32
    { return f32::hypot(self.x, self.y); }

    pub fn add_self(&mut self, v2: &Vector2)
    { self.x += v2.x; self.y += v2.y; }

    pub fn add(&self, v2: &Vector2) -> Vector2
    { return Vector2 {x: self.x + v2.x, y: self.y + v2.y}; }

    pub fn sub_self(&mut self, v2: &Vector2)
    { self.x -= v2.x; self.y -= v2.y; }

    pub fn sub(&self, v2: &Vector2) -> Vector2
    { return Vector2 {x: self.x - v2.x, y: self.y - v2.y}; }

    pub fn to_scale(&mut self, scaler: f32) -> Vector2
    { return Vector2 {x: self.x * scaler, y: self.y * scaler}; }

    pub fn add_self_from_angle(&mut self, a: f32, mag: f32)
    { self.x += a.cos()*mag; self.y += a.sin()*mag;}

    pub fn sub_self_from_angle(&mut self, a: f32, mag: f32)
    { self.x -= a.cos()*mag; self.y -= a.sin()*mag}

    pub fn sub_from_angle(&mut self, a: f32, mag: f32) -> Vector2
    { return Vector2 { x: self.x - a.cos()*mag, y: self.y - a.sin()*mag}; }

    pub fn get_x(&self) -> f32
    { return self.x; }

    pub fn get_y(&self) -> f32 
    { return self.y; }

    pub fn set_x(&mut self, x: f32) 
    { self.x = x; }

    pub fn set_y(&mut self, y: f32)
    { self.y = y; }

    pub fn neg1() -> Vector2
    {
         return Vector2 { x: -1f32, y: -1f32 }
    }
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
// #[derive(Clone, Copy)]
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
#[derive(Clone, Copy)]
pub struct Simulation
{
    record_points: u32,
    step_distance: f32,
    record_steps: u32,
    charge_density: f32,
    close_spawn_distance: f32,
    point_distance: f32,
    k: f32,
}

impl Simulation {
    pub fn get_field_line_count(&self, charge: &Charge) -> u32
    {
        return if charge.q > 0f32 {(self.charge_density*charge.q).ceil() as u32} else {0};
    }

    pub fn get_field_start_points(&self, charge: &Charge) -> Vec<Vector2>
    {
        let point_count: f32 = self.get_field_line_count(charge) as f32;
        let mut points: Vec<Vector2> = vec![Vector2::neg1(); point_count as usize];

        for i in 0..(point_count as u32) 
        {
            let a: f32 = 2f32 * PI * (i as f32) / point_count;
            points[i as usize] = Vector2 {
                x: charge.pos.x + a.cos() * self.close_spawn_distance,
                y: charge.pos.y + a.sin() * self.close_spawn_distance,
            }
        }

        return points;
    }

    pub fn get_field(&self, charges: &Vec<Charge>, pos: &Vector2) -> Vector2
    {
        let mut field: Vector2 = Vector2 { x: 0f32, y: 0f32 };
        for charge in charges.iter() {
            match charge.charge_type {
                ChargeType::Point=>{
                    let a: f32   = f32::atan2(charge.pos.y - pos.y, charge.pos.x-pos.x);
                    let mag: f32 = charge.q/f32::hypot(charge.pos.y - pos.y, charge.pos.x-pos.x);
                    field.add_self_from_angle(a, mag);
                }, 
                ChargeType::Sphere=>{
                    
                }, 
                ChargeType::Line=>{
                    
                }, 
            }
        }

        return field.to_scale(self.k);
    }

    pub fn in_negative_charge(&self, charges: &Vec<Charge>, pos: &Vector2) -> bool
    {
        for charge in charges {
            if Vector2::sub(&charge.pos, pos).mag() < self.point_distance
            { return true; }
        }
        return false;
    }

    pub fn generate_field_line(&self, charges: &Vec<Charge>, start_pos: &Vector2) -> Vec<Vector2>
    {
        let mut points: Vec<Vector2> = vec![Vector2::neg1(); self.record_points as usize + 1];
        let mut recent_points: Vec<Vector2> = vec![Vector2::neg1(); self.record_steps as usize];
        let mut pos: Vector2 = *start_pos;

        points.push(pos);

        for _i in 0..self.record_points {
            for j in 0..self.record_steps {
                recent_points[j as usize] = pos;
                pos.add_self(&self.get_field(charges, &pos).to_scale(self.step_distance));
            }

            let mut j: i32 = (self.record_steps - 1) as i32;
            while self.in_negative_charge(charges, &pos) && j >= 0
            {
                pos = recent_points[j as usize];
                j -= 1;
            }

            points.push(pos);
        }

        return points;
    }
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(record_points: u32,
        step_distance: f32,
        record_steps: u32,
        charge_density: f32,
        close_spawn_distance: f32,
        point_distance: f32,
        k: f32) -> Simulation
    {
        return Simulation {
            record_points,
            step_distance,
            record_steps,
            charge_density,
            close_spawn_distance,
            point_distance,
            k
        }
    }

    pub fn create_all_field_lines(arr: Array) //-> Vec<Vec<Vector2>>
    {
        let arr: js_sys::Array = arr.into();
        // Extracting charges from the array
        let mut charges: Vec<Charge> = Vec::with_capacity(arr.length() as usize);
        for i in 0..arr.length() {
            let js_object = arr.get(i).dyn_into::<js_sys::Object>().unwrap();
            let q: f32 = Reflect::get(&js_object, &JsValue::from_str("id")).unwrap().as_f64().unwrap() as f32;

            console_log!("Charge {} with a value of {}", i, q);
        }
        // let mut line_count: u32 = 0;
        // for charge in charges
        // {
        //     line_count += get_field_line_count(sim_data, charge);
        // }


        
    }
}