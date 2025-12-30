module.exports = (ctx) => {
    // Axios GET Node
    ctx.registerNode({
        label: 'Axios Get',
        category: 'Axios',
        inputs: {
            exec: { type: 'exec' },
            url: { type: 'string', label: 'URL', default: 'https://api.ipify.org?format=json' }
        },
        outputs: {
            exec: { type: 'exec' },
            data: { type: 'string', label: 'Response Data' },
            status: { type: 'number', label: 'Status Code' }
        },
        execute: 'axiosGet'
    });

    // Axios POST Node
    ctx.registerNode({
        label: 'Axios Post',
        category: 'Axios',
        inputs: {
            exec: { type: 'exec' },
            url: { type: 'string', label: 'URL' },
            body: { type: 'string', label: 'JSON Body', default: '{}' }
        },
        outputs: {
            exec: { type: 'exec' },
            data: { type: 'string', label: 'Response Data' },
            status: { type: 'number', label: 'Status Code' }
        },
        execute: 'axiosPost'
    });

    // Log Response
    ctx.registerNode({
        label: 'Log Response',
        category: 'Network',
        inputs: {
            exec: { type: 'exec' },
            data: { type: 'string', label: 'Data to Log' }
        },
        outputs: {
            exec: { type: 'exec' }
        },
        execute: 'logResponse'
    });

    // Reverse String
    ctx.registerNode({
        label: 'Reverse String',
        category: 'Utils',
        inputs: {
            text: { type: 'string', label: 'Text' }
        },
        outputs: {
            reversed: { type: 'string', label: 'Reversed Text' }
        },
        execute: 'reverseString'
    });

    // Test Complex Outputs
    ctx.registerNode({
        label: 'Get Complex User',
        category: 'Test',
        inputs: {
            exec: { type: 'exec' }
        },
        outputs: {
            exec: { type: 'exec' },
            'user.name': { type: 'string', label: 'User Name' },
            'user.address.city': { type: 'string', label: 'City' },
            'meta-data': { type: 'string', label: 'Meta (Invalid ID)' }
        },
        execute: 'getComplexUser'
    });
};
