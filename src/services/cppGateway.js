const net = require('net');
// server details (EX2)
const CPP_SERVER_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1';
const CPP_SERVER_PORT = process.env.CPP_SERVER_PORT || 9000;

/**
 * helper function to extract product IDs from the products array.
 */
const extractProductIds = (products) => {
    if (Array.isArray(products)) {
        return products
            .map(p => (p && typeof p === 'object') ? (p.id || p.productId) : p)
            .filter(Boolean); // cleaning out any undefined/null values
    }
    if (typeof products === 'string' && products.trim() !== '') {
        return [products.trim()];
    }
    return [];
};

/**
 * helper function for opening a TCP socket, sending a command, receiving a response, and closing it
 */
const sendCommandToCpp = (commandString) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(CPP_SERVER_PORT, CPP_SERVER_HOST, () => {
            // backslash n is signaling the end of the command for the C++ server to process it
            client.write(commandString + '\n');
        });

        // receiving response from the C++ server
        client.on('data', (data) => {
            resolve(data.toString().trim());
            client.destroy(); // closing the socket immediately after completing the operation
        });

        // handling connection errors
        client.on('error', (err) => {
            reject(new Error(`Failed to connect to C++ server: ${err.message}`));
            client.destroy();
        });
    });
};

/**
 * POST interaction: sending a new order interaction to the C++ server
 * @param {string} userId - user ID
 * @param {Array|string} products - product array
 */
const sendPostInteraction = async (userId, products) => {
    const productIds = extractProductIds(products);
    
    if (productIds.length === 0) return; // no products' nothing to send to the C++ server

    const command = `POST ${userId} ${productIds.join(' ')}`;
    console.log(`[Gateway] Sending to C++: ${command}`);
    
    return await sendCommandToCpp(command);
};

/**
 * DELETE interaction: sending a delete order interaction to the C++ server
 * @param {string} userId - user ID
 * @param {Array} products - array of products that were in the deleted order
 */
const deleteOrderInteraction = async (userId, products) => {
    const productIds = extractProductIds(products);
    
    if (productIds.length === 0) return;

    const command = `DELETE ${userId} ${productIds.join(' ')}`;
    console.log(`[Gateway] Sending to C++: ${command}`);
    
    return await sendCommandToCpp(command);
};
/**
 * GET interaction: sending a view interaction to the C++ server
 * @param {string} userId - user ID
 * @param {string} productId - product ID
 * @returns 
 */
const sendGetInteraction = async (userId, productId) => {
    const command = `GET ${userId} ${productId}`;
    console.log(`[Gateway] Sending View to C++: ${command}`);
    return await sendCommandToCpp(command);
};

module.exports = {
    sendPostInteraction,
    deleteOrderInteraction,
    sendGetInteraction
};