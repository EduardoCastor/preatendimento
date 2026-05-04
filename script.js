const form = document.getElementById('formAtendeAgendamento');
const statusBox = document.getElementById('status');
const select = document.getElementById('protocoloSelect');
const statusSelect = document.getElementById('statusSelect');

// 🔹 Webhook para BUSCAR dados
const WEBHOOK_LISTA = 'https://n8n.srv1352561.hstgr.cloud/webhook/carregaprotpre';

// 🔹 Webhook para ATUALIZAR status
const WEBHOOK_UPDATE = 'https://n8n.srv1352561.hstgr.cloud/webhook/atualizapre';

 const feriados = [
    '2026-01-01',
    '2026-04-21',
    '2026-04-23',
    '2026-04-24',
    '2026-05-01',
    '2026-06-04',
    '2026-06-05',
    '2026-09-07',
    '2026-10-12',
    '2026-11-02',
    '2026-11-13',
    '2026-11-20',
    '2026-12-25'
  ];

  const diasBloqueados = [0, 3, 6]; // Dom, Qua, Sáb

  // ============================
  // UTIL
  // ============================
  function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  function isDiaUtil(data) {
    const diaSemana = data.getDay();
    const dataISO = formatarDataISO(data);

    return !diasBloqueados.includes(diaSemana) && !feriados.includes(dataISO);
  }

  function getProximoDiaUtil(dataBase = new Date()) {
    const data = new Date(dataBase);

    do {
      data.setDate(data.getDate() + 1);
    } while (!isDiaUtil(data));

    return data;
  }

  function adicionarDiasUteis(dataBase, quantidade) {
    let data = new Date(dataBase);
    let contador = 0;

    while (contador < quantidade) {
      data.setDate(data.getDate() + 1);
      if (isDiaUtil(data)) contador++;
    }

    return data;
  }

  // ============================
// CONFIGURA CALENDÁRIO
// ============================
function configurarCalendario() {
  let hoje = new Date();

  // Normaliza hora para evitar problemas de timezone
  hoje.setHours(0, 0, 0, 0);

  const minDate = getProximoDiaUtil(hoje);
  const maxDate = adicionarDiasUteis(hoje, 5);

  inputData.min = formatarDataISO(minDate);
  inputData.max = formatarDataISO(maxDate);

  inputData.value = formatarDataISO(minDate);

  console.log("📅 Intervalo permitido:", {
    min: inputData.min,
    max: inputData.max
  });
}
  // ============================
  // VALIDAÇÃO AO ALTERAR DATA
  // ============================
  inputData.addEventListener('change', () => {
    const dataSelecionada = new Date(inputData.value + 'T00:00:00');

    if (!isDiaUtil(dataSelecionada)) {
      alert("Não há atendimento nesse dia. Selecione um dia útil disponível.");

      const novaData = getProximoDiaUtil(dataSelecionada);
      inputData.value = formatarDataISO(novaData);
    }


carregarLista();



// ==========================
// 🔹 CARREGAR DROPDOWN
// ==========================
async function carregarLista() {
  try {
    const response = await fetch(WEBHOOK_LISTA);
    //const data = await response.json();
    const data = inputData.value;
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
