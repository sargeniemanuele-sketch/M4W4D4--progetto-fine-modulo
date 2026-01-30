// Dati API
const apiUrl = "https://striveschool-api.herokuapp.com/api/product"
const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTc5MWNjMWY1Y2I1ZDAwMTU0ZjQzNTIiLCJpYXQiOjE3Njk1NDQ4OTcsImV4cCI6MTc3MDc1NDQ5N30.2ZJMKObVb8jtngdBYC2tHRd2WBIbWk6vu_VdID8GxGM"
const headers = {
    "Authorization": token,
    "Content-Type": "application/json"
}

// Parametri URL
const queryParams = new URLSearchParams(window.location.search)
const productId = queryParams.get("id")

// Elementi form
const nameInput = document.querySelector("#name")
const descriptionInput = document.querySelector("#description")
const brandInput = document.querySelector("#brand")
const imageUrlInput = document.querySelector("#imageUrl")
const priceInput = document.querySelector("#price")
const formEl = document.querySelector("#productForm")
const applyButton = document.querySelector("#apply")

// Elementi card dettagli
const imageEl = document.querySelector("#productImage")
const nameEl = document.querySelector("#productName")
const descEl = document.querySelector("#productDescription")
const idEl = document.querySelector("#productId")
const brandEl = document.querySelector("#productBrand")
const imageUrlEl = document.querySelector("#productImageUrl")
const priceEl = document.querySelector("#productPrice")
const userIdEl = document.querySelector("#productUserId")
const createdAtEl = document.querySelector("#productCreatedAt")
const updatedAtEl = document.querySelector("#productUpdatedAt")
const versionEl = document.querySelector("#productV")
const statusEl = document.querySelector("#statusMessage")
const spinnerEl = document.querySelector("#loadingSpinner")

// Autenticazione semplice per back office
const authKey = "backofficeAuth"
function ensureAuth() {
    if (sessionStorage.getItem(authKey) === "ok") return true
    const current = encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search)
    window.location.href = `login.html?redirect=${current}`
    return false
}

// Riempie il form con i dati
function fillForm(product) {
    nameInput.value = product.name || ""
    descriptionInput.value = product.description || ""
    brandInput.value = product.brand || ""
    imageUrlInput.value = product.imageUrl || ""
    priceInput.value = product.price ?? ""
}

// Riempie la card con i dati
function fillCard(product) {
    imageEl.src = product.imageUrl || ""
    imageEl.alt = product.name || "Product image"
    nameEl.textContent = product.name || ""
    descEl.textContent = product.description || ""
    idEl.textContent = product._id || ""
    brandEl.textContent = product.brand || ""
    imageUrlEl.textContent = product.imageUrl || ""
    priceEl.textContent = product.price ?? ""
    userIdEl.textContent = product.userId || ""
    createdAtEl.textContent = product.createdAt || ""
    updatedAtEl.textContent = product.updatedAt || ""
    versionEl.textContent = product.__v ?? ""
}

// Notifica aggiornamento verso l'e-commerce
function notifyUpdate() {
    localStorage.setItem("productsUpdated", Date.now().toString())
}

// Carica il prodotto da API
async function loadProduct() {
    if (!productId) {
        applyButton.disabled = true
        return
    }
    if (!ensureAuth()) return
    clearStatus()
    setLoading(true)

    let response = null
    try {
        response = await fetch(`${apiUrl}/${productId}`, { headers })
    } catch (error) {
        showStatus("danger", "Errore di rete")
        setLoading(false)
        return
    }

    if (!response.ok) {
        showStatus("danger", "Errore nel caricamento del prodotto")
        setLoading(false)
        return
    }

    const product = await response.json()
    fillForm(product)
    fillCard(product)
    setLoading(false)
}

// Salvataggio modifiche
formEl.addEventListener("submit", async (event) => {
    event.preventDefault()
    if (!productId) return
    if (!ensureAuth()) return
    clearStatus()

    const body = {
        name: nameInput.value,
        description: descriptionInput.value,
        brand: brandInput.value,
        imageUrl: imageUrlInput.value,
        price: Number(priceInput.value)
    }

    setLoading(true)
    let listResponse = null
    try {
        listResponse = await fetch(apiUrl, { headers })
    } catch (error) {
        showStatus("danger", "Errore di rete")
        setLoading(false)
        return
    }

    if (!listResponse.ok) {
        showStatus("danger", "Errore nel controllo dei nomi")
        setLoading(false)
        return
    }

    const allProducts = await listResponse.json()
    const normalizedName = body.name.trim().toLowerCase()
    const duplicate = allProducts.some(
        (p) => p._id !== productId && p.name.trim().toLowerCase() === normalizedName
    )
    if (duplicate) {
        showStatus("danger", "Esiste già un prodotto con questo nome")
        setLoading(false)
        return
    }

    let response = null
    try {
        response = await fetch(`${apiUrl}/${productId}`, {
            headers,
            body: JSON.stringify(body),
            method: "PUT"
        })
    } catch (error) {
        showStatus("danger", "Errore di rete")
        setLoading(false)
        return
    }

    if (!response.ok) {
        showStatus("danger", "Errore nel salvataggio del prodotto")
        setLoading(false)
        return
    }

    let updated = null
    try {
        updated = await response.json()
    } catch {
        updated = null
    }

    if (updated) {
        fillForm(updated)
        fillCard(updated)
    } else {
        await loadProduct()
    }

    showStatus("success", "Prodotto aggiornato correttamente")
    notifyUpdate()
    setLoading(false)
})

// Avvio iniziale
loadProduct()

// Messaggi e caricamento
function showStatus(type, text) {
    statusEl.className = `alert alert-${type}`
    statusEl.textContent = text
    statusEl.classList.remove("d-none")
}

function clearStatus() {
    statusEl.classList.add("d-none")
    statusEl.textContent = ""
}

function setLoading(isLoading) {
    spinnerEl.classList.toggle("d-none", !isLoading)
}
