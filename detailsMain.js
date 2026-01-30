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

// Elementi della pagina
const imageEl = document.querySelector("#productImage")
const nameEl = document.querySelector("#productName")
const descEl = document.querySelector("#productDescription")
const idEl = document.querySelector("#productId")
const brandEl = document.querySelector("#productBrand")
const imageUrlEl = document.querySelector("#productImageUrl")
const priceEl = document.querySelector("#productPrice")
const priceInlineEl = document.querySelector("#productPriceInline")
const userIdEl = document.querySelector("#productUserId")
const createdAtEl = document.querySelector("#productCreatedAt")
const updatedAtEl = document.querySelector("#productUpdatedAt")
const versionEl = document.querySelector("#productV")
const statusEl = document.querySelector("#statusMessage")
const spinnerEl = document.querySelector("#loadingSpinner")
const addBtn = document.querySelector("#addToCartBtn")
const cartListEl = document.querySelector("#cartItems")
const cartTotalEl = document.querySelector("#cartTotal")
const cartCountEl = document.querySelector("#cartCount")
const clearCartBtn = document.querySelector("#clearCart")

// Stato in memoria
let currentProduct = null

// Riempie i dettagli del prodotto
function renderProductInfo(product) {
    currentProduct = product
    imageEl.src = product.imageUrl || ""
    imageEl.alt = product.name || "Product image"
    nameEl.textContent = product.name || ""
    descEl.textContent = product.description || ""
    idEl.textContent = product._id || ""
    brandEl.textContent = product.brand || ""
    imageUrlEl.textContent = product.imageUrl || ""
    priceEl.textContent = product.price ?? ""
    priceInlineEl.textContent = product.price ?? ""
    userIdEl.textContent = product.userId || ""
    createdAtEl.textContent = product.createdAt || ""
    updatedAtEl.textContent = product.updatedAt || ""
    versionEl.textContent = product.__v ?? ""
}

// Caricamento prodotto singolo
async function loadProduct() {
    if (!productId) return
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
    renderProductInfo(product)
    setLoading(false)
}

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

// Carrello (localStorage)
function getCart() {
    const raw = localStorage.getItem("cart")
    return raw ? JSON.parse(raw) : []
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart))
}

function addToCart(product) {
    const cart = getCart()
    const existing = cart.find((item) => item._id === product._id)

    if (existing) {
        existing.qty += 1
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            qty: 1
        })
    }

    saveCart(cart)
    showStatus("success", "Prodotto aggiunto al carrello")
    renderCart()
}

function renderCart() {
    const cart = getCart()
    cartListEl.innerHTML = ""
    let total = 0
    let count = 0

    cart.forEach((item) => {
        total += item.price * item.qty
        count += item.qty
        const li = document.createElement("li")
        li.className = "list-group-item d-flex justify-content-between align-items-center"
        li.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <img src="${item.imageUrl}" alt="${item.name}" width="40" height="40" style="object-fit: cover;">
                <div>
                    <div class="fw-bold">${item.name}</div>
                    <div class="small text-muted">€ ${item.price} x ${item.qty}</div>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-danger" data-remove-id="${item._id}">Rimuovi</button>
        `
        cartListEl.appendChild(li)
    })

    cartTotalEl.textContent = total.toFixed(2)
    cartCountEl.textContent = count
}

// Eventi pagina
addBtn.addEventListener("click", () => {
    if (!currentProduct) return
    addToCart(currentProduct)
})

clearCartBtn.addEventListener("click", () => {
    saveCart([])
    renderCart()
})

cartListEl.addEventListener("click", (event) => {
    const removeButton = event.target.closest("button[data-remove-id]")
    if (!removeButton) return
    const id = removeButton.dataset.removeId
    const cart = getCart().filter((item) => item._id !== id)
    saveCart(cart)
    renderCart()
})

// Avvio iniziale
loadProduct()
renderCart()
