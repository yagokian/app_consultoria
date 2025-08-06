import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Historico = ({ showSnackbar, propostas, loadPropostas }) => {
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    ordenacao: 'created_at_desc'
  });
  
  const [propostasFiltradas, setPropostasFiltradas] = useState([]);
  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);

  useEffect(() => {
    aplicarFiltros();
  }, [propostas, filtros]);

  const aplicarFiltros = () => {
    let resultado = [...propostas];

    // Filtro por busca (nome do cliente)
    if (filtros.busca) {
      resultado = resultado.filter(p => 
        p.cliente_nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        p.numero.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    // Filtro por status
    if (filtros.status) {
      resultado = resultado.filter(p => p.status === filtros.status);
    }

    // Ordenação
    switch (filtros.ordenacao) {
      case 'created_at_desc':
        resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'created_at_asc':
        resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'valor_desc':
        resultado.sort((a, b) => b.valor_total - a.valor_total);
        break;
      case 'valor_asc':
        resultado.sort((a, b) => a.valor_total - b.valor_total);
        break;
      case 'cliente':
        resultado.sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome));
        break;
      default:
        break;
    }

    setPropostasFiltradas(resultado);
  };

  const duplicarProposta = async (propostaId) => {
    try {
      await axios.post(`${API}/propostas/${propostaId}/duplicar`);
      showSnackbar('Proposta duplicada com sucesso!');
      loadPropostas();
    } catch (error) {
      showSnackbar('Erro ao duplicar proposta', 'error');
    }
  };

  const deletarProposta = async (propostaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
      try {
        await axios.delete(`${API}/propostas/${propostaId}`);
        showSnackbar('Proposta excluída com sucesso!');
        loadPropostas();
      } catch (error) {
        showSnackbar('Erro ao excluir proposta', 'error');
      }
    }
  };

  const abrirDetalhes = (proposta) => {
    setPropostaSelecionada(proposta);
    setDialogDetalhesOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'rascunho': return 'default';
      case 'enviada': return 'primary';
      case 'aprovada': return 'success';
      case 'rejeitada': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'enviada': return 'Enviada';
      case 'aprovada': return 'Aprovada';
      case 'rejeitada': return 'Rejeitada';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <HistoryIcon fontSize="large" />
        Histórico de Propostas
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar"
                placeholder="Nome do cliente ou número da proposta"
                value={filtros.busca}
                onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  label="Status"
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="rascunho">Rascunho</MenuItem>
                  <MenuItem value="enviada">Enviada</MenuItem>
                  <MenuItem value="aprovada">Aprovada</MenuItem>
                  <MenuItem value="rejeitada">Rejeitada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={filtros.ordenacao}
                  label="Ordenar por"
                  onChange={(e) => setFiltros({...filtros, ordenacao: e.target.value})}
                >
                  <MenuItem value="created_at_desc">Data (Recente)</MenuItem>
                  <MenuItem value="created_at_asc">Data (Antiga)</MenuItem>
                  <MenuItem value="valor_desc">Valor (Maior)</MenuItem>
                  <MenuItem value="valor_asc">Valor (Menor)</MenuItem>
                  <MenuItem value="cliente">Cliente (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFiltros({busca: '', status: '', ordenacao: 'created_at_desc'})}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h5">
                {propostasFiltradas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Aprovadas
              </Typography>
              <Typography variant="h5" color="success.main">
                {propostasFiltradas.filter(p => p.status === 'aprovada').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Valor Total
              </Typography>
              <Typography variant="h6">
                R$ {propostasFiltradas
                  .filter(p => p.status === 'aprovada')
                  .reduce((sum, p) => sum + p.valor_total, 0)
                  .toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h5" color="primary.main">
                {propostasFiltradas.filter(p => p.status === 'enviada').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Número</strong></TableCell>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Valor</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propostasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">
                      Nenhuma proposta encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                propostasFiltradas.map((proposta) => (
                  <TableRow key={proposta.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {proposta.numero}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {proposta.cliente_nome}
                      </Typography>
                      {proposta.cliente_email && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {proposta.cliente_email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        R$ {proposta.valor_total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(proposta.status)}
                        color={getStatusColor(proposta.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => abrirDetalhes(proposta)} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => showSnackbar('PDF será implementado em breve', 'info')}>
                        <PdfIcon />
                      </IconButton>
                      <IconButton onClick={() => duplicarProposta(proposta.id)} color="secondary">
                        <FileCopyIcon />
                      </IconButton>
                      <IconButton onClick={() => deletarProposta(proposta.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={dialogDetalhesOpen} onClose={() => setDialogDetalhesOpen(false)} maxWidth="md" fullWidth>
        {propostaSelecionada && (
          <>
            <DialogTitle>
              Detalhes da Proposta - {propostaSelecionada.numero}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Cliente
                      </Typography>
                      <Typography><strong>Nome:</strong> {propostaSelecionada.cliente_nome}</Typography>
                      {propostaSelecionada.cliente_email && (
                        <Typography><strong>E-mail:</strong> {propostaSelecionada.cliente_email}</Typography>
                      )}
                      {propostaSelecionada.cliente_telefone && (
                        <Typography><strong>Telefone:</strong> {propostaSelecionada.cliente_telefone}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Valores
                      </Typography>
                      <Typography><strong>Subtotal:</strong> R$ {propostaSelecionada.subtotal_servicos?.toFixed(2)}</Typography>
                      <Typography><strong>Adicionais:</strong> R$ {propostaSelecionada.subtotal_adicionais?.toFixed(2)}</Typography>
                      <Typography><strong>Desconto:</strong> - R$ {propostaSelecionada.desconto_aplicado?.toFixed(2)}</Typography>
                      <Typography><strong>Impostos:</strong> R$ {propostaSelecionada.valor_impostos?.toFixed(2)}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" color="primary">
                        <strong>Total: R$ {propostaSelecionada.valor_total?.toFixed(2)}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Serviços ({propostaSelecionada.itens?.length || 0})
                      </Typography>
                      {propostaSelecionada.itens?.map((item, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>{item.servico_nome}</strong> - {item.servico_categoria}
                          </Typography>
                          <Typography variant="caption">
                            Qtd: {item.quantidade} | Tipo: {item.tipo_atendimento} | Valor: R$ {item.valor_unitario?.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                
                {propostaSelecionada.observacoes_gerais && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Observações
                        </Typography>
                        <Typography>{propostaSelecionada.observacoes_gerais}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogDetalhesOpen(false)}>Fechar</Button>
              <Button variant="outlined" startIcon={<PdfIcon />}>
                Gerar PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};