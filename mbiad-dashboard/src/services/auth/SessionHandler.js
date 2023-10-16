
export function forceLogout() {
     console.log("Clearing user token")
     localStorage.clear();

     console.log("Redirecting to login page...")
     window.location.assign("/login");
}

/** Reload the page ensures the token is correctly loaded **/
export function reloadPage() {
     window.location.assign("/");
}