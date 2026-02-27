mod cookie;

use std::sync::{Arc, Mutex};
use tauri::{webview::WebviewWindowBuilder, Manager, WebviewUrl};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct GameDownload {
    filename: String,
    url: String,
    machine_name: String,
}

#[derive(Debug, Deserialize)]
struct SignedUrlResponse {
    signed_url: String,
}

#[tauri::command]
async fn fetch_vault_games(token: String) -> Result<Vec<serde_json::Value>, String> {
    let client = reqwest::Client::new();
    let mut all_games = Vec::new();
    let mut index = 0;

    loop {
        let url = format!(
            "https://www.humblebundle.com/client/catalog?property=start&direction=desc&index={}",
            index
        );

        let response = client
            .get(&url)
            .header("Cookie", format!("_simpleauth_sess={}", token))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let mut catalog: Vec<serde_json::Value> = response.json().await.map_err(|e| e.to_string())?;

        if catalog.is_empty() {
            break;
        }

        all_games.append(&mut catalog);
        index += 1;
    }

    Ok(all_games)
}

#[tauri::command]
async fn download_game(
    token: String,
    machine_name: String,
    filename: String,
    human_name: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let params = [
        ("machine_name", machine_name.as_str()),
        ("filename", filename.as_str()),
    ];

    let response = client
        .post("https://www.humblebundle.com/api/v1/user/download/sign")
        .header("Cookie", format!("_simpleauth_sess={}", token))
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let signed: SignedUrlResponse = response.json().await.map_err(|e| e.to_string())?;

    let file_response = client
        .get(&signed.signed_url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let bytes = file_response.bytes().await.map_err(|e| e.to_string())?;

    let downloads_dir = dirs::download_dir().ok_or("Could not find downloads directory")?;
    let file_path = downloads_dir.join(&human_name);

    std::fs::write(&file_path, bytes).map_err(|e| e.to_string())?;

    Ok(format!("Downloaded to {:?}", file_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![fetch_vault_games, download_game])
        .setup(|app| {
            let app_handle = app.handle().clone();
            let current_url = Arc::new(Mutex::new(String::new()));
            let processed = Arc::new(Mutex::new(false));

            let _window = WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::App(
                    "https://www.humblebundle.com/login?redirect=http://www.humblebundle.com/home"
                        .into(),
                ),
            )
            .title("Humble Vault Downloader")
            .inner_size(800.0, 600.0)
            .on_navigation({
                let current_url = current_url.clone();
                move |url| {
                    *current_url.lock().unwrap() = url.to_string();
                    true
                }
            })
            .on_page_load({
                let current_url = current_url.clone();
                move |_, _| {
                    let url = current_url.lock().unwrap().clone();

                    if url.starts_with("https://www.humblebundle.com/home") {
                        let mut proc = processed.lock().unwrap();
                        if !*proc {
                            *proc = true;
                            if let Some(window) = app_handle.get_webview_window("main") {
                                cookie::extract_cookie(app_handle.clone(), window);
                            }
                        }
                    }
                }
            })
            .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
