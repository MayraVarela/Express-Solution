const express = require('express');
const PORT =  3001;
const app = express();
const { generarTabla } = require('./Controllers');


app.get('/', generarTabla);


app.listen(3000, () => {
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))
});