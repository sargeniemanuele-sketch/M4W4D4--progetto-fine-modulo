// Credenziali semplici per la demo
const password = "alessandroabbro"
const authKey = "backofficeAuth"

// Parametro per il redirect dopo login
const queryParams = new URLSearchParams(window.location.search)
const redirectTo = queryParams.get("redirect") || "backOffice.html"

// Elementi della pagina
const formEl = document.querySelector("#loginForm")
const passwordInput = document.querySelector("#password")
const errorText = document.querySelector("#loginError")

// Gestione invio form
formEl.addEventListener("submit", (event) => {
    event.preventDefault()

    if (passwordInput.value === password) {
        sessionStorage.setItem(authKey, "ok")
        window.location.href = redirectTo
        return
    }

    errorText.classList.remove("d-none")
    passwordInput.value = ""
    passwordInput.focus()
})
