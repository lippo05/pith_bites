(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const KEY = 'pithbites-cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  const rm = n => 'RM' + n.toFixed(2);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  function render() {
    const box = $('#items');
    box.innerHTML = '';
    if (!cart.length) box.innerHTML = '<p>Your cart is empty. Pick a pack from the shop.</p>';
    cart.forEach((it, i) => {
      const d = document.createElement('div');
      d.className = 'line';
      d.innerHTML = `<div><strong>${it.name}</strong><small>${it.flavour} · ${rm(it.price)} each</small></div>
        <div class="ctl"><button data-i="${i}" data-d="-1" aria-label="Less">−</button><span>${it.qty}</span><button data-i="${i}" data-d="1" aria-label="More">+</button></div>`;
      box.appendChild(d);
    });
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    $('#total').textContent = rm(total);
    $('#cartCount').textContent = cart.reduce((s, c) => s + c.qty, 0);
    save();
  }

  const toggle = on => { $('#drawer').classList.toggle('on', on); $('#overlay').classList.toggle('on', on); };

  // quantity + add to cart on product cards
  $$('.product').forEach(p => {
    const q = $('.q', p);
    $('.minus', p).onclick = () => q.textContent = Math.max(1, +q.textContent - 1);
    $('.plus', p).onclick = () => q.textContent = Math.min(20, +q.textContent + 1);
    $('.add', p).onclick = () => {
      const flavour = p.dataset.flavour, id = p.dataset.id;
      const qty = +q.textContent, found = cart.find(c => c.id === id);
      if (found) found.qty += qty;
      else cart.push({ id, name: p.dataset.name, flavour, price: +p.dataset.price, qty });
      q.textContent = 1;
      render();
      toggle(true);
    };
  });

  $('#items').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const it = cart[+b.dataset.i];
    it.qty += +b.dataset.d;
    if (it.qty <= 0) cart.splice(+b.dataset.i, 1);
    render();
  });

  $('#openCart').onclick = () => toggle(true);
  $('#closeCart').onclick = $('#overlay').onclick = () => toggle(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });

  // flavour filter tabs
  $$('.tab').forEach(t => t.onclick = () => {
    $$('.tab').forEach(x => x.classList.toggle('on', x === t));
    $$('.product').forEach(p => p.hidden = t.dataset.f !== 'all' && p.dataset.cat !== t.dataset.f);
  });

  // mobile menu
  $('#burger').onclick = () => $('#menu').classList.toggle('open');
  $$('#menu a').forEach(a => a.onclick = () => $('#menu').classList.remove('open'));

  // checkout: copy the order text, then open Instagram so the customer can paste it in a DM
  const IG = 'https://www.instagram.com/pith_bites';
  $('#igOrder').addEventListener('click', async () => {
    if (!cart.length) { $('#msg').textContent = 'Add at least one pack before ordering.'; return; }
    const lines = cart.map(c => `- ${c.qty} x ${c.name}, ${c.flavour} (${rm(c.price * c.qty)})`).join('\n');
    const total = rm(cart.reduce((s, c) => s + c.price * c.qty, 0));
    const text = `Hi Pith Bites! I would like to order:\n${lines}\nTotal: ${total}\nName:\nDelivery address:`;
    let copied = true;
    try { await navigator.clipboard.writeText(text); } catch (e) { copied = false; }
    window.open(IG, '_blank', 'noopener');
    $('#msg').textContent = copied
      ? 'Order copied. Paste it into a message to @Pith_Bites on Instagram, and add your name and address.'
      : 'Instagram opened. Send us this order: ' + text.replace(/\n/g, ' | ');
  });

  render();
})();
