/*import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"
dotenv.config()

const port =process.env.PORT

const app=express()

app.use(express.json())
app.use("/",router)

app.use((err,req,res,next)=>{
  console.log(err)

  if(err.status){
    return res.status(err.status).json(err.data)
  }

  return res.status(500).json({message:`agent error ${error}`})
})


app.get("/",(req,res)=>{
    res.json({message:"hello from agent"})
})

app.listen(port,()=>{
    console.log(`agent started at ${port}`)
    connectDb()
})*/

import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"
dotenv.config()

const port =process.env.PORT

const app=express()

const __dirname2 = path.dirname(fileURLToPath(import.meta.url))
app.use("/files", express.static(path.join(__dirname2, "uploads")))

app.use(express.json())
app.use("/",router)

app.use((err,req,res,next)=>{
  console.log(err)

  if(err.status){
    return res.status(err.status).json(err.data)
  }

  return res.status(500).json({message:`agent error ${err}`})
})


app.get("/",(req,res)=>{
    res.json({message:"hello from agent"})
})

app.listen(port,()=>{
    console.log(`agent started at ${port}`)
    connectDb()
})
