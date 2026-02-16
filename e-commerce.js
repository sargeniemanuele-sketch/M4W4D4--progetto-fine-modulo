//REGOLE GENERALI

// 1 - utilizzare boostrap

// 2 - pagina di back office con la lista di prodotti (tabella o card) per ogni elemento abbiamo il pulsante per navigare alla pagina di modifica

// 3 - sopra alla tabella fare il form per l'inserimento di un nuovo prodotto

// 4 - url searchparams per dettagli prodotto su una nuova pagina che ha anche il form per modificare il prodotto
// (ricordarsi di fare la fetch per i dettagli per popolare il form)

// 5 - ogni riga della tabella ha anche il pulsante della cancellazione (fetch con delete per cancellare)

// 6 - fare una pagina di e-commerce stile card con la lista dei prodotti

// 7 - cliccando sui dettagli si apre la pagina con più dettagli diversa dalla pagina dettagli di back office

// Dati API
const apiUrl = "https://striveschool-api.herokuapp.com/api/product"
const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTc5MWNjMWY1Y2I1ZDAwMTU0ZjQzNTIiLCJpYXQiOjE3NzEyNjUyMTMsImV4cCI6MTc3MjQ3NDgxM30.jz2D2joNamCjWuqPCocVjkklmuorocEP0_5vFZGALH0"
const headers = {
    "Authorization": token,
    "Content-Type": "application/json"
}

// Elementi della pagina
const gridEl = document.querySelector("#productsGrid")
const searchFormEl = document.querySelector("#searchForm")
const searchInputEl = document.querySelector("#searchInput")
const statusEl = document.querySelector("#statusMessage")
const spinnerEl = document.querySelector("#loadingSpinner")
const cartListEl = document.querySelector("#cartItems")
const cartTotalEl = document.querySelector("#cartTotal")
const cartCountEl = document.querySelector("#cartCount")
const clearCartBtn = document.querySelector("#clearCart")

// Stato in memoria
let products = []

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
    updateBadges()
}

function updateBadges() {
    const cart = getCart()
    const qtyMap = new Map(cart.map((item) => [item._id, item.qty]))

    document.querySelectorAll("[data-product-id]").forEach((card) => {
        const id = card.dataset.productId
        const qty = qtyMap.get(id) || 0
        const badge = card.querySelector("[data-qty-badge]")
        const inline = card.querySelector("[data-qty-inline]")

        if (qty > 0) {
            card.classList.add("border", "border-primary", "border-2", "bg-body-tertiary")
            if (badge) {
                badge.textContent = `x${qty}`
                badge.classList.remove("d-none")
            }
            if (inline) {
                inline.textContent = `x${qty}`
                inline.classList.remove("d-none")
            }
        } else {
            card.classList.remove("border", "border-primary", "border-2", "bg-body-tertiary")
            if (badge) badge.classList.add("d-none")
            if (inline) inline.classList.add("d-none")
        }
    })
}

// Cards prodotti
function buildCard(product) {
    const col = document.createElement("div")
    col.className = "col-6 col-md-4 col-lg-3"

    col.innerHTML = `
        <div class="card h-100 shadow-sm position-relative" data-product-id="${product._id}">
            <span class="badge text-bg-primary position-absolute top-0 end-0 m-2 d-none" data-qty-badge>x1</span>
            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted mb-2">${product.brand}</p>
                <p class="card-text mb-3">${product.description}</p>
                <div class="mt-auto d-flex flex-column gap-2">
                    <span class="fw-bold">€ ${product.price}</span>
                    <div class="d-flex gap-2 justify-content-center justify-content-md-start align-items-center">
                        <a class="btn btn-outline-primary btn-sm" href="detailsMain.html?id=${product._id}">Dettagli</a>
                        <button class="btn btn-primary btn-sm" data-add-id="${product._id}">Aggiungi</button>
                        <span class="badge text-bg-secondary d-none" data-qty-inline>x1</span>
                    </div>
                </div>
            </div>
        </div>
    `

    return col
}

function renderProductGrid(list) {
    gridEl.innerHTML = ""
    list.forEach((product) => {
        gridEl.appendChild(buildCard(product))
    })
    updateBadges()
}

function filterProducts(query) {
    const q = query.trim().toLowerCase()
    const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    )
    renderProductGrid(filtered)
}

// Caricamento prodotti
async function loadProducts() {
    clearStatus()
    setLoading(true)

    let response = null
    try {
        response = await fetch(apiUrl, { headers })
    } catch (error) {
        showStatus("danger", "Errore di rete")
        setLoading(false)
        return
    }

    if (!response.ok) {
        showStatus("danger", "Errore nel caricamento dei prodotti")
        setLoading(false)
        return
    }

    const list = await response.json()
    products = list
    renderProductGrid(list)
    setLoading(false)
}

// Eventi pagina
gridEl.addEventListener("click", (event) => {
    const addButton = event.target.closest("button[data-add-id]")
    if (!addButton) return
    const id = addButton.dataset.addId
    const product = products.find((p) => p._id === id)
    if (!product) return
    addToCart(product)
})

window.addEventListener("storage", (event) => {
    if (event.key === "productsUpdated") {
        loadProducts()
    }
})

searchFormEl.addEventListener("submit", async (event) => {
    event.preventDefault()
    await loadProducts()
    filterProducts(searchInputEl.value)
})

searchInputEl.addEventListener("input", () => {
    filterProducts(searchInputEl.value)
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
loadProducts()
renderCart()


