document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const agendamentoListaEl = document.getElementById('listaAgendamentos');
  const dataSelecionadaEl = document.getElementById('dataSelecionada');
  const btnNovoAgendamento = document.getElementById('btnNovoAgendamento');
  const modal = document.getElementById('modalAgendamento');
  const btnCancelar = document.getElementById('btnCancelar');
  const formAgendamento = document.getElementById('formAgendamento');

  let dataSelecionada = null;
  const hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth();

  // Inicialmente desabilita botão para novo agendamento até data ser selecionada
  btnNovoAgendamento.disabled = true;

  // Retorna quantidade de dias do mês dado
  function diasNoMes(ano, mes) {
    return new Date(ano, mes + 1, 0).getDate();
  }

  // Fetch para buscar os agendamentos da data selecionada
  async function fetchAgendamentos(data) {
    try {
      const response = await fetch(`/agendamentos/${data}`);
      if (response.ok) {
        const agendamentos = await response.json();
        return agendamentos;
      }
      return [];
    } catch {
      return [];
    }
  }

  // Renderiza lista de agendamentos no lado direito
  async function renderListaAgendamentos() {
    agendamentoListaEl.innerHTML = '';

    if (!dataSelecionada) {
      dataSelecionadaEl.textContent = 'Selecione um dia';
      btnNovoAgendamento.disabled = true;
      return;
    }

    const agsDoDia = await fetchAgendamentos(dataSelecionada);

    if (agsDoDia.length === 0) {
      agendamentoListaEl.innerHTML = '<li>Não há agendamentos para esse dia.</li>';
      btnNovoAgendamento.disabled = false;
      return;
    }

    agsDoDia.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${a.nome_servico}</strong> às ${a.hora_agendada}<br/>${a.observacoes || ''}`;
      agendamentoListaEl.appendChild(li);
    });

    btnNovoAgendamento.disabled = false;
  }

  // Atualiza seleção e exibe lista, também habilita botão
  async function selecioneData(diaEl, dataFormatada) {
    dataSelecionada = dataFormatada;
    dataSelecionadaEl.textContent = `${diaEl.textContent}/${String(mes + 1).padStart(2, '0')}/${ano}`;
    renderCalendar();
    await renderListaAgendamentos();
  }

  // Renderiza o calendário no lado esquerdo
  function renderCalendar() {
    calendarEl.innerHTML = '';

    const totalDias = diasNoMes(ano, mes);
    const primeiroDia = new Date(ano, mes, 1).getDay(); // 0-Dom, 1-Seg

    // Ajusta para que a semana inicie segunda-feira (opcional, depende do seu calendário)
    let offset = (primeiroDia === 0) ? 6 : primeiroDia - 1;

    for (let i = 0; i < offset; i++) {
      calendarEl.appendChild(document.createElement('div')); // espaços em branco antes do primeiro dia
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      const diaEl = document.createElement('div');
      diaEl.classList.add('dia');
      const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      diaEl.textContent = dia;

      // Destaque para dia selecionado
      if (dataSelecionada === dataFormatada) {
        diaEl.classList.add('selecionado');
      }

      diaEl.addEventListener('click', () => selecioneData(diaEl, dataFormatada));

      calendarEl.appendChild(diaEl);
    }
  }

  // Abrir modal novo agendamento
  btnNovoAgendamento.addEventListener('click', () => {
    if (!dataSelecionada) {
      alert('Selecione uma data no calendário para agendar.');
      return;
    }
    modal.classList.remove('hidden');
    formAgendamento.data.value = dataSelecionada;
    formAgendamento.servico.focus();
  });

  // Cancelar e fechar modal
  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
    formAgendamento.reset();
  });

  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      formAgendamento.reset();
    }
  });

  // Envio do formulário via fetch AJAX
  formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault();

    const servico_id = formAgendamento.servico.value;
    const data_agendada = formAgendamento.data.value;
    const hora_agendada = formAgendamento.hora.value;
    const observacoes = formAgendamento.observacoes.value;

    try {
      const response = await fetch('/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servico_id, data_agendada, hora_agendada, observacoes })
      });

      if (response.ok) {
        modal.classList.add('hidden');
        formAgendamento.reset();
        dataSelecionada = data_agendada;
        renderCalendar();
        await renderListaAgendamentos();
      } else {
        alert('Erro ao salvar agendamento');
      }
    } catch {
      alert('Erro ao salvar agendamento');
    }
  });

  // Inicialização do calendário e lista vazia
  renderCalendar();
});
