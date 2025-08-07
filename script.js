let friends = [];

const openModalBtn = document.getElementById('open-modal-btn');
const modal = document.getElementById('friend-modal');
const cancelBtn = document.getElementById('cancel-friend-btn');
const confirmBtn = document.getElementById('confirm-friend-btn');
const nameInput = document.getElementById('friend-name-input');
const avatarInput = document.getElementById('friend-avatar-input');
const friendList = document.getElementById('friend-list');
const openItemModal = document.getElementById('open-item-modal');
const itemModal = document.getElementById('item-modal');
const itemNameInput = document.getElementById('item-name-input');
const itemPriceInput = document.getElementById('item-price-input');
const itemFriendSelect = document.getElementById('item-friend-select');
const cancelItemBtn = document.getElementById('cancel-item-btn');
const confirmItemBtn = document.getElementById('confirm-item-btn');
const itemList = document.getElementById('item-list');
const taxInput = document.getElementById('taxrate');
const tipInput = document.getElementById('tiprate');
const splitModeSelect = document.getElementById('split-mode');
const summaryItems = document.querySelectorAll('.summary-list li span');
const paymentDetails = document.getElementById('payment-details');
let randomTipEnabled = false;
let selectedTipPayerId = null;


// Show modal
openModalBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

// Hide modal
cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  nameInput.value = '';
  avatarInput.value = '';
});

// Add friend
// Emoji Avatar List
const emojiAvatars = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
];

// Add friend with emoji avatar
confirmBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name === '') return;

  const randomEmoji = emojiAvatars[Math.floor(Math.random() * emojiAvatars.length)];

  const friend = {
    id: Date.now(),
    name: name,
    avatar: randomEmoji,
    items: 0
  };

  friends.push(friend);
  renderFriends();
  modal.style.display = 'none';
  nameInput.value = '';
});


// Render Friends
function renderFriends() {
  friendList.innerHTML = '';

  friends.forEach(friend => {
    const card = document.createElement('div');
    card.classList.add('friend-card');

  card.innerHTML = `
  <div class="friend-info">
    <div class="emoji-avatar">${friend.avatar}</div>
    <div>
      <strong>${friend.name}</strong><br>
      <small>Items: ${friend.items}</small>
    </div>
  </div>
  <button>Remove</button>
`;


    const removeBtn = card.querySelector('button');
    removeBtn.addEventListener('click', () => {
      friends = friends.filter(f => f.id !== friend.id);
      renderFriends();
    });

    friendList.appendChild(card);
  });
}
let items = [];

// DOM Elements for item modal

// Show item modal
openItemModal.addEventListener('click', () => {
  updateFriendOptions();
  itemModal.style.display = 'flex';
});

// Hide item modal
cancelItemBtn.addEventListener('click', () => {
  itemModal.style.display = 'none';
  itemNameInput.value = '';
  itemPriceInput.value = '';
  itemFriendSelect.innerHTML = '';
});

// Update select options from friends
function updateFriendOptions() {
  itemFriendSelect.innerHTML = '<option value="">Select Friend</option>';
  friends.forEach(friend => {
    const option = document.createElement('option');
    option.value = friend.id;
    option.textContent = friend.name;
    itemFriendSelect.appendChild(option);
  });
}

// Confirm Add Item
confirmItemBtn.addEventListener('click', () => {
  const name = itemNameInput.value.trim();
  const price = parseFloat(itemPriceInput.value.trim());
  const friendId = itemFriendSelect.value;

  if (name === '' || isNaN(price) || friendId === '') return;

  const item = {
    id: Date.now(),
    name,
    price,
    orderedBy: parseInt(friendId)
  };

  items.push(item);

  // Update item count for that friend
  const friend = friends.find(f => f.id === item.orderedBy);
  if (friend) {
    friend.items += 1;
  }

  renderItems();
  renderFriends(); // update item count display
  itemModal.style.display = 'none';
  itemNameInput.value = '';
  itemPriceInput.value = '';
  itemFriendSelect.innerHTML = '';
});

