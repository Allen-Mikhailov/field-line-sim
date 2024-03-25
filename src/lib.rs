// wasm-pack build --target web
use std::vec;
use std::f32::consts::PI;
use js_sys::Object;
use js_sys::{Array};
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

    pub fn normalized(&self) -> Vector2
    {
        let c: f32 = f32::hypot(self.x, self.y);
        return Vector2 {x: self.x / c, y: self.y / c };
    }

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
         return Vector2 { x: -10000f32, y: -10000f32 }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum ChargeType
{
    Point,
    Sphere,
    Line,
    External,
}

impl ChargeType
{
    pub fn from_raw(i: u32) -> ChargeType
    {
        match i {
            0 => return ChargeType::Point,
            1 => return ChargeType::Sphere,
            2 => return ChargeType::Line,
            3 => return ChargeType::External,
            _ => return ChargeType::Point
        }
    }
}

#[wasm_bindgen]
// #[derive(Clone, Copy)]
pub struct PointCharge
{
    pos: Vector2,
    q: f32,
}

pub struct SphereCharge 
{
    pos: Vector2,
    q: f32,
    r: f32
}

pub struct LineCharge 
{
    pos: Vector2,
    q: f32,
    a: f32
}

pub struct ExternalCharge
{
    q: f32,
    a: f32,
}

pub struct Charges {
    point_charges: Vec<PointCharge>,
    sphere_charges: Vec<SphereCharge>,
    lines_charges: Vec<LineCharge>,
    extrenal_charges: Vec<ExternalCharge>,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Simulation
{
    record_points: u32,
    step_distance: f32,
    record_steps: u32,
    charge_density: f32,
    close_spawn_distance: f32,
    point_distance: f32,
    k: f32,

    recorded_points: Vec<f32>
}

impl Simulation {
    pub fn get_field_line_count(&self, charge: f32) -> u32
    {
        return if charge > 0f32 {(self.charge_density*charge).ceil() as u32} else {0};
    }

    pub fn get_field_start_points(&self, charges: &Charges) -> Vec<Vector2>
    {
        let mut points: Vec<Vector2> = Vec::new();

        for charge in charges.point_charges.iter()
        {
            let point_count = self.get_field_line_count(charge.q);
            for i in 0..point_count
            {
                let a: f32 = 2f32 * PI * (i as f32) / point_count as f32;
                points.push(Vector2 {
                    x: charge.pos.x + a.cos() * self.close_spawn_distance,
                    y: charge.pos.y + a.sin() * self.close_spawn_distance,
                })
            }
            
        }

        for charge in charges.sphere_charges.iter()
        {
            let point_count = self.get_field_line_count(charge.q);
            for i in 0..point_count
            {
                let a: f32 = 2f32 * PI * (i as f32) / point_count as f32;
                points.push(Vector2 {
                    x: charge.pos.x + a.cos() * charge.r,
                    y: charge.pos.y + a.sin() * charge.r,
                })
            }
            
        }

        return points;
    }

    pub fn get_field(&self, charges: &Charges, pos: &Vector2) -> Vector2
    {
        let mut field: Vector2 = Vector2 { x: 0f32, y: 0f32 };

        // Point Charges
        for charge in charges.point_charges.iter() {
            let a: f32   = f32::atan2(pos.y-charge.pos.y, pos.x-charge.pos.x);
            let mag: f32 = charge.q/f32::hypot(pos.y-charge.pos.y, pos.x-charge.pos.x);
            field.add_self_from_angle(a, mag);
        }

        // Sphere Charges
        for charge in charges.sphere_charges.iter() {
            let a: f32   = f32::atan2(pos.y-charge.pos.y, pos.x-charge.pos.x);
            let mag: f32 = charge.q/f32::hypot(pos.y-charge.pos.y, pos.x-charge.pos.x);
            field.add_self_from_angle(a, mag);
        }

        // Line Charges
        for charge in charges.lines_charges.iter() {
            
        }

        // External Charges
        for charge in charges.extrenal_charges.iter() {
            field.add_self_from_angle(charge.a, charge.q);
        }

        return field.normalized().to_scale(self.k);
    }

    pub fn in_negative_charge(&self, charges: &Charges, pos: &Vector2) -> bool
    {
        // Point Charges
        for charge in charges.point_charges.iter()
        {
            if charge.q < 0f32 && Vector2::sub(&charge.pos, pos).mag() < self.point_distance
            { return true; }
        }

        // Sphere Charges
        for charge in charges.sphere_charges.iter()
        {
            if charge.q < 0f32 && Vector2::sub(&charge.pos, pos).mag() < charge.r
            { return true; }
        }

        // Line Charges
        for i in 0..charges.lines_charges.len()
        {
            let charge = &charges.lines_charges[i];
            
        }

        return false;
    }

