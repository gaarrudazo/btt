const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http'); // Importa o serverless-http
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas para servir os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname)));

// Endpoint para buscar próximos jogos
app.get('/api/next-matches', async (req, res) => {
    const { leagueId, season } = req.query;

    if (!leagueId || !season) {
        return res.status(400).json({ error: 'Parâmetros leagueId e season são obrigatórios.' });
    }

    // Verifique se as variáveis de ambiente estão definidas
    if (!process.env.BASE_URL || !process.env.API_KEY) {
        console.error('Variáveis de ambiente BASE_URL ou API_KEY não estão definidas.');
        return res.status(500).json({ error: 'Configuração do servidor inválida.' });
    }

    try {
        const response = await axios.get(`${process.env.BASE_URL}/matches`, {
            params: {
                league_id: leagueId, // Confirmar o nome correto do parâmetro na documentação
                season_id: season,    // Confirmar o nome correto do parâmetro na documentação
                status: 'SCHEDULED',
                api_token: process.env.API_KEY
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar próximos jogos:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: error.response ? error.response.data : 'Erro interno do servidor.'
        });
    }
});

// Endpoint para buscar placares ao vivo
app.get('/api/live-scores', async (req, res) => {
    const { leagueId } = req.query;

    if (!leagueId) {
        return res.status(400).json({ error: 'Parâmetro leagueId é obrigatório.' });
    }

    // Verifique se as variáveis de ambiente estão definidas
    if (!process.env.BASE_URL || !process.env.API_KEY) {
        console.error('Variáveis de ambiente BASE_URL ou API_KEY não estão definidas.');
        return res.status(500).json({ error: 'Configuração do servidor inválida.' });
    }

    try {
        const response = await axios.get(`${process.env.BASE_URL}/matches`, {
            params: {
                league_id: leagueId, // Confirmar o nome correto do parâmetro na documentação
                status: 'LIVE',
                api_token: process.env.API_KEY
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Erro ao buscar placares ao vivo:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: error.response ? error.response.data : 'Erro interno do servidor.'
        });
    }
});

// Rota principal para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback para outras rotas (útil para SPAs)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Exporta a função handler para o Vercel
module.exports.handler = serverless(app);
