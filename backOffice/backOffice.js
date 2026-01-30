// Dati API
const apiUrl = "https://striveschool-api.herokuapp.com/api/product"
const token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTc5MWNjMWY1Y2I1ZDAwMTU0ZjQzNTIiLCJpYXQiOjE3Njk1NDQ4OTcsImV4cCI6MTc3MDc1NDQ5N30.2ZJMKObVb8jtngdBYC2tHRd2WBIbWk6vu_VdID8GxGM"
const headers = {
    "Authorization": token,
    "Content-Type": "application/json"
}

// Elementi form
const nameInput = document.querySelector("#name")
const descriptionInput = document.querySelector("#description")
const brandInput = document.querySelector("#brand")
const imageUrlInput = document.querySelector("#imageUrl")
const priceInput = document.querySelector("#price")
const applyButton = document.querySelector("#apply")

// Elementi tabella e ricerca
const tableBody = document.querySelector("#productsTableBody")
const searchFormEl = document.querySelector("#searchForm")
const searchInputEl = document.querySelector("#searchInput")
const formStatusEl = document.querySelector("#formStatusMessage")
const tableStatusEl = document.querySelector("#tableStatusMessage")
const tableSpinnerEl = document.querySelector("#tableLoadingSpinner")
const toggleBtn = document.querySelector("#toggleProductsBtn")

// Stato in memoria
let products = []
const maxMobileRows = 4

// Autenticazione semplice per back office
const authKey = "backofficeAuth"
function ensureAuth() {
    if (sessionStorage.getItem(authKey) === "ok") return true
    const current = encodeURIComponent(window.location.pathname.split("/").pop())
    window.location.href = `login.html?redirect=${current}`
    return false
}

// Notifica per ricaricare la pagina e-commerce
function notifyUpdate() {
    localStorage.setItem("productsUpdated", Date.now().toString())
}

// Render tabella prodotti
function renderProducts(list) {
    tableBody.innerHTML = ""
    list.forEach((product) => {
        const trMain = document.createElement("tr")
        trMain.innerHTML = `
            <td>${product.name}</td>
            <td class="d-none d-md-table-cell">${product.description}</td>
            <td>${product.brand}</td>
            <td class="d-none d-md-table-cell">${product.imageUrl}</td>
            <td>${product.price}</td>
            <td class="d-none d-md-table-cell">
                <div class="d-flex flex-column gap-2 d-md-flex flex-md-row">
                    <a class="btn btn-sm btn-info px-2 py-1" href="detailsBack.html?id=${product._id}" aria-label="Details">
                        <i class="bi bi-eye"></i>
                        <span class="visually-hidden">Details</span>
                    </a>
                    <a class="btn btn-sm btn-warning px-2 py-1" href="detailsBack.html?id=${product._id}" aria-label="Edit">
                        <i class="bi bi-pencil-square"></i>
                        <span class="visually-hidden">Edit</span>
                    </a>
                    <button class="btn btn-sm btn-danger px-2 py-1" data-id="${product._id}" aria-label="Delete">
                        <i class="bi bi-trash"></i>
                        <span class="visually-hidden">Delete</span>
                    </button>
                </div>
            </td>
        `
        const trMobile = document.createElement("tr")
        trMobile.className = "d-md-none"
        trMobile.innerHTML = `
            <td colspan="6">
                <div class="small text-muted mb-1"><strong>Description:</strong> ${product.description}</div>
                <div class="small text-muted"><strong>ImageUrl:</strong> ${product.imageUrl}</div>
                <div class="d-flex flex-wrap gap-2 mt-3">
                    <a class="btn btn-sm btn-info px-2 py-1" href="detailsBack.html?id=${product._id}" aria-label="Details">
                        <i class="bi bi-eye"></i>
                        <span class="visually-hidden">Details</span>
                    </a>
                    <a class="btn btn-sm btn-warning px-2 py-1" href="detailsBack.html?id=${product._id}" aria-label="Edit">
                        <i class="bi bi-pencil-square"></i>
                        <span class="visually-hidden">Edit</span>
                    </a>
                    <button class="btn btn-sm btn-danger px-2 py-1" data-id="${product._id}" aria-label="Delete">
                        <i class="bi bi-trash"></i>
                        <span class="visually-hidden">Delete</span>
                    </button>
                </div>
            </td>
        `
        tableBody.appendChild(trMain)
        tableBody.appendChild(trMobile)
    })
}

// Gestione tabella mobile (mostra/nascondi)
function updateMobilePreview(totalProducts) {
    if (!toggleBtn) return
    const shouldShowToggle = totalProducts > maxMobileRows
    toggleBtn.classList.toggle("d-none", !shouldShowToggle)
    if (!shouldShowToggle) {
        setMobileExpanded(true)
        return
    }
    setMobileExpanded(false)
}

