import { deleteItemStorage, getFromLocalStorage, setItemToLocalStorage } from "../../storage/storage.js";
import { toast } from './toast.js';

const btnFinishCart = document.querySelector('#btn-finish-cart');
const btnEmptyCart = document.querySelector('#btn-empty-cart');


export function cartList(){
  const offcanvasbody = document.querySelector('.offcanvas-body');
  const dataStorage = getFromLocalStorage() || [];
  let template = '';

  if (dataStorage.length === 0) {
    offcanvasbody.innerHTML = `<div class="text-center text-muted py-4">Tu carrito está vacío</div>`;
    btnEmptyCart?.setAttribute('disabled', 'true');
    btnFinishCart?.setAttribute('disabled', 'true');
    updateCartTotal();
    return;
  }

  dataStorage.forEach((item) => {
    template += `
      <div class="card mb-3" style="max-width: 540px;">
        <div class="row g-0">
          <div class="col-md-4 d-flex justify-content-center align-items-center">
            <img src="${item.image}" class="img-fluid rounded-start" style="object-fit: contain; height: 150px" alt="${item.title}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>

              <div class="d-flex align-items-center mb-2">
                <button class="btn btn-sm btn-outline-secondary me-2" id="minus-${item.id}">-</button>
                <span id="qtty-${item.id}" class="fw-bold">${item.qtty}</span>
                <button class="btn btn-sm btn-outline-secondary ms-2" id="plus-${item.id}">+</button>
              </div>

              <small class="d-block mb-1">Precio unitario: $${item.price}</small>
              <small class="d-block mb-2">Subtotal: $<span id="subtotal-${item.id}">${(item.price * item.qtty).toFixed(2)}</span></small>

              <div class="d-flex justify-content-end">
                <button class="btn btn-outline-danger border-0" id="deleteItem-${item.id}">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  offcanvasbody.innerHTML = template;
  btnEmptyCart?.removeAttribute('disabled');
  btnFinishCart?.removeAttribute('disabled');
  eventsOnClick(dataStorage);
  buttonCartActions();
  updateCartTotal();
  updateCartBadge();
}

function eventsOnClick(productsStorage) {
  productsStorage.forEach((item) => {
    // eliminar
    document.querySelector(`#deleteItem-${item.id}`)?.addEventListener('click', () => {
      deleteItemStorage(item.id);
      toast(`${item.title} eliminado del carrito`, 'danger');
      cartList();
    });

    // sumar
    document.querySelector(`#plus-${item.id}`)?.addEventListener('click', () => {
      item.qtty += 1;
      updateItem(item);
    });

    // restar
    document.querySelector(`#minus-${item.id}`)?.addEventListener('click', () => {
      if (item.qtty > 1) {
        item.qtty -= 1;
        updateItem(item);
      } else {
        deleteItemStorage(item.id);
        toast(`${item.title} eliminado del carrito`, 'danger');
        cartList();
      }
    });
  });
}

function updateItem(item) {
  let cart = getFromLocalStorage();
  const index = cart.findIndex(p => p.id === item.id);
  if (index !== -1) {
    cart[index].qtty = item.qtty;
    setItemToLocalStorage(cart);
  }

  document.querySelector(`#qtty-${item.id}`).textContent = item.qtty;
  document.querySelector(`#subtotal-${item.id}`).textContent = (item.price * item.qtty).toFixed(2);
  updateCartTotal();
  updateCartBadge();
}

function updateCartTotal() {
  const cart = getFromLocalStorage() || [];
  const total = cart.reduce((acc, it) => acc + (it.price * it.qtty), 0);
  const totalElement = document.querySelector('#cart-total');
  if (totalElement) totalElement.textContent = total.toFixed(2);
}

function updateCartBadge() {
  const cart = getFromLocalStorage() || [];
    
  const totalItems = cart.reduce((acc, item) => acc + item.qtty, 0);

  const badgeDesktop = document.querySelector('#cart-badge-desktop');
  const badgeMobile = document.querySelector('#cart-badge-mobile');

  if (badgeDesktop) {
    badgeDesktop.textContent = totalItems;
       
    badgeDesktop.style.display = totalItems > 0 ? 'block' : 'none';
  }
  if (badgeMobile) {
    badgeMobile.textContent = totalItems;
    badgeMobile.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

function clearCart() {
  setItemToLocalStorage([]);
  updateCartTotal();
}

function buttonCartActions() {
  btnFinishCart?.addEventListener('click', () => {
    setItemToLocalStorage([]);
    cartList();
    toast("¡Gracias por tu compra!", "success");
  });

btnEmptyCart?.addEventListener('click', () => {
  clearCart();
  cartList();
  toast("Carrito vacío", "warning");
});

}