    pub fn generate_field_line(&self, charges: &Charges, start_pos: &Vector2) -> Vec<Vector2>
    {
        let mut points: Vec<Vector2> = vec![Vector2::neg1(); self.record_points as usize + 1];
        let mut recent_points: Vec<Vector2> = vec![Vector2::neg1(); self.record_steps as usize];
        let mut pos: Vector2 = *start_pos;

        points[0] = pos;

        for i in 0..self.record_points {
            for j in 0..self.record_steps {
                recent_points[j as usize] = pos;
                pos.add_self(&self.get_field(&charges, &pos).to_scale(self.step_distance));
            }

            let mut j: i32 = (self.record_steps - 1) as i32;
            if self.in_negative_charge(charges, &pos) 
            {
                while self.in_negative_charge(charges, &pos) && j >= 0
                {
                    pos = recent_points[j as usize];
                    j -= 1;
                }

                points[(i+1) as usize] = pos;
                return points;
            }

            points[(i+1) as usize] = pos;
        }

        return points;
    }
}

pub fn get_js_f32(js_object: &Object, name: &str) -> f32
{
    match Reflect::get(&js_object, &JsValue::from_str(name)) {
        Ok(n) => {
            match n.as_f64() {
                Some(n2) => {
                    return n2 as f32;
                },
                None => {
                    console_log!("ERROR: Invalid f32 named \"{}\"", name);
                    return 0f32;
                }
            }
        },
        Err(_e) => {
            console_log!("ERROR: Invalid f32 named \"{}\"", name);
            return 0f32;
        }
    }
}

pub fn get_js_u32(js_object: &Object, name: &str) -> u32
{
    match Reflect::get(&js_object, &JsValue::from_str(name)) {
        Ok(n) => {
            match n.as_f64() {
                Some(n2) => {
                    return n2 as u32;
                },
                None => {
                    console_log!("ERROR: Invalid u32 named \"{}\"", name);
                    return 0u32;
                }
            }
        },
        Err(_e) => {
            console_log!("ERROR: Invalid u32 named \"{}\"", name);
            return 0u32;
        }
    }
}

pub fn get_js_bool(js_object: &Object, name: &str) -> Option<bool>
{
    match Reflect::get(&js_object, &JsValue::from_str(name)) {
        Ok(n) => {
            return n.as_bool();
        },
        Err(_e) => {
            return None;
        }
    }
}

pub fn get_js_vector2(js_object: &Object) -> Vector2
{
    return Vector2 { 
        x: get_js_f32(&js_object, "x"), 
        y: get_js_f32(&js_object, "y") 
    };
}

pub fn add_charge_to_charges(charges: &mut Charges, js_object: &Object)
{
    let raw_type: u32 = get_js_u32(js_object, "type");

    let is_active = get_js_bool(js_object, "active");
    match is_active {
        Some(n) => {
            if !n {
                return;
            }
        },
        None => {
            console_log!("WARNING: Setting \"active\" not found");
        }
    }

    let charge_type: ChargeType = ChargeType::from_raw(raw_type);
    match charge_type {
        ChargeType::Point=>{
            charges.point_charges.push(PointCharge {
                pos: get_js_vector2(js_object),
                q: get_js_f32(&js_object, "q")
            });
        }, 
        ChargeType::Sphere=>{
            charges.sphere_charges.push(SphereCharge {
                pos: get_js_vector2(js_object),
                q: get_js_f32(&js_object, "q"),
                r: get_js_f32(&js_object, "r"),
            });
        }, 
        ChargeType::Line=>{
            charges.lines_charges.push(LineCharge {
                pos: get_js_vector2(js_object),
                q: get_js_f32(&js_object, "q"),
                a: get_js_f32(&js_object, "a"),
            });
        }, 
        ChargeType::External=>{
            charges.extrenal_charges.push(ExternalCharge {
                q: get_js_f32(&js_object, "q"),
                a: get_js_f32(&js_object, "a"),
            });
        }
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
            k,
            recorded_points: Vec::new()
        }
    }

    pub fn get_recorded_points(&self) -> JsValue
    {
        let length: usize = self.recorded_points.len();
        return JsValue::from(self.recorded_points[0..length].into_iter()
            .map(|x| JsValue::from_f64(*x as f64))
            .collect::<Array>());
    }

    pub fn get_recorded_point_count(&self) -> u32
    {
        return self.recorded_points.len() as u32;
    }

    pub fn create_all_field_lines(&mut self, arr: Array)
    {
        let arr: js_sys::Array = arr.into();
        // Extracting charges from the array
        let mut charges: Charges = Charges {
            point_charges: Vec::new(),
            lines_charges: Vec::new(),
            sphere_charges: Vec::new(),
            extrenal_charges: Vec::new(),
        };

        for i in 0..arr.length() {
            // console_log!("Trying to add charge {}", i);
            let js_object = arr.get(i).dyn_into::<js_sys::Object>().unwrap();
            add_charge_to_charges(&mut charges, &js_object);

            // console_log!("New Charge {}", i);
        }

        let start_points: Vec<Vector2>;
        {
            start_points = self.get_field_start_points(&charges);
        }

        let float_count: u32 = start_points.len() as u32 * (self.record_points + 1) * 2;
        self.recorded_points.resize(float_count as usize, 0.0f32);

        let mut i: u32 = 0;
        for point in start_points
        {
            let line: Vec<Vector2> = self.generate_field_line(&charges, &point);
            for p in line
            {
                self.recorded_points[i as usize] = p.x;
                self.recorded_points[(i+1) as usize] = p.y;
                i += 2;
                // console_log!("I is {}", i);
            }
        }
        
    }
}