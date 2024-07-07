import express from 'express';
import POST from "./fn.js"
const app = express()
const port = 3001

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use( async (req, res) => {
    // @notice this is a mock server for the frontend use your ngrok connection
    //console.log(html)
    res.send(await POST({request:req}));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })