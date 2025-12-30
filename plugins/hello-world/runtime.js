const axios = require('axios');

module.exports = {
    axiosGet: async (args) => {
        try {
            console.log(`[Axios GET] Requesting ${args.url}...`);
            const res = await axios.get(args.url);
            console.log(`[Axios GET] Success: ${res.status}`);
            return { data: JSON.stringify(res.data), status: res.status };
        } catch (error) {
            console.error(`[Axios GET] Error:`, error.message);
            return { data: JSON.stringify({ error: error.message }), status: error.response?.status || 500 };
        }
    },

    axiosPost: async (args) => {
        try {
            const body = typeof args.body === 'string' ? JSON.parse(args.body) : args.body;
            console.log(`[Axios POST] Posting to ${args.url}...`, body);
            const res = await axios.post(args.url, body);
            console.log(`[Axios POST] Success: ${res.status}`);
            return { data: JSON.stringify(res.data), status: res.status };
        } catch (error) {
            console.error(`[Axios POST] Error:`, error.message);
            return { data: JSON.stringify({ error: error.message }), status: error.response?.status || 500 };
        }
    },

    logResponse: async (args) => {
        console.log("---------------- RESPONSE LOG ----------------");
        console.log(args.data);
        console.log("----------------------------------------------");
    },

    reverseString: async (args) => {
        if (!args.text) return { reversed: '' };
        return { reversed: args.text.split('').reverse().join('') };
    },

    getComplexUser: async (args) => {
        return {
            user: {
                name: 'Alice',
                address: {
                    city: 'Wonderland'
                }
            },
            'meta-data': 'v1.0'
        };
    }
};
