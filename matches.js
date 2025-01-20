// /api/matches.js
const axios = require('axios');

module.exports = async (req, res) => {
    const { type, leagueId, season } = req.query;

    // Validação do parâmetro 'type'
    if (!type || !['next', 'live'].includes(type)) {
        return res.status(400).json({ error: 'Parâmetro "type" inválido ou ausente. Use "next" ou "live".' });
    }

    // Validação de parâmetros com base no 'type'
    if (type === 'next' && (!leagueId || !season)) {
        return res.status(400).json({ error: 'Parâmetros "leagueId" e "season" são obrigatórios para "next".' });
    }

    if (type === 'live' && !leagueId) {
        return res.status(400).json({ error: 'Parâmetro "leagueId" é obrigatório para "live".' });
    }

    const BASE_URL = process.env.BASE_URL;
    const API_KEY = process.env.API_KEY;

    if (!BASE_URL || !API_KEY) {
        console.error('Variáveis de ambiente BASE_URL ou API_KEY não estão definidas.');
        return res.status(500).json({ error: 'Configuração do servidor inválida.' });
    }

    try {
        let endpoint = '';
        let params = {
            api_token: API_KEY,
            league_id: leagueId
        };

        if (type === 'next') {
            endpoint = '/fixtures/upcoming'; // Ajuste conforme a documentação da Sportmonks
            params.season_id = season;
        } else if (type === 'live') {
            endpoint = '/livescores'; // Ajuste conforme a documentação da Sportmonks
        }

        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Erro ao buscar ${type === 'next' ? 'próximos jogos' : 'placares ao vivo'}:`, error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
            error: error.response ? error.response.data : 'Erro interno do servidor.'
        });
    }
};
