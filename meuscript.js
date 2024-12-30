const { Preference } = require("mercadopago")

const burguer = document.getElementById('burguer')
const ul_itens = document.querySelector('.ul_itens')
burguer.addEventListener('click',()=>{
    ul_itens.classList.toggle('active')
    console.log(ul_itens)
})


let index = 0
function moverSlide(dir){
    const img = document.querySelectorAll('.fotos_recanto')
    total_img = img.length

    index+= dir

    if(index<0){
        index = total_img -1
    }else if(index>=total_img){
        index = 0
    }

    img.forEach(image => image.style.display = 'none');

    img[index].style.display = 'block'
}


/*Script do orçamento*/

const form_orçamento = document.getElementById('form_orçamento')

function verificar_dia(data_selecionada) {
    /*Aqui pegamos apenas o dia da data selecionada pelo usuario*/ 
    const dia_semana = data_selecionada.getDay()

    /*Se for doming ou sabado eu retorno final de semana*/
  if (dia_semana === 0 || dia_semana === 6) {
    return 'finalSemana'
} else {
    return 'semana'
}
}

 form_orçamento.addEventListener('submit', (e) => {
    e.preventDefault()

    const data_selecionada = document.getElementById('data').value
    const data_selecionada_fim = document.getElementById('data_fim').value
    const qtd_pessoas = parseInt(document.getElementById('qtd_pessoas').value)

    const taxa_limpeza = 150

    let preço_semana = 0
    let final_semana = 0

    if (qtd_pessoas >= 5 && qtd_pessoas <10) {
        preço_semana = 320
        final_semana = 420
    } else if (qtd_pessoas >= 10 && qtd_pessoas <= 15) {
        preço_semana = 400
        final_semana = 500
    } else if (qtd_pessoas > 15 && qtd_pessoas <= 20) {
        preço_semana = 330
        final_semana = 450
    } else if (qtd_pessoas > 20 && qtd_pessoas <= 25) {
        preço_semana = 250
        final_semana = 300
    } else if (qtd_pessoas > 25 && qtd_pessoas <= 30) {
        preço_semana = 400
        final_semana = 500
    } else {
        alert('A quantidade de pessoas deve estar entre 5 e 30.')
        return
    }


    const data_inicio = new Date(data_selecionada  + 'T00:00:00')
    const data_fim = new Date(data_selecionada_fim  + 'T23:59:59')

    if (data_fim < data_inicio) {
        alert('A data final não pode ser menor que a data de início')
        return
    }

    let valorTotal = taxa_limpeza

        /*Aqui eu vou percorrer pelas datas ou data selecionada pelo usuario e passar a data selecionada para o verificar_dia que vai me retornar oque cada dia selecionando é, se selecionar sexta e sabado, sexta vai ter um valor e sabado outro! ai a cada data que ele passa ele adiciona mais um dia a data atual por exemplo, eu pego do dia 18/12 até o dia 22/12 ele vai percorrer por essa data selecionada e a cada vesz que ele passar por um dia por exemplo o 19 ele adiciona mais 1 a data atual, se a data atual for 18 ele vai adicionando mais 1 a data até chegar na data fim */
        for (let current_data = new Date(data_inicio); current_data <= data_fim; current_data.setDate(current_data.getDate() + 1)) {
        const tipo_dia = verificar_dia(current_data)

        const valor_diaria = tipo_dia === 'finalSemana' ? final_semana : preço_semana
        valorTotal += valor_diaria
    }

    alert(`Orçamento Calculado:
        - Data do evento: ${data_selecionada} até ${data_selecionada_fim}
        - Quantidade de pessoas: ${qtd_pessoas}
        - Valor total: R$ ${valorTotal.toFixed(2)}
    `)
})


/*Script agendamento*/
const form_visita = document.getElementById('form_visita')

form_visita.addEventListener('submit',(e)=>{
    e.preventDefault()
    let data_visita = document.getElementById('data_visita').value

    const data = new Date(data_visita)
    const data_atual = new Date()

    //Aqui eu pego a data de hj, e vou fazer uma verificação onde o usuario não conseguira realizar agendamentos de datas passadas, para comparar as datas, eu preciso zerar os segundos, minutos , horas e milissegundos, por exemplo, não daria certo fazer isso com getDay pq ele me retorna o numero da semana e não a data, com o dia mes e ano! Por isso não da para fazer isso com getDay!
    data_atual.setHours(0,0,0,0)
    

    if(data<data_atual){
        alert('Você não pode agendar uma visita para uma data passada.')
        return
    }

    const ano = data.getFullYear()
    if (ano < 2024 || ano > 2025) {
        alert('A data de agendamento precisa ser entre 2024 e 2025.')
        return
    }

    if(data_visita<data_atual){
        fetch('http://localhost:3000/agendamento_delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data_visita })
        })
            .then(res_delete => res_delete.json())
            .then(dados_delete => {
                   if(dados_delete){
                    console.log('Data deletada com sucesso')
                   }else{
                    console.log('Nenhuma data para deletar')
                   }
            })
            .catch(error => {
                console.log('Deu algo errado ao tentar deletar a data', error)
        })
    }else{
        fetch('http://localhost:3000/agendamento',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({data: data_visita})
        
        })
        .then(res => res.json().then(dados => ({ status: res.status, dados })))
        .then(({ status, dados }) => {
            if (status === 201) {
                const errorMessage = document.getElementById("error_message")
                errorMessage.style.display = "none"
                const successMessage = document.getElementById("success_message")
                successMessage.textContent = `${dados.message} para ${data_visita}`
                successMessage.style.display = "block"
                const whatsappLink = `https://api.whatsapp.com/send?phone=SEU_NUMERO&text=Olá! Gostaria de tirar dúvidas sobre o agendamento para ${data_visita}.`
                const btnWhatsApp = document.getElementById("btn_whatsapp")
                btnWhatsApp.href = whatsappLink
                btnWhatsApp.style.display = "inline-block"
            } else if (status === 400) {
                const successMessage = document.getElementById("success_message")
                successMessage.style.display = "none"
                const errorMessage = document.getElementById("error_message")
                errorMessage.textContent = `Erro: ${dados.message}`
                errorMessage.style.display = "block"
            }
        })
        .catch(() => {
            const successMessage = document.getElementById("success_message")
            successMessage.style.display = "none"
            const errorMessage = document.getElementById("error_message")
            errorMessage.textContent = "Erro inesperado. Tente novamente mais tarde."
            errorMessage.style.display = "block"
        })
    }

})


const form_pagamento = document.getElementById('form_pagamento')

form_pagamento.addEventListener('submit',(e)=>{
    e.preventDefault()
    let data_pagamento_inicial = document.getElementById('data_pagamento_inicial').value
    let data_pagamento_final = document.getElementById('data_pagamento_final').value
    let qtd_pessoas = parseInt(document.getElementById('qtd_pessoas_pagamento').value)

    const taxa_limpeza = 150

    let preço_semana = 0
    let final_semana = 0

    if (qtd_pessoas >= 5 && qtd_pessoas <10) {
        preço_semana = 320
        final_semana = 420
    } else if (qtd_pessoas >= 10 && qtd_pessoas <= 15) {
        preço_semana = 400
        final_semana = 500
    } else if (qtd_pessoas > 15 && qtd_pessoas <= 20) {
        preço_semana = 330
        final_semana = 450
    } else if (qtd_pessoas > 20 && qtd_pessoas <= 25) {
        preço_semana = 250
        final_semana = 300
    } else if (qtd_pessoas > 25 && qtd_pessoas <= 30) {
        preço_semana = 400
        final_semana = 500
    } else {
        alert('A quantidade de pessoas deve estar entre 5 e 30.')
        return
    }


    const data_inicio = new Date(data_pagamento_inicial  + 'T00:00:00')
    const data_fim = new Date(data_pagamento_final  + 'T23:59:59')

    if (data_fim < data_inicio) {
        alert('A data final não pode ser menor que a data de início')
        return
    }

    let valorTotal = taxa_limpeza

        for (let current_data = new Date(data_inicio); current_data <= data_fim; current_data.setDate(current_data.getDate() + 1)) {
        const tipo_dia = verificar_dia(current_data)

        const valor_diaria = tipo_dia === 'finalSemana' ? final_semana : preço_semana
        valorTotal += valor_diaria
    }

    fetch('http://localhost:3000/agendamento_pagamento',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({data_inicial:data_pagamento_inicial,data_final:data_pagamento_final})
    })
    .then(res => res.json().then(dados => ({ status: res.status ,dados})))
    .then(({ status}) => {
        if(status ===201){
            alert('Data agendada com sucesso')
        }else if(status ===400){
            alert('Data já agendada')
        }
    })
    .catch((error) => {
        console.log('Deu algo errado',error)
    })  

    const form_mercado_pago = document.getElementById('form_mercado_pago')
    /*const btn_pagar = document.getElementById('btn_pagar')*/
    const email_pagamento = document.getElementById('email_pagamento')
    const valor_total = valorTotal

    form_pagamento.style.display ='none'
    form_mercado_pago.style.display ='block'

    fetch('/criar_pagamento',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({total:valor_total,data_inicio:data_inicio,data_fim:data_fim,email_pagamento:email_pagamento})
    })
    .then(res=>res.json())
    .then((dados=>{
        const mp = new MercadoPago('TEST-028d472b-5375-4974-8760-36368e2e525b',{
            locale:'pt-BR'
        })
        mp.checkout({
            preference:{
                id:dados.preferenceID
            }
        })
    }))
    .catch(error=>{
        alert('Erro ao criar o pagamento tente novamente'+error)
    })
})