// Render item list
function renderItems() {
  itemList.innerHTML = '';
  items.forEach(item => {
    const friend = friends.find(f => f.id === item.orderedBy);
    const card = document.createElement('div');
    card.classList.add('item-card');
    card.innerHTML = `
      <div class="item-details">
        <strong>${item.name}</strong>
        <span class="item-price">$${item.price.toFixed(2)}</span>
      </div>
      <small>By: ${friend ? friend.name : 'Unknown'}</small>
    `;
    itemList.appendChild(card);
    calculateBill();
  });
}

// Trigger calculation when anything changes
taxInput.addEventListener('input', calculateBill);
tipInput.addEventListener('input', calculateBill);
splitModeSelect.addEventListener('change', calculateBill);

// Also call it every time items are added
function calculateBill() {
  if (friends.length === 0 || items.length === 0) return;

  const taxRate = parseFloat(taxInput.value) || 0;
  const tipRate = parseFloat(tipInput.value) || 0;
  const splitMode = splitModeSelect.value;

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const tax = (subtotal * taxRate) / 100;
  const tip = (subtotal * tipRate) / 100;
  const total = subtotal + tax + tip;

  // Update summary
  summaryItems[0].textContent = `$${subtotal.toFixed(2)}`;
  summaryItems[1].textContent = `$${tax.toFixed(2)}`;
  summaryItems[2].textContent = `$${tip.toFixed(2)}`;
  summaryItems[3].textContent = `$${total.toFixed(2)}`;

  // Clear previous result
  paymentDetails.innerHTML = '';

  if (splitMode === 'equal') {
   if (randomTipEnabled && selectedTipPayerId) {
  const tipPerFriend = tip / friends.length;
  const tipPayer = friends.find(f => f.id === selectedTipPayerId);

  friends.forEach(friend => {
    let baseAmount = (subtotal + tax) / friends.length;
    let extraTip = friend.id === tipPayer.id ? tip : 0;
    const totalDue = baseAmount + extraTip;

    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${friend.name}</strong> ${
        friend.id === tipPayer.id ? '💸 (Tip Payer)' : ''
      }<br>
      <span class="who-pays-amount">$${totalDue.toFixed(2)}</span>
    `;
    paymentDetails.appendChild(div);
  });
} else {
  const amountPerFriend = total / friends.length;

  friends.forEach(friend => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${friend.name}</strong><br>
      <span class="who-pays-amount">$${amountPerFriend.toFixed(2)}</span>
    `;
    paymentDetails.appendChild(div);
  });
}


  } else if (splitMode === 'by-item') {
    // Calculate per person subtotal
    const individualTotals = {};

    friends.forEach(friend => {
      individualTotals[friend.id] = {
        name: friend.name,
        subtotal: 0
      };
    });

    items.forEach(item => {
      if (individualTotals[item.orderedBy]) {
        individualTotals[item.orderedBy].subtotal += item.price;
      }
    });

    // Share tax and tip proportionally
    for (const id in individualTotals) {
      const share = individualTotals[id].subtotal / subtotal;
      const individualTax = share * tax;
      const individualTip = share * tip;
      const totalDue = individualTotals[id].subtotal + individualTax + individualTip;

      const div = document.createElement('div');
      div.textContent = `${individualTotals[id].name} pays: $${totalDue.toFixed(2)}`;
      paymentDetails.appendChild(div);
    }
  }
}
const randomTipBtn = document.getElementById('random-tip-btn');
randomTipBtn.addEventListener('click', () => {
  if (friends.length < 2) {
    alert('You need at least 2 friends for random tip payer.');
    return;
  }
  randomTipEnabled = true;
  selectedTipPayerId = friends[Math.floor(Math.random() * friends.length)].id;
  calculateBill(); // re-calculate after enabling
});
amountPerFriend