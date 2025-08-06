import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const NovaProposta = ({ showSnackbar, servicos }) => {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_endereco: '',
    observacoes_gerais: ''
  });

  const [itens, setItens] = useState([]);
  const [adicionais, setAdicionais] = useState({
    deslocamento_km: 0,
    horas_plantao: 0,
    urgencia_global: false
  });

  const [desconto, setDesconto] = useState({
    tipo: 'fixo',
    valor: 0
  });

  const [preview, setPreview] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [dialogItemOpen, setDialogItemOpen] = useState(false);
  const [itemAtual, setItemAtual] = useState({
    servico_id: '',
    tipo_atendimento: 'remoto',
    quantidade: 1,
    urgencia_aplicada: false,
    observacoes: ''
  });

  const calcularPreview = async () => {
    try {
      const dadosCalculo = {
        itens: itens.map(item => ({
          servico_id: item.servico_id,
          tipo_atendimento: item.tipo_atendimento,
          quantidade: item.quantidade,
          urgencia_aplicada: item.urgencia_aplicada,
          valor_unitario: item.valor_unitario
        })),
        deslocamento_km: adicionais.deslocamento_km,
        horas_plantao: adicionais.horas_plantao,
        urgencia_global: adicionais.urgencia_global,
        desconto_tipo: desconto.tipo,
        desconto_valor: desconto.valor
      };

      const response = await axios.post(`${API}/propostas/calcular-preview`, dadosCalculo);
      setPreview(response.data);
    } catch (error) {
      showSnackbar('Erro ao calcular preview', 'error');
    }
  };

  useEffect(() => {
    if (itens.length > 0) {
      calcularPreview();
    } else {
      setPreview(null);
    }
  }, [itens, adicionais, desconto]);

  const adicionarItem = () => {
    if (!itemAtual.servico_id) {
      showSnackbar('Selecione um serviço', 'error');
      return;
    }

    const servico = servicos.find(s => s.id === itemAtual.servico_id);
    if (!servico) {
      showSnackbar('Serviço não encontrado', 'error');
      return;
    }

    // Determina valor baseado no tipo de atendimento
    let valorUnitario = 0;
    if (servico.tipo_cobranca === 'remoto' && itemAtual.tipo_atendimento === 'remoto') {
      valorUnitario = servico.valor_remoto;
    } else if (servico.tipo_cobranca === 'presencial' && itemAtual.tipo_atendimento === 'presencial') {
      valorUnitario = servico.valor_presencial;
    } else if (servico.tipo_cobranca === 'fixo') {
      valorUnitario = servico.valor_fixo;
    } else if (servico.tipo_cobranca === 'projeto') {
      valorUnitario = servico.valor_base_projeto;
    }

    const novoItem = {
      ...itemAtual,
      servico_nome: servico.nome,
      servico_categoria: servico.categoria,
      valor_unitario: valorUnitario,
      subtotal: valorUnitario * itemAtual.quantidade
    };

    setItens([...itens, novoItem]);
    setItemAtual({
      servico_id: '',
      tipo_atendimento: 'remoto',
      quantidade: 1,
      urgencia_aplicada: false,
      observacoes: ''
    });
    setServicoSelecionado('');
    setDialogItemOpen(false);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const salvarProposta = async () => {
    if (!formData.cliente_nome || itens.length === 0) {
      showSnackbar('Preencha o nome do cliente e adicione pelo menos um serviço', 'error');
      return;
    }

    try {
      const dadosProposta = {
        ...formData,
        itens: itens.map(item => ({
          servico_id: item.servico_id,
          tipo_atendimento: item.tipo_atendimento,
          quantidade: item.quantidade,
          urgencia_aplicada: item.urgencia_aplicada,
          observacoes: item.observacoes
        })),
        deslocamento_km: adicionais.deslocamento_km,
        horas_plantao: adicionais.horas_plantao,
        urgencia_global: adicionais.urgencia_global,
        desconto_tipo: desconto.tipo,
        desconto_valor: desconto.valor
      };

      await axios.post(`${API}/propostas`, dadosProposta);
      showSnackbar('Proposta criada com sucesso!');
      
      // Reset form
      setFormData({
        cliente_nome: '',
        cliente_email: '',
        cliente_telefone: '',
        cliente_endereco: '',
        observacoes_gerais: ''
      });
      setItens([]);
      setPreview(null);
      
    } catch (error) {
      showSnackbar('Erro ao criar proposta', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AssignmentIcon fontSize="large" />
        Nova Proposta
      </Typography>

      <Grid container spacing={3}>
        
        {/* Dados do Cliente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👤 Dados do Cliente
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome do Cliente"
                    required
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-mail"
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={formData.cliente_telefone}
                    onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    multiline
                    rows={2}
                    value={formData.cliente_endereco}
                    onChange={(e) => setFormData({...formData, cliente_endereco: e.target.value})}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Adicionais */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚡ Adicionais
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={adicionais.urgencia_global}
                        onChange={(e) => setAdicionais({...adicionais, urgencia_global: e.target.checked})}
                      />
                    }
                    label="Urgência Global"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Deslocamento (KM)"
                    type="number"
                    value={adicionais.deslocamento_km}
                    onChange={(e) => setAdicionais({...adicionais, deslocamento_km: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">KM</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Horas Plantão"
                    type="number"
                    value={adicionais.horas_plantao}
                    onChange={(e) => setAdicionais({...adicionais, horas_plantao: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">h</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                💰 Desconto
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={desconto.tipo}
                      label="Tipo"
                      onChange={(e) => setDesconto({...desconto, tipo: e.target.value})}
                    >
                      <MenuItem value="fixo">Valor Fixo</MenuItem>
                      <MenuItem value="percentual">Percentual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Valor"
                    type="number"
                    value={desconto.valor}
                    onChange={(e) => setDesconto({...desconto, valor: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        {desconto.tipo === 'fixo' ? 'R$' : '%'}
                      </InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Serviços */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🛠️ Serviços
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogItemOpen(true)}
                >
                  Adicionar Serviço
                </Button>
              </Box>

              {itens.length === 0 ? (
                <Alert severity="info">Adicione serviços à proposta</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Serviço</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Qtd</TableCell>
                        <TableCell>Valor Unit.</TableCell>
                        <TableCell>Subtotal</TableCell>
                        <TableCell>Urgência</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itens.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {item.servico_nome}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {item.servico_categoria}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.tipo_atendimento}
                              size="small"
                              color={item.tipo_atendimento === 'presencial' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>R$ {item.valor_unitario?.toFixed(2)}</TableCell>
                          <TableCell>R$ {item.subtotal?.toFixed(2)}</TableCell>
                          <TableCell>
                            {item.urgencia_aplicada && <Chip label="Urgente" color="warning" size="small" />}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => removerItem(index)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Preview de Valores */}
        {preview && (
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon />
                  Resumo Financeiro
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal Serviços:</Typography>
                    <Typography variant="h6">R$ {preview.subtotal_servicos?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Urgência:</Typography>
                    <Typography variant="h6">R$ {preview.valor_urgencia_total?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Deslocamento:</Typography>
                    <Typography variant="h6">R$ {preview.valor_deslocamento?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Plantão:</Typography>
                    <Typography variant="h6">R$ {preview.valor_plantao?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Desconto:</Typography>
                    <Typography variant="h6">- R$ {preview.desconto_aplicado?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Impostos:</Typography>
                    <Typography variant="h6">R$ {preview.valor_impostos?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                    <Typography variant="body2">VALOR TOTAL:</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      R$ {preview.valor_total?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Observações Gerais */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 Observações Gerais
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Informações adicionais sobre a proposta..."
                value={formData.observacoes_gerais}
                onChange={(e) => setFormData({...formData, observacoes_gerais: e.target.value})}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Ações */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" startIcon={<PreviewIcon />}>
              Visualizar PDF
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={salvarProposta}
              disabled={!formData.cliente_nome || itens.length === 0}
            >
              Salvar Proposta
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog Adicionar Item */}
      <Dialog open={dialogItemOpen} onClose={() => setDialogItemOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Adicionar Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Serviço</InputLabel>
                <Select
                  value={itemAtual.servico_id}
                  label="Serviço"
                  onChange={(e) => setItemAtual({...itemAtual, servico_id: e.target.value})}
                >
                  {servicos.filter(s => s.ativo).map(servico => (
                    <MenuItem key={servico.id} value={servico.id}>
                      {servico.nome} - {servico.categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Atendimento</InputLabel>
                <Select
                  value={itemAtual.tipo_atendimento}
                  label="Tipo de Atendimento"
                  onChange={(e) => setItemAtual({...itemAtual, tipo_atendimento: e.target.value})}
                >
                  <MenuItem value="remoto">Remoto</MenuItem>
                  <MenuItem value="presencial">Presencial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={itemAtual.quantidade}
                onChange={(e) => setItemAtual({...itemAtual, quantidade: parseFloat(e.target.value) || 1})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={itemAtual.urgencia_aplicada}
                    onChange={(e) => setItemAtual({...itemAtual, urgencia_aplicada: e.target.checked})}
                  />
                }
                label="Aplicar urgência neste item"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                multiline
                rows={2}
                value={itemAtual.observacoes}
                onChange={(e) => setItemAtual({...itemAtual, observacoes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogItemOpen(false)}>Cancelar</Button>
          <Button onClick={adicionarItem} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};