const form = document.getElementById('formAtendeAgendamento');
const statusBox = document.getElementById('status');
const select = document.getElementById('protocoloSelect');
const statusSelect = document.getElementById('statusSelect');

// 🔹 Webhook para BUSCAR dados
const WEBHOOK_LISTA = 'https://n8n.srv1352561.hstgr.cloud/webhook/carregaprotocolo';

// 🔹 Webhook para ATUALIZAR status
const WEBHOOK_UPDATE = 'https://n8n.srv1352561.hstgr.cloud/webhook/atualizaatendimento';

// ==========================
// 🔹 CARREGAR DROPDOWN
// ==========================
async function carregarLista() {
  try {
    const response = await fetch(WEBHOOK_LISTA);
    const data = await response.json();

    select.innerHTML = '<option value="">Selecione um atendimento</option>';

    (data.slots || []).forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });

  } catch (error) {
    select.innerHTML = '<option>Não há atendimentos pendentes</option>';
  }
}

carregarLista();

// ==========================
// 🔹 SUBMIT
// ==========================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const protocolo = select.value;
  const status = statusSelect.value;

  if (!protocolo || !status) {
    alert('Preencha todos os campos');
    return;
  }

  try {
    const response = await fetch(WEBHOOK_UPDATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocolo, status })
    });

    if (!response.ok) throw new Error();

    statusBox.style.display = 'block';
    statusBox.innerHTML = '✅ Status atualizado com sucesso';

    form.reset();
    carregarLista();

  } catch (error) {
    statusBox.style.display = 'block';
    statusBox.innerHTML = '❌ Erro ao atualizar';
  }
});
