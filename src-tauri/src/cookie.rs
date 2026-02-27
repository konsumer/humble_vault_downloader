use tauri::{webview::WebviewWindowBuilder, Manager, WebviewUrl};

#[cfg(target_os = "macos")]
pub fn extract_cookie(app_handle: tauri::AppHandle, window: tauri::WebviewWindow) {
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSString;
    use objc::{msg_send, sel, sel_impl};

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(1000));

        let _ = window.with_webview(|webview| unsafe {
            let wv: id = webview.inner() as _;
            let config: id = msg_send![wv, configuration];
            let data_store: id = msg_send![config, websiteDataStore];
            let cookie_store: id = msg_send![data_store, httpCookieStore];

            let handler = block::ConcreteBlock::new(move |cookies: id| {
                if cookies != nil {
                    let count: usize = msg_send![cookies, count];

                    for i in 0..count {
                        let cookie: id = msg_send![cookies, objectAtIndex: i];
                        let name: id = msg_send![cookie, name];
                        let value: id = msg_send![cookie, value];

                        let name_str = NSString::UTF8String(name);
                        let value_str = NSString::UTF8String(value);

                        if !name_str.is_null() && !value_str.is_null() {
                            let name_rust = std::ffi::CStr::from_ptr(name_str).to_string_lossy();
                            let value_rust = std::ffi::CStr::from_ptr(value_str).to_string_lossy();

                            if name_rust == "_simpleauth_sess" {
                                let target_url = format!("index.html#{}", value_rust);

                                if let Ok(_) = WebviewWindowBuilder::new(
                                    &app_handle,
                                    "app",
                                    WebviewUrl::App(target_url.into()),
                                )
                                .title("Humble Vault Downloader")
                                .inner_size(1200.0, 800.0)
                                .build()
                                {
                                    if let Some(win) = app_handle.get_webview_window("main") {
                                        let _ = win.close();
                                    }
                                }
                            }
                        }
                    }
                }
            });
            let handler = handler.copy();
            let _: () = msg_send![cookie_store, getAllCookies: handler];
        });
    });
}

#[cfg(not(target_os = "macos"))]
pub fn extract_cookie(app_handle: tauri::AppHandle, window: tauri::WebviewWindow) {
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(1000));

        // For non-macOS, use JavaScript to get cookie
        let _ = window.eval(
            r#"
            (function() {
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const parts = cookie.trim().split('=');
                    if (parts[0] === '_simpleauth_sess') {
                        window.location.href = 'http://tauri.localhost/index.html#' + parts[1];
                        return;
                    }
                }
            })();
            "#,
        );
    });
}
