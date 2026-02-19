
try {
    const llamaParse = require('llama-parse');
    console.log('llama-parse exports:', Object.keys(llamaParse));
} catch (e) {
    console.log('llama-parse not found');
}

try {
    const llamaindex = require('llamaindex');
    console.log('llamaindex exports:', Object.keys(llamaindex));
} catch (e) {
    console.log('llamaindex not found');
}
