import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Empresa } from './components/Empresa';
import { Configuracoes } from './components/Configuracoes';
import { NovaProposta } from './components/NovaProposta';
import { Historico } from './components/Historico';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fab,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Divider,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  typography: {
    h4: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 500
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    }
  }
});

// Context para dados globais
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

// Provider principal
const AppProvider = ({ children }) => {
  const [servicos, setServicos] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const loadServicos = async () => {
    try {
      const response = await axios.get(`${API}/servicos`);
      setServicos(response.data);
    } catch (error) {
      showSnackbar('Erro ao carregar serviços', 'error');
    }
  };

  const loadEmpresa = async () => {
    try {
      const response = await axios.get(`${API}/empresa`);
      setEmpresa(response.data);
    } catch (error) {
      // Se não existir, retorna null
      setEmpresa(null);
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const response = await axios.get(`${API}/configuracoes`);
      setConfiguracoes(response.data);
    } catch (error) {
      showSnackbar('Erro ao carregar configurações', 'error');
    }
  };

  const loadPropostas = async () => {
    try {
      const response = await axios.get(`${API}/propostas`);
      setPropostas(response.data);
    } catch (error) {
      showSnackbar('Erro ao carregar propostas', 'error');
    }
  };

  useEffect(() => {
    loadServicos();
    loadEmpresa();
    loadConfiguracoes();
    loadPropostas();
  }, []);

  const value = {
    servicos,
    setServicos,
    empresa,
    setEmpresa,
    configuracoes,
    setConfiguracoes,
    propostas,
    setPropostas,
    loading,
    setLoading,
    showSnackbar,
    loadServicos,
    loadEmpresa,
    loadConfiguracoes,
    loadPropostas
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppContext.Provider>
  );
};

// Layout principal
const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Serviços', icon: <BuildIcon />, path: '/servicos' },
    { text: 'Empresa', icon: <BusinessIcon />, path: '/empresa' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
    { text: 'Nova Proposta', icon: <AssignmentIcon />, path: '/proposta/nova' },
    { text: 'Histórico', icon: <HistoryIcon />, path: '/historico' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Propostas
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ mt: 8 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

// Dashboard
const Dashboard = () => {
  const { servicos, propostas, empresa } = useApp();

  const stats = {
    totalServicos: servicos.filter(s => s.ativo).length,
    totalPropostas: propostas.length,
    propostasEnviadas: propostas.filter(p => p.status === 'enviada').length,
    propostasAprovadas: propostas.filter(p => p.status === 'aprovada').length
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Serviços Ativos
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalServicos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Propostas
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalPropostas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Propostas Enviadas
              </Typography>
              <Typography variant="h4" component="div">
                {stats.propostasEnviadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Propostas Aprovadas
              </Typography>
              <Typography variant="h4" component="div">
                {stats.propostasAprovadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!empresa && (
        <Card sx={{ mt: 3, bgcolor: 'warning.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚠️ Configuração Pendente
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Configure os dados da sua empresa para começar a criar propostas profissionais.
            </Typography>
            <Button variant="contained" href="/empresa">
              Configurar Empresa
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Propostas Recentes
              </Typography>
              {propostas.slice(0, 5).map((proposta) => (
                <Box key={proposta.id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>{proposta.numero}</strong> - {proposta.cliente_nome}
                  </Typography>
                  <Chip 
                    label={proposta.status} 
                    size="small" 
                    color={proposta.status === 'aprovada' ? 'success' : 'default'}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" fullWidth href="/proposta/nova">
                  Nova Proposta
                </Button>
                <Button variant="outlined" fullWidth href="/servicos">
                  Gerenciar Serviços
                </Button>
                <Button variant="outlined" fullWidth href="/historico">
                  Ver Histórico
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Gerenciamento de Serviços
const Servicos = () => {
  const { servicos, loadServicos, showSnackbar } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    tipo_cobranca: 'remoto',
    valor_remoto: 0,
    valor_presencial: 0,
    valor_fixo: 0,
    valor_base_projeto: 0
  });

  const handleSubmit = async () => {
    try {
      if (editingServico) {
        await axios.put(`${API}/servicos/${editingServico.id}`, formData);
        showSnackbar('Serviço atualizado com sucesso!');
      } else {
        await axios.post(`${API}/servicos`, formData);
        showSnackbar('Serviço criado com sucesso!');
      }
      
      loadServicos();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      showSnackbar('Erro ao salvar serviço', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await axios.delete(`${API}/servicos/${id}`);
        showSnackbar('Serviço excluído com sucesso!');
        loadServicos();
      } catch (error) {
        showSnackbar('Erro ao excluir serviço', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      tipo_cobranca: 'remoto',
      valor_remoto: 0,
      valor_presencial: 0,
      valor_fixo: 0,
      valor_base_projeto: 0
    });
    setEditingServico(null);
  };

  const openEditDialog = (servico) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      categoria: servico.categoria,
      tipo_cobranca: servico.tipo_cobranca,
      valor_remoto: servico.valor_remoto,
      valor_presencial: servico.valor_presencial,
      valor_fixo: servico.valor_fixo,
      valor_base_projeto: servico.valor_base_projeto
    });
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Serviços</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Novo Serviço
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Categoria</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Valores</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicos.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell>{servico.nome}</TableCell>
                  <TableCell>{servico.categoria}</TableCell>
                  <TableCell>
                    <Chip 
                      label={servico.tipo_cobranca} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {servico.tipo_cobranca === 'remoto' && `R$ ${servico.valor_remoto}`}
                    {servico.tipo_cobranca === 'presencial' && `R$ ${servico.valor_presencial}`}
                    {servico.tipo_cobranca === 'fixo' && `R$ ${servico.valor_fixo}`}
                    {servico.tipo_cobranca === 'projeto' && `R$ ${servico.valor_base_projeto}`}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={servico.ativo ? 'Ativo' : 'Inativo'} 
                      color={servico.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(servico)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(servico.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Serviço"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Cobrança</InputLabel>
                <Select
                  value={formData.tipo_cobranca}
                  label="Tipo de Cobrança"
                  onChange={(e) => setFormData({...formData, tipo_cobranca: e.target.value})}
                >
                  <MenuItem value="remoto">Remoto</MenuItem>
                  <MenuItem value="presencial">Presencial</MenuItem>
                  <MenuItem value="fixo">Fixo</MenuItem>
                  <MenuItem value="projeto">Projeto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Remoto"
                type="number"
                value={formData.valor_remoto}
                onChange={(e) => setFormData({...formData, valor_remoto: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Presencial"
                type="number"
                value={formData.valor_presencial}
                onChange={(e) => setFormData({...formData, valor_presencial: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Fixo"
                type="number"
                value={formData.valor_fixo}
                onChange={(e) => setFormData({...formData, valor_fixo: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Base Projeto"
                type="number"
                value={formData.valor_base_projeto}
                onChange={(e) => setFormData({...formData, valor_base_projeto: parseFloat(e.target.value) || 0})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Wrapper components para usar o Context
const EmpresaWrapper = () => {
  const { showSnackbar, loadEmpresa, empresa } = useApp();
  return <Empresa showSnackbar={showSnackbar} loadEmpresa={loadEmpresa} empresa={empresa} />;
};

const ConfiguracoesWrapper = () => {
  const { showSnackbar, loadConfiguracoes, configuracoes } = useApp();
  return <Configuracoes showSnackbar={showSnackbar} loadConfiguracoes={loadConfiguracoes} configuracoes={configuracoes} />;
};

const NovaPropostaWrapper = () => {
  const { showSnackbar, servicos } = useApp();
  return <NovaProposta showSnackbar={showSnackbar} servicos={servicos} />;
};

const HistoricoWrapper = () => {
  const { showSnackbar, propostas, loadPropostas } = useApp();
  return <Historico showSnackbar={showSnackbar} propostas={propostas} loadPropostas={loadPropostas} />;
};

// App principal
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/empresa" element={<EmpresaWrapper />} />
              <Route path="/configuracoes" element={<ConfiguracoesWrapper />} />
              <Route path="/proposta/nova" element={<NovaPropostaWrapper />} />
              <Route path="/historico" element={<HistoricoWrapper />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;