const AgendamentoModel = require('../models/agendamentosModel');

exports.cadastrarAgendamento = async (req, res) => {
  try {
    // Recebe nome do serviço digitado
    const { servico_nome } = req.body;

    // Busca ID do serviço
    const [servico] = await AgendamentoModel.buscarServicoPorNome(servico_nome);
    if (servico.length === 0) {
      return res.status(400).json({ message: 'Serviço não encontrado' });
    }
    const servico_id = servico[0].id;

    // Cria agendamento usando servico_id
    const id = await AgendamentoModel.criar({
      ...req.body,
      servico_id
    });

    res.status(201).json({ message: 'Agendamento criado com sucesso', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao salvar agendamento' });
  }
};

exports.listarAgendamentosPorData = async (req, res) => {
  try {
    const data = req.params.data;
    const agendamentos = await AgendamentoModel.listarPorData(data);
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos' });
  }
};