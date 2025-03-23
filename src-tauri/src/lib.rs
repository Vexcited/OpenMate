use tauri::{Manager, PhysicalPosition, PhysicalSize};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            // let _ = main_window.set_ignore_cursor_events(true);

            // let monitors = main_window.available_monitors().unwrap();

            // let mut y_min: i32 = 0;
            // let mut y_max: i32 = 0;
            // let mut x_min: i32 = 0;
            // let mut x_max: i32 = 0;

            // for monitor in monitors {
            //     let size = monitor.size();
            //     let position = monitor.position();

            //     println!("monitor: {:?}", monitor);
            //     println!("size: {:?}", size);

            //     let size_width = size.width as i32;
            //     let size_height = size.height as i32;

            //     if position.x < x_min {
            //         x_min = position.x;
            //     }
            //     if position.y < y_min {
            //         y_min = position.y;
            //     }
            //     if position.x + size_width > x_max {
            //         x_max = position.x + size_width;
            //     }
            //     if position.y + size_height > y_max {
            //         y_max = position.y + size_height;
            //     }
            // }

            // println!(
            //     "x_min: {}, y_min: {}, x_max: {}, y_max: {}",
            //     x_min, y_min, x_max, y_max
            // );

            // let size = PhysicalSize::new(x_max - x_min, y_max - y_min);
            // let position = PhysicalPosition::new(x_min, y_min);

            // main_window.set_size(size).unwrap();
            // main_window.set_position(position).unwrap();

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
