const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const body_parser = require('body-parser')
/*const axios = require('axios')*/

const { MercadoPagoConfig, Payment } = require('mercadopago')
const client = new MercadoPagoConfig({
  accessToken: 'TEST-4480189822839140-122917-65a091edb91d3062baae90a4bf6b2e37-225293277',
  options: { timeout: 5000, idempotencyKey: 'abc' },
})
const payment = new Payment(client)

const app = express()

app.use(cors())
app.use(body_parser.json())
app.use(express.json())


mongoose.connect('mongodb://127.0.0.1:27017/agendamento', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err))

const agendamento_Schema = new mongoose.Schema({
    data:Date
})

const agendamento = mongoose.model('Agendamento',agendamento_Schema)

const pagamento_Schema = new mongoose.Schema({
    data_inicial: Date,
    data_final: Date
})

const pagamento = mongoose.model('Pagamento',pagamento_Schema)



app.get('/',(req,res)=>{
    console.log('Olá')
})

app.post('/agendamento',(req,res)=>{
    const {data} = req.body

    agendamento.findOne({data})
    .then((data_exist)=>{
        if(data_exist){
            return res.status(400).json({message:'Data ja existe'})
        }
        const data_agendar = new agendamento({data})
        data_agendar.save()
        .then((agendar)=>{
            console.log('Agendamento concluido')
            return res.status(201).json({message:'Agendamento feito com sucesso',agendar})
        })
        .catch((err)=>{
            console.log('Não conseguimos concluir seu agendamento, tente novamente!',err)
        })
    })
    .catch((error)=>{
        console.log('Deu algo errado'+error)
    })
})


app.delete('/agendamento_delete',(req,res)=>{
    const {data_delete} = req.body

    if(!data_delete){
        return res.status(400).json({ message: 'A data para exclusão é obrigatória' })
    }

    const data_excluir = new Date(data_delete)

    agendamento.deleteOne({data:data_excluir})
    .then((delete_data)=>{
        if (delete_data.deletedCount > 0) {
            return res.status(200).json({ message: 'A data foi deletada com sucesso' })
        } else {
            return res.status(404).json({ message: 'Nenhuma data encontrada para exclusão' })
        }
    })
    .catch((err)=>{
        console.log('Deu errado ao deletar a data!',err)
    })
})




app.post('/agendamento_pagamento',(req,res)=>{
    const data_inicial = new Date(req.body.data_inicial)
    const data_final = new Date(req.body.data_final)

    if (isNaN(data_inicial) || isNaN(data_final)) {
        return res.status(400).json({ message: 'Datas inválidas.' });
    }

    if (data_final < data_inicial) {
        return res.status(400).json({ message: 'A data final não pode ser anterior à data inicial.' });
    }
    
    pagamento.findOne({
        $or: [
            { data_inicial: { $lte: data_final }, data_final: { $gte: data_inicial } },
        ],
    })
    .then((data_exist)=>{

        if (data_exist) {
            return res.status(400).json({ message: 'Data já existe.'})
        }
        const data_agendar_pagamento = new pagamento({data_inicial,data_final})
        data_agendar_pagamento.save()
        .then((agendar)=>{
            console.log('Agendamento concluido')
            return res.status(201).json({message:'Agendamento feito com sucesso',agendar})
        })
        .catch((err)=>{
            console.log('Não conseguimos concluir seu agendamento, tente novamente!',err)
            return res.status(500).json({ message: 'Erro ao salvar agendamento.' })
        })
    })
    .catch((error)=>{
        console.log('Deu algo errado'+error)
        return res.status(500).json({ message: 'Erro no servidor' })
    })
})

app.post('/criar_pagamento',(req,res)=>{
    const {total,data_inicio,data_fim,email_pagamento} = req.body
    const total_pagamento = total/2

    const pagamento = {
        transaction_amount:total_pagamento,
        description:`Aluguel de ${data_inicio} até ${data_fim}`,
        payer:{
            email: email_pagamento
        },
        notification_url:'https://seu_site.com/notificações',
        back_urls:{
            success:'https://seu_site.com/pagamento',
            failure:'https://seu_site.com/erro',
            pending:'https://seu_site.com/pendente'
        }
    }

    payment.create({body: pagamento})
    .then(res=>{
        console.log(res)
        res.status(200).json(res)
        res.status(500).json({ message: 'Erro ao criar pagamento' })
    })
    .catch(error=>{
        console.log(error)
    })
})




const port = 3000
app.listen(port,()=>{console.log('Rodando na porta'+port)})