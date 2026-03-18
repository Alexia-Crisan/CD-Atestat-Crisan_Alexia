import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let allUsers = [], currentUser = null, selectedUser = null;

const loading      = document.getElementById("loading");
const accessDenied = document.getElementById("access-denied");
const dashboard    = document.getElementById("dashboard");
const tableBody    = document.getElementById("user-table-body");
const searchInput  = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const userCount    = document.getElementById("user-count");
const modalOverlay = document.getElementById("modal-overlay");
const toast        = document.getElementById("toast");

document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth); window.location.href = "./login.html";
});
document.getElementById("modal-close").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
searchInput.addEventListener("input", renderTable);
filterSelect.addEventListener("change", renderTable);

function showToast(msg, type = "success") {
  toast.textContent = msg; toast.className = "show " + type;
  setTimeout(() => { toast.className = ""; }, 3000);
}

function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => { unsub(); resolve(user); });
  });
}

async function init() {
  const user = await waitForAuth();
  if (!user) { loading.style.display = "none"; accessDenied.style.display = "flex"; return; }
  currentUser = user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || !userDoc.data().isAdmin) {
    loading.style.display = "none"; accessDenied.style.display = "flex"; return;
  }
  loading.style.display = "none";
  dashboard.style.display = "block";
  await loadUsers();
}

init();

async function loadUsers() {
  try {
    const snap = await getDocs(collection(db, "users"));
    allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    updateStats(); renderTable();
  } catch (err) { showToast("Failed to load users", "error"); console.error(err); }
}

function updateStats() {
  const total = allUsers.length;
  const admins = allUsers.filter(u => u.isAdmin).length;
  const withCart = allUsers.filter(u => getCart(u).length > 0).length;
  let totalValue = 0;
  allUsers.forEach(u => getCart(u).forEach(i => { totalValue += i.price * i.quantity; }));
  document.getElementById("stat-total").textContent  = total;
  document.getElementById("stat-admins").textContent = admins;
  document.getElementById("stat-carts").textContent  = withCart;
  document.getElementById("stat-value").textContent  = totalValue.toFixed(2) + " RON";
}

function getCart(user) { return Array.isArray(user.cart) ? user.cart : []; }

function renderTable() {
  const query  = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const filtered = allUsers.filter(u => {
    const s = (u.name||"").toLowerCase().includes(query) || (u.email||"").toLowerCase().includes(query);
    const f = filter === "all" ? true : filter === "admin" ? u.isAdmin : getCart(u).length > 0;
    return s && f;
  });

  userCount.textContent = filtered.length + " user" + (filtered.length !== 1 ? "s" : "");
  tableBody.innerHTML = filtered.map(u => {
    const cart = getCart(u);
    const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString("ro-RO") : "—";
    const isMe = u.uid === currentUser.uid;
    return `<tr onclick="window._open('${u.uid}')">
      <td>
        <div class="user-name">${u.name||"—"} ${isMe ? "<span style='color:rgb(154,203,208);font-size:11px;'>(you)</span>" : ""}</div>
        <div class="user-email">${u.email||"—"}</div>
      </td>
      <td>${u.isAdmin
        ? '<span class="badge-admin"><i class="fa-solid fa-shield-halved"></i> Admin</span>'
        : '<span class="badge-user"><i class="fa-solid fa-user"></i> User</span>'
      }</td>
      <td><span class="cart-count"><i class="fa-solid fa-cart-shopping"></i> ${cart.length} item${cart.length!==1?"s":""}</span></td>
      <td class="date-cell">${date}</td>
      <td class="actions-cell" onclick="event.stopPropagation()">
        <button class="btn-action btn-view" onclick="window._open('${u.uid}')"><i class="fa-solid fa-eye"></i> View</button>
        ${u.isAdmin
          ? `<button class="btn-action btn-demote" onclick="window._admin('${u.uid}',false)"><i class="fa-solid fa-user-minus"></i> Demote</button>`
          : `<button class="btn-action btn-promote" onclick="window._admin('${u.uid}',true)"><i class="fa-solid fa-shield-halved"></i> Make Admin</button>`
        }
        ${!isMe ? `<button class="btn-action btn-delete" onclick="window._delete('${u.uid}')"><i class="fa-solid fa-trash"></i></button>` : ""}
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="5" style="text-align:center;color:rgb(154,203,208);padding:32px;">No users found</td></tr>`;
}

function openModal(uid) {
  selectedUser = allUsers.find(u => u.uid === uid);
  if (!selectedUser) return;
  const u = selectedUser, cart = getCart(u), isMe = u.uid === currentUser.uid;

  document.getElementById("modal-name").textContent  = u.name || "Unknown";
  document.getElementById("modal-uid").textContent   = "UID: " + u.uid;
  document.getElementById("modal-email").textContent = u.email || "—";
  document.getElementById("modal-role").innerHTML    = u.isAdmin
    ? '<span class="badge-admin"><i class="fa-solid fa-shield-halved"></i> Admin</span>'
    : '<span class="badge-user"><i class="fa-solid fa-user"></i> User</span>';
  document.getElementById("modal-created").textContent    = u.createdAt ? new Date(u.createdAt).toLocaleString("ro-RO") : "—";
  document.getElementById("modal-cart-count").textContent = cart.length + " item" + (cart.length !== 1 ? "s" : "");

  const cartEl = document.getElementById("modal-cart-items");
  if (cart.length === 0) {
    cartEl.innerHTML = `<p class="cart-empty"><i class="fa-solid fa-box-open"></i> Cart is empty</p>`;
    document.getElementById("modal-cart-total").style.display = "none";
  } else {
    let total = 0;
    cartEl.innerHTML = cart.map(item => {
      const sub = item.price * item.quantity; total += sub;
      return `<div class="cart-item-row">
        <img src="${item.image||""}" onerror="this.style.display='none'" />
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">x${item.quantity}</span>
        <span class="cart-item-price">${sub.toFixed(2)} RON</span>
      </div>`;
    }).join("");
    document.getElementById("modal-cart-total").style.display = "flex";
    document.getElementById("modal-total-value").textContent = total.toFixed(2) + " RON";
  }

  document.getElementById("modal-actions").innerHTML = `
    ${cart.length > 0 ? `<button class="modal-btn orange" onclick="window._clearCart('${u.uid}')"><i class="fa-solid fa-cart-arrow-down"></i> Clear Cart</button>` : ""}
    ${!isMe ? `<button class="modal-btn red" onclick="window._delete('${u.uid}')"><i class="fa-solid fa-trash"></i> Delete User</button>` : ""}
    <button class="modal-btn ghost" onclick="window._close()">Close</button>
  `;
  modalOverlay.classList.add("open");
}

function closeModal() { modalOverlay.classList.remove("open"); selectedUser = null; }

window._open  = openModal;
window._close = closeModal;

window._admin = async (uid, makeAdmin) => {
  try {
    await updateDoc(doc(db, "users", uid), { isAdmin: makeAdmin });
    const u = allUsers.find(u => u.uid === uid);
    if (u) u.isAdmin = makeAdmin;
    updateStats(); renderTable();
  } catch (err) { showToast("Failed to update role", "error"); console.error(err); }
};

window._clearCart = async (uid) => {
  if (!confirm("Clear this user's cart?")) return;
  try {
    await updateDoc(doc(db, "users", uid), { cart: [] });
    const u = allUsers.find(u => u.uid === uid);
    if (u) u.cart = [];
    updateStats(); renderTable();
    if (selectedUser?.uid === uid) openModal(uid);
  } catch (err) { showToast("Failed to clear cart", "error"); console.error(err); }
};

window._delete = async (uid) => {
  const u = allUsers.find(u => u.uid === uid);
  if (!confirm(`Delete user "${u?.name||u?.email}"? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, "users", uid));
    allUsers = allUsers.filter(u => u.uid !== uid);
    updateStats(); renderTable(); closeModal();
  } catch (err) { showToast("Failed to delete user", "error"); console.error(err); }
};