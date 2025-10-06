const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Rota principal - Página de atendimentos
router.get('/', async (req, res) => {
  try {
    const atendimentos = await db.getAtendimentos();
    
    res.render('atendimentos', { 
      atendimentos,
      activePage: 'atendimentos',
      usuario: req.session.usuario 
    });
  } catch (error) {
    console.error('Erro ao carregar atendimentos:', error);
    res.status(500).send('Erro ao carregar lista de atendimentos');
  }
});

// Rota para página de edição (se você quiser uma página separada)
router.get('/editar/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const atendimento = await db.getAtendimentoById(id);
    
    if (!atendimento) {
      return res.status(404).send('Atendimento não encontrado');
    }
    
    res.render('editar-atendimento', {
      atendimento,
      activePage: 'atendimentos',
      usuario: req.session.usuario
    });
  } catch (error) {
    console.error('Erro ao carregar edição:', error);
    res.status(500).send('Erro ao carregar página de edição');
  }
});

// Rota para processar edição (formulário tradicional)
router.post('/editar/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { data_agendada, hora_agendada, observacoes } = req.body;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).send('Atendimento não encontrado');
    }
    
    const affectedRows = await db.atualizarAtendimento(id, {
      data_agendada,
      hora_agendada,
      observacoes
    });
    
    if (affectedRows > 0) {
      res.redirect('/atendimentos?sucesso=Atendimento atualizado com sucesso');
    } else {
      res.redirect('/atendimentos?erro=Nenhuma alteração foi feita');
    }
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.redirect('/atendimentos?erro=Erro ao atualizar atendimento');
  }
});

// Rota para excluir atendimento (formulário tradicional)
router.post('/excluir/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).send('Atendimento não encontrado');
    }
    
    const affectedRows = await db.excluirAtendimento(id);
    
    if (affectedRows > 0) {
      res.redirect('/atendimentos?sucesso=Atendimento excluído com sucesso');
    } else {
      res.redirect('/atendimentos?erro=Nenhum atendimento foi excluído');
    }
  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    res.redirect('/atendimentos?erro=Erro ao excluir atendimento');
  }
});

// Rota para marcar como concluído (mantida para compatibilidade)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }

    const affectedRows = await db.atualizarStatusAtendimento(id, status);
    
    if (affectedRows > 0) {
      res.json({ sucesso: true, message: 'Status atualizado com sucesso' });
    } else {
      res.status(500).json({ erro: 'Nenhuma alteração foi feita' });
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

module.exports = router;