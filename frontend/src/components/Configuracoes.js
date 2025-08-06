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
  InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Configuracoes = ({ showSnackbar, loadConfiguracoes, configuracoes }) => {
  const [formData, setFormData] = useState({
    percentual_urgencia: 0,
    deslocamento_fixo: 0,
    deslocamento_por_km: 0,
    valor_plantao_hora: 0,
    percentual_imposto: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (configuracoes) {
      setFormData({
        percentual_urgencia: configuracoes.percentual_urgencia || 0,
        deslocamento_fixo: configuracoes.deslocamento_fixo || 0,
        deslocamento_por_km: configuracoes.deslocamento_por_km || 0,
        valor_plantao_hora: configuracoes.valor_plantao_hora || 0,
        percentual_imposto: configuracoes.percentual_imposto || 0
      });
    }
  }, [configuracoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/configuracoes`, formData);
      showSnackbar('Configurações salvas com sucesso!');
      loadConfiguracoes();
    } catch (error) {
      showSnackbar('Erro ao salvar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon fontSize="large" />
        Configurações do Sistema
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Estas configurações serão aplicadas automaticamente no cálculo de todas as propostas.
      </Alert>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          
          {/* Configurações de Urgência */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PercentIcon />
                  Urgência
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Percentual de Urgência"
                  type="number"
                  value={formData.percentual_urgencia}
                  onChange={(e) => handleChange('percentual_urgencia', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Percentual aplicado sobre o valor dos serviços quando marcado como urgente"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Configurações de Deslocamento */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CarIcon />
                  Deslocamento
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Valor Fixo de Deslocamento"
                      type="number"
                      value={formData.deslocamento_fixo}
                      onChange={(e) => handleChange('deslocamento_fixo', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                      helperText="Valor fixo cobrado por deslocamento (se preenchido, ignora o valor por KM)"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Valor por KM"
                      type="number"
                      value={formData.deslocamento_por_km}
                      onChange={(e) => handleChange('deslocamento_por_km', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                      helperText="Valor cobrado por quilômetro rodado"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Configurações de Plantão */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Plantão
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Valor Hora de Plantão"
                  type="number"
                  value={formData.valor_plantao_hora}
                  onChange={(e) => handleChange('valor_plantao_hora', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  helperText="Valor cobrado por hora extra em plantão"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Configurações de Impostos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon />
                  Impostos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Percentual de Impostos"
                  type="number"
                  value={formData.percentual_imposto}
                  onChange={(e) => handleChange('percentual_imposto', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Percentual de impostos aplicado sobre o valor final"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Botão de Salvar */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>

      {/* Preview das Configurações */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Resumo das Configurações
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Urgência:</Typography>
              <Typography variant="h6">{formData.percentual_urgencia}%</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Deslocamento Fixo:</Typography>
              <Typography variant="h6">R$ {formData.deslocamento_fixo}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Valor por KM:</Typography>
              <Typography variant="h6">R$ {formData.deslocamento_por_km}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Plantão/Hora:</Typography>
              <Typography variant="h6">R$ {formData.valor_plantao_hora}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Impostos:</Typography>
              <Typography variant="h6">{formData.percentual_imposto}%</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};