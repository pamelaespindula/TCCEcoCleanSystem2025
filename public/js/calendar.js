document.addEventListener('DOMContentLoaded', () => {
  const calendarBody = document.getElementById('calendarBody');
  const yearDisplay = document.getElementById('yearDisplay');
  const monthDisplay = document.getElementById('monthDisplay');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  let hoje = new Date();
  let mesAtual = hoje.getMonth();
  let anoAtual = hoje.getFullYear();

  let eventosPorData = {};

  async function carregarAgendamentos() {
    try {
      const response = await fetch('/api/agendamentos');
      if (!response.ok) throw new Error('Falha ao buscar agendamentos');
      const agendamentos = await response.json();

      eventosPorData = {};
      agendamentos.forEach(evt => {
        const data = evt.data_agendada;
        if (!eventosPorData[data]) {
          eventosPorData[data] = [];
        }
        eventosPorData[data].push(evt);
      });

      criarCalendario(mesAtual, anoAtual);
    } catch (err) {
      console.error(err);
      eventosPorData = {};
      criarCalendario(mesAtual, anoAtual);
    }
  }

  function criarCalendario(mes, ano) {
    calendarBody.innerHTML = '';
    yearDisplay.textContent = ano;
    monthDisplay.textContent = meses[mes];

    let primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    let ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();

    // Ajusta para considerar segunda-feira como início da semana
    let inicio = primeiroDiaSemana === 0 ? 6 : primeiroDiaSemana - 1;

    let linhas = 6, colunas = 7;
    let dia = 1;

    for(let i=0; i<linhas; i++) {
      let tr = document.createElement('tr');
      for(let j=0; j<colunas; j++) {
        let td = document.createElement('td');

        if(i === 0 && j < inicio) {
          td.textContent = '';
        } else if(dia > ultimoDiaMes) {
          td.textContent = '';
        } else {
          td.textContent = dia;

          // Formata data para comparação e busca no mapa de eventos
          const diaStr = String(dia).padStart(2, '0');
          const mesStr = String(mes+1).padStart(2, '0');
          const dataFormatada = `${ano}-${mesStr}-${diaStr}`;

          // Destacar o dia de hoje
          const dataChegada = new Date(ano, mes, dia);
          if(dataChegada.toDateString() === hoje.toDateString()) {
            td.classList.add('today');
          }

          // Se houver evento, marca o dia
          if(eventosPorData[dataFormatada]) {
            td.classList.add('has-event'); // CSS para dar destaque
            // Pode adicionar tooltip com os nomes/horários dos serviços
            const eventosDoDia = eventosPorData[dataFormatada];
            td.title = eventosDoDia.map(ev => ev.nome_servico + ' às ' + ev.hora_agendada).join('\n');
          }
          dia++;
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  prevMonthBtn.addEventListener('click', () => {
    mesAtual--;
    if(mesAtual < 0) {
      mesAtual = 11;
      anoAtual--;
    }
    criarCalendario(mesAtual, anoAtual);
  });

  nextMonthBtn.addEventListener('click', () => {
    mesAtual++;
    if(mesAtual > 11) {
      mesAtual = 0;
      anoAtual++;
    }
    criarCalendario(mesAtual, anoAtual);
  });

  // Inicializa carregando os dados e construindo o calendário
  carregarAgendamentos();
});