function setMobileExpanded(expanded) {
    const rows = Array.from(tableBody.children)
    for (let i = 0; i < rows.length; i += 2) {
        const productIndex = i / 2
        const trMain = rows[i]
        const trMobile = rows[i + 1]
        if (!expanded && productIndex >= maxMobileRows) {
            trMain.classList.add("d-none", "d-md-table-row")
            if (trMobile) trMobile.classList.add("d-none")
        } else {
            trMain.classList.remove("d-none")
            trMain.classList.add("d-md-table-row")
            if (trMobile) trMobile.classList.remove("d-none")
        }
    }
    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false")
        toggleBtn.textContent = expanded ? "Nascondi prodotti" : "Guarda tutti i prodotti"
    }
}

if (toggleBtn) {
    toggleBtn.addEventListener("click", (event) => {
        event.preventDefault()
        const expanded = toggleBtn.getAttribute("aria-expanded") === "true"
        setMobileExpanded(!expanded)
    })
}

// Caricamento prodotti
async function loadProducts() {
    if (!ensureAuth()) return
    clearStatus(tableStatusEl)
    setLoading(true)

    let response = null
    try {
        response = await fetch(apiUrl, { headers })
    } catch (error) {
        setStatus(tableStatusEl, "danger", "Errore di rete")
        if (toggleBtn) toggleBtn.classList.add("d-none")
        setLoading(false)
        return
    }

    if (!response.ok) {
        setStatus(tableStatusEl, "danger", "Errore nel caricamento dei prodotti")
        if (toggleBtn) toggleBtn.classList.add("d-none")
        setLoading(false)
        return
    }

    const list = await response.json()
    products = list
    renderProducts(list)
    updateMobilePreview(list.length)
    setLoading(false)
}

// Inserimento nuovo prodotto
applyButton.addEventListener("click", async (event) => {
    event.preventDefault()
    if (!ensureAuth()) return
    clearStatus(formStatusEl)

    const body = {
        name: nameInput.value,
        description: descriptionInput.value,
        brand: brandInput.value,
        imageUrl: imageUrlInput.value,
        price: Number(priceInput.value)
    }

    let response = null
    try {
        response = await fetch(apiUrl, {
            headers,
            body: JSON.stringify(body),
            method: "POST"
        })
    } catch (error) {
        setStatus(formStatusEl, "danger", "Errore di rete")
        return
    }

    if (!response.ok) {
        setStatus(formStatusEl, "danger", "Errore nell'inserimento del prodotto")
        return
    }

    setStatus(formStatusEl, "success", "Prodotto inserito correttamente")

    nameInput.value = ""
    descriptionInput.value = ""
    brandInput.value = ""
    imageUrlInput.value = ""
    priceInput.value = ""

    notifyUpdate()
    await loadProducts()
})

// Cancellazione prodotto
tableBody.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("button.btn-danger")
    if (!deleteButton) return
    if (!ensureAuth()) return
    clearStatus(tableStatusEl)

    const id = deleteButton.dataset.id
    let response = null
    try {
        response = await fetch(`${apiUrl}/${id}`, {
            headers,
            method: "DELETE"
        })
    } catch (error) {
        setStatus(tableStatusEl, "danger", "Errore di rete")
        return
    }

    if (!response.ok) {
        setStatus(tableStatusEl, "danger", "Errore nella cancellazione del prodotto")
        return
    }

    setStatus(tableStatusEl, "success", "Prodotto eliminato")

    notifyUpdate()
    await loadProducts()
})

// Sync con e-commerce
window.addEventListener("storage", (event) => {
    if (event.key === "productsUpdated") {
        loadProducts()
    }
})

// Ricerca
searchFormEl.addEventListener("submit", async (event) => {
    event.preventDefault()
    if (!ensureAuth()) return
    await loadProducts()
    applyFilter(searchInputEl.value)
})

searchInputEl.addEventListener("input", () => {
    if (!ensureAuth()) return
    applyFilter(searchInputEl.value)
})

// Quando torno sulla pagina
window.addEventListener("pageshow", () => {
    loadProducts()
})

// Avvio iniziale
loadProducts()

// EXTRA: gestione errori, spinner, ricerca frontend/backend
function setStatus(element, type, text) {
    element.className = `alert alert-${type}`
    element.textContent = text
    element.classList.remove("d-none")
}

function clearStatus(element) {
    element.classList.add("d-none")
    element.textContent = ""
}

function setLoading(isLoading) {
    tableSpinnerEl.classList.toggle("d-none", !isLoading)
}

function applyFilter(query) {
    const q = query.trim().toLowerCase()
    const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    )
    renderProducts(filtered)
    updateMobilePreview(filtered.length)
}
