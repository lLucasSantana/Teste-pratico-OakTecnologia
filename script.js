const dbName = "ProductDB";
const storeName = "products";
let db;

function initDB() {
  const request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    updateProductTable();
  };

  request.onerror = () => {
    console.error("Erro ao inicializar o banco de dados.");
  };
}

function addProduct(product) {
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.add(product);
  transaction.oncomplete = updateProductTable;
}

function fetchProducts(callback) {
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const products = [];

  store.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      products.push(cursor.value);
      cursor.continue();
    } else {
      callback(products);
    }
  };
}

function deleteProduct(id) {
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.delete(id);
  transaction.oncomplete = updateProductTable;
}

function updateProductTable() {
  fetchProducts((products) => {
    products.sort((a, b) => a.price - b.price);
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${product.price
                  .toFixed(2)
                  .replace(
                    ".",
                    ","
                  )}</td> <!-- Adiciona o "R$" e formata o preço -->
                <td>${product.availability === "yes" ? "Sim" : "Não"}</td>
                <td>${
                  product.description
                }</td> <!-- Adiciona a descrição aqui -->
                <td class="actions">
                    <button onclick="deleteProduct(${
                      product.id
                    })">Excluir</button>
                </td>
            `;
      tbody.appendChild(row);
    });
  });
}

// Adicionar evento no formulário da lista
const productForm = document.getElementById("product-form");
productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("product-name").value;
  const description = document.getElementById("product-desc").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const availability = document.getElementById("product-status").value;

  addProduct({ name, description, price, availability });
  productForm.reset();
});

// Buscar produtos digitados
const searchBar = document.getElementById("search-bar");
const searchProductBtn = document.getElementById("search-product-btn");

searchProductBtn.addEventListener("click", () => {
  const filter = searchBar.value.toLowerCase();
  fetchProducts((products) => {
    const filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(filter)
    );
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";
    filteredProducts.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${product.price
                  .toFixed(2)
                  .replace(
                    ".",
                    ","
                  )}</td> <!-- Adiciona o "R$" e formata o preço -->
                <td>${product.availability === "yes" ? "Sim" : "Não"}</td>
                <td>${
                  product.description
                }</td> <!-- Adiciona a descrição aqui -->
                <td class="actions">
                    <button onclick="deleteProduct(${
                      product.id
                    })">Excluir</button>
                </td>
            `;
      tbody.appendChild(row);
    });
  });
});

// Inicializar o init
initDB();
