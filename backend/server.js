const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

app.post('/evaluate-rule', (req, res) => {
    try {
        const { rules, data } = req.body;

        if (!rules || !data) {
            throw new Error('Invalid input');
        }

        const ast = generateAST(rules);
        const result = evaluateAST(ast, data);
        res.json({ ast, result });
    } catch (error) {
        console.error('Error in evaluate-rule:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Dummy implementations
function generateAST(rules) {
    return rules;
}

function evaluateAST(ast, data) {
    let result = true; 
    for (const key in ast) {
        if (ast[key].operator === '>') {
            if (data[key] <= ast[key].value) {
                result = false;
            }
        } else if (ast[key].operator === '=') {
            if (data[key] !== ast[key].value) {
                result = false;
            }
        }
    }
    return result;
}
