import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Paper,
  Alert
} from '@mui/material';
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Empresa = ({ showSnackbar, loadEmpresa, empresa }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj_cpf: '',
    endereco: '',
    telefone: '',
    email: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || '',
        cnpj_cpf: empresa.cnpj_cpf || '',
        endereco: empresa.endereco || '',
        telefone: empresa.telefone || '',
        email: empresa.email || '',
        logo_url: empresa.logo_url || ''
      });
    }
  }, [empresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (empresa) {
        await axios.put(`${API}/empresa`, formData);
        showSnackbar('Dados da empresa atualizados com sucesso!');
      } else {
        await axios.post(`${API}/empresa`, formData);
        showSnackbar('Dados da empresa cadastrados com sucesso!');
      }
      
      loadEmpresa();
    } catch (error) {
      showSnackbar('Erro ao salvar dados da empresa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BusinessIcon fontSize="large" />
        Dados da Empresa
      </Typography>

      {!empresa && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Configure os dados da sua empresa para criar propostas profissionais com logo e informações completas.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome da Empresa"
                      required
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CNPJ / CPF"
                      required
                      value={formData.cnpj_cpf}
                      onChange={(e) => handleChange('cnpj_cpf', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Endereço Completo"
                      required
                      multiline
                      rows={2}
                      value={formData.endereco}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Logotipo
                </Typography>
                
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.light'
                  }}
                  src={formData.logo_url}
                >
                  <BusinessIcon sx={{ fontSize: 60 }} />
                </Avatar>
                
                <TextField
                  fullWidth
                  label="URL do Logo"
                  value={formData.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  fullWidth
                  onClick={() => showSnackbar('Upload de arquivo será implementado em breve', 'info')}
                >
                  Upload de Arquivo
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Dados'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>

      {empresa && (
        <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ Empresa Configurada
            </Typography>
            <Typography variant="body2">
              Os dados da sua empresa estão configurados e serão incluídos automaticamente em todas as propostas geradas.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};