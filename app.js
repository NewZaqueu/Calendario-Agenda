
let isNotNull = (variavel) => variavel === null ? true : false

let extrairDataDoID = (IdElemento) => IdElemento.slice(2).replace(/-/g,'/')

let descricaoTarefaIsEmpty = (descricao) => (descricao == "") ? true : false

let limparDescricaoTarefa = () => document.getElementById('add-atividade').value = ""

function ocultarCalendario(){
    let painel = document.getElementById('painel')
    let classeOcultar = "ocultar-calendario"
    let painelEstaOculto = (painel.className.indexOf(classeOcultar) == -1) ? false : true
    switch (painelEstaOculto) {
        case false: painel.classList.add(classeOcultar)
            break;
        default: painel.classList.remove(classeOcultar)
            break;
    }
}

class ListaTarefas{
    constructor(){
        this.dataSelecionada
        this.descricao
        this.qtdTarefasRealizadasNoDia = 0
        this.qtdTarefasNoDia = 0
        this.tarefaIsDone = false
        this.tarefa
    }

    verificarAtividades(){
        let descricao = document.getElementById("add-atividade").value
        
        if (descricaoTarefaIsEmpty(descricao)){
            changeModal('Atenção','Preencha o campo de descrição da atividade antes de adciona-la','danger')
        }else {
            this.verificarQtdAtividades()
        }
    }

    verificarQtdAtividades(){
        this.dataSelecionada = document.getElementById('input-calendario-fulldate-number').innerHTML
        let qtdTarefasRegistradas = new Array()
        qtdTarefasRegistradas = JSON.parse(localStorage.getItem(this.dataSelecionada)) || 0
        this.qtdTarefasNoDia = qtdTarefasRegistradas.length || 0

        this.qtdTarefasNoDia >= 4 ? changeModal('Atenção','É permitido apenas o registro de 4 tarefas em uma mesma data.', 'danger') : this.gravarTarefas()
        
    }

    gravarTarefas(){
        this.dataSelecionada = document.getElementById('input-calendario-fulldate-number').innerHTML
        this.descricao = document.getElementById('add-atividade').value
        this.tarefa = [this.dataSelecionada, this.tarefaIsDone, this.descricao]
        //verificando se não existe alguma tarefa ja resgistrada no dia selecionado
        if (localStorage.getItem(this.dataSelecionada) == null){
            //adicionando o primeiro item como array
            let tarefaRegistrada = new Array()
            tarefaRegistrada[0] = this.tarefa
            localStorage.setItem(this.dataSelecionada, JSON.stringify(tarefaRegistrada))
        }else {
            //adicionando novas tarefas a array
            let tarefaRegistrada = new Array()
            tarefaRegistrada = JSON.parse(localStorage.getItem(this.dataSelecionada))
            tarefaRegistrada.push(this.tarefa)
            localStorage.setItem(this.dataSelecionada,JSON.stringify(tarefaRegistrada))
        }
        limparDescricaoTarefa()
        this.carregarTarefas(this.dataSelecionada)
    }

    carregarTarefas(dataTarefa){
        document.getElementById('lista-atividades').innerHTML = ""
        // recuperando lista de tarefas inclusa na data escolhida atraves do id
        let tarefaRegistrada = new Array()
        tarefaRegistrada = JSON.parse(localStorage.getItem(dataTarefa))
        this.qtdTarefasRealizadasNoDia = 0
        try {
            this.qtdTarefasNoDia = tarefaRegistrada.length // atualizando quantidade de tarefas registrada no dia
        } catch (error) {
            throw ('Nenhuma tarefa encontrada nessa data')
        }
        //criando elementos html para cada tarefa
        for (let i = 0; i < tarefaRegistrada.length; i++) {
            
            let descricao = tarefaRegistrada[i][2]
            let tarefaIsDone = tarefaRegistrada[i][1]

            dataTarefa = dataTarefa.replace(/\//g,"-") // corrigindo data de dd-m-yyyy para dd/m/yyyy

            let ulAtividades = document.getElementById('lista-atividades')
            let liTarefa = document.createElement('li')
            ulAtividades.appendChild(liTarefa)
            liTarefa.id =  `li${i}-${dataTarefa}` // id da li será numero da atividade - data de registro
            liTarefa.className = 'list-group-item'
            //alterando a exibicao da atividade conforme status realizado ou não
            if (tarefaIsDone == false) {
                liTarefa.innerHTML = 
                    `
                    <i onclick="listaTarefas.alterarStatus('${i}-${dataTarefa}')"
                    id="status${i}-${dataTarefa}" class="far fa-circle float-left"></i>
                    <p id="descricao${i}-${dataTarefa}" class="d-inline ml-2">${descricao}</p>
                    <i onclick="listaTarefas.deletarTarefas('${i}-${dataTarefa}')"
                    id="deletar${i}-${dataTarefa}" class="far fa-trash-alt float-right"></i>
                    `
            } else {
                this.qtdTarefasRealizadasNoDia++
                liTarefa.innerHTML = 
                    `
                    <i onclick="listaTarefas.alterarStatus('${i}-${dataTarefa}')"
                    id="status${i}-${dataTarefa}" class="fas fa-check-circle float-left"></i>
                    <p id="descricao${i}-${dataTarefa}" class="d-inline ml-2 inativo">${descricao}</p>
                    <i onclick="listaTarefas.deletarTarefas('${i}-${dataTarefa}')"
                    id="deletar${i}-${dataTarefa}" class="far fa-trash-alt float-right"></i>
                    `
            }
            
        }

        this.verificarQtdDone()
    }

    verificarQtdDone(){
        if (this.qtdTarefasNoDia == this.qtdTarefasRealizadasNoDia) {
            changeModal('Parabéns','Você executou todas as tarefas registradas nessa data','success')
        }
    }

    alterarStatus(idItemCheckCircle){
        // extraindo data como id e posicao do item dentro dessa data
        let dataTarefa = extrairDataDoID(idItemCheckCircle)
        // o id number esta no formato string por isso devemos usar o parseInt
        let numTarefaNaDataSelecionada = parseInt(idItemCheckCircle.slice(0,1)) 
        let tarefaRegistrada = new Array()
        tarefaRegistrada = JSON.parse(localStorage.getItem(dataTarefa))
        //invertendo valor do status - função do botão de alterar status
        tarefaRegistrada[numTarefaNaDataSelecionada][1] = !(tarefaRegistrada[numTarefaNaDataSelecionada][1])
        localStorage.setItem(dataTarefa,JSON.stringify(tarefaRegistrada))
        calendario.atualizarData()
        
    }

    deletarTarefas(idTrashItem){
        // extraindo data como id e posicao do item dentro dessa data
        let dataTarefa = extrairDataDoID(idTrashItem)
        // o id number esta no formato string por isso devemos usar o parseInt
        let numTarefaNaDataSelecionada = parseInt(idTrashItem.slice(0,1))
        let tarefaRegistrada = new Array()
        tarefaRegistrada = JSON.parse(localStorage.getItem(dataTarefa)) // array completa com todas as tarefas na data de registro
        tarefaRegistrada = removerElementoArray(numTarefaNaDataSelecionada,tarefaRegistrada) // array sem a tarefa selecionada
        
        //realimentando localStorage com a array modificada
        
        if (tarefaRegistrada.length === 0) { //se a array estiver vazia, deleta-la
            localStorage.removeItem(dataTarefa)
            calendario.atualizarData()
        } else {
            localStorage.setItem(dataTarefa,JSON.stringify(tarefaRegistrada))
            calendario.atualizarData()
        }
    }

    deletarTarefasDia(){
        let idTarefasDataSelecionada = document.getElementById('input-calendario-fulldate-number').innerHTML
        localStorage.removeItem(idTarefasDataSelecionada)
        this.carregarTarefas()
    }


}

let listaTarefas = new ListaTarefas()



let hoje = new Date()
let mes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
let dia = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

class Calendario{
    constructor(){
        this.year = hoje.getUTCFullYear()
        this.day = hoje.getUTCDay()
        this.date = hoje.getUTCDate()
        this.month = hoje.getUTCMonth()+1
        this.nextYear = this.year +1
        this.previousYear = this.year -1
        this.nextMonth = this.month + 1
        this.previousMonth= this.month - 1
        this.today = [this.date, this.month, this.year ]
    }

    atualizarData(){
        //atualizando campo com data em extenso
        document.getElementById('input-calendario-fulldate').innerHTML = `${this.date} de ${this.month} de ${this.year}`
        let mesNumber = mes.indexOf(this.month) + 1
        //atualizando calendario
        document.getElementById('input-calendario-mes').innerHTML = this.month
        document.getElementById('input-calendario-ano').innerHTML = this.year
        //atualizando painel
        let diaNumber = new Date(this.year, mesNumber-1,this.date)
        diaNumber = diaNumber.getDay()
        this.day = dia [diaNumber]
        document.getElementById('input-painel-day').innerHTML = this.day
        document.getElementById('input-painel-date').innerHTML = this.date
        //recuperando data e utilizando ela como ID no local storage. 
        let id = `${this.date}/${mesNumber}/${this.year}`
            //Esse ID sera requisitado para consultar tarefas naquele dia pelo objeto Tarefa
         document.getElementById('input-calendario-fulldate-number').innerHTML = id
         document.getElementById('input-calendario-fulldate-number').className = 'd-none'
        
        limparDescricaoTarefa()

         //carregando os dias do mês
        this.mostrarDiasDoMes(this.year,mesNumber)

        this.marcarDataSelecionada()
        
        //carregando as tarefas da data selecionada
        listaTarefas.carregarTarefas(id)
        

    }

    dataHoje(){
        //resetando valores das variaveis
        this.year = hoje.getUTCFullYear()
        this.day = hoje.getUTCDay()
        this.date = hoje.getUTCDate()
        this.month = hoje.getUTCMonth()+1

        //setando item hoje no local storage
        localStorage.setItem('hoje',JSON.stringify(this.today))
        //corrigindo data para formato convencional
        this.day = dia [this.day]
        this.month = mes [this.month-1]
        this.today = [this.date, this.month, this.year ]
        
        this.atualizarData()
    }

    selecionarAno(b){
        this.year = this.year + b
        this.atualizarData()
    }

    selecionarMes(c){
        let mesHTML = document.getElementById('input-calendario-mes').innerHTML
        //logica para criar o looping quando o mes for Janeiro ou Dezembro
        let posicaoMes = mes.indexOf(mesHTML)
        let alterandoMes = (mes,b) => {
            this.month = mes
            this.year += b
            this.atualizarData()
        }
        
        if ((mesHTML == 'Janeiro') && (mes [posicaoMes+c] == undefined)) {  //Janeiro -1 mês => Dezembro, ano -1 :
            alterandoMes('Dezembro', -1)
        }else if ((mesHTML == 'Dezembro') && (mes [posicaoMes+c] == undefined)) { //Dezembro +1 mês => Janeiro, ano +1 :
            alterandoMes('Janeiro', +1)
        }else {
            alterandoMes(mes [posicaoMes+c],0)
        }
    }

    mostrarDiasTarefas(data,id){
                if (localStorage.getItem(data) != null){
                        document.getElementById(id).innerHTML += 
                        `<i class="fas fa-clipboard-list fa-xs marcador-tarefas"></i>`
                        document.getElementById(id).classList.add('position-relative')
                }

    }

    mostrarDiasDoMes(year,month){
    //limpando calendario
    let valores = document.getElementsByTagName('td')
    for (let i = 0; i < valores.length; i++) {
        valores[i].innerHTML = ""
    }

    let data = new Date(year, month-1)
    //dia inicial do mês
    let day = data.getUTCDay(data.setDate(1))+1
    //identificando ponto inicial de carregamento dos dias na tabela a partir do ID desse elemento todos os ourtos serão posicionados
    let startRow = document.getElementById('start-row') //encontrando coluna inicial
    let idElementoClassDia = startRow.getElementsByClassName(`d${day}`)[0] // encontrando dia correspodente data 01/mês
    let id = parseInt(idElementoClassDia.id) // rastreando id do elemento
        for (let i = 0; i <= 32; i++){
                let dia = document.getElementById(`${id}`)
                let nextDate = new Date(data.getTime() + 86400000 * i)
                let dataSendoCriada = `${nextDate.getUTCDate()}/${month}/${year}`
                if (nextDate.getUTCMonth()+1 === month){
                    dia.innerHTML = nextDate.getUTCDate()
                    dia.classList.remove('text-secondary')
                    this.mostrarDiasTarefas(dataSendoCriada, id)
                    dia.onclick = function(){
                        calendario.selecionarDia(nextDate.getUTCDate(),nextDate.getUTCMonth())
                    }
                }
                id++
        }
    // imprimindo elementos do mês anterior con a classe text-secondary
        if (day !== 1) { //se o mês nao comecar no primerio dia da semana (domingo)
        // definindo o valor de this.month para o mes atual - 1
        for (let i = 1; i < day; i++) {
            data = new Date(year, month-1)
            let nextDate = new Date(data.getTime() - 24*60*60*1000*i)
            let dia = document.getElementById(`${day-i}`)
            dia.innerHTML = nextDate.getUTCDate()
            dia.classList.add('text-secondary')
            dia.onclick = function(){
                calendario.selecionarDia(nextDate.getUTCDate(),nextDate.getUTCMonth())
                
            }
        }
            
        }
        
    }

    selecionarDia(date,month){
        this.date = date
        this.month = mes[month]
        ocultarCalendario()
        // document.getElementById('painel').classList.add('ocultar-calendario')
        this.atualizarData()
        
    }

    marcarDataSelecionada(){
        let tds = document.getElementsByTagName('td')
        let data = `${this.date}`
        let marcadorTarefas = '<i class="fas fa-clipboard-list fa-xs marcador-tarefas"></i>'
        let id1
        for (let x = 0; x < tds.length; x++) {
            document.getElementById(tds[x].id).classList.remove('underline','text-primary')
            if ((tds[x].innerHTML == 1) || (tds[x].innerHTML == '1' + marcadorTarefas)){
                id1 = x
            }
        }
        for (let y = parseInt(id1); y < tds.length; y++) {
            
            if((tds[y].innerHTML == data) || (tds[y].innerHTML == data + marcadorTarefas)){
                document.getElementById(tds[y].id).classList.add('underline','text-primary')
            } 
            // || (tds[y].innerHTML == data + marcadorTarefas))
       }                        
    }



}

let calendario = new Calendario()
calendario.dataHoje()


// .................................Ferramentas.......................................

//removendo itens intermediarios do array de tarefas de cada data
function removerElementoArray(index, array){
    let array1 = new Array()
    let array2 = new Array()
    array1 = array.slice(0,index)
    array2 = array.slice(index+1, array.length)
    if (array1.length == 0){
        return(array2)
    } else if (array2.length == 0){
        return(array1)
    } else{
        return(array1.concat(array2))
    }
}

//configurando modais de alerta
function changeModal(title,msg,bootstrapColor) {
    document.getElementById('modal').innerHTML = title
    document.getElementById('modal-msg').innerHTML = msg
    document.getElementById("btn-close-modal").className = `btn btn-${bootstrapColor}`
    document.getElementById("modal").className = `modal-title text-${bootstrapColor}`

    // CONFIGURANDO O DISPLAY DA MODAL
    $('#warningModals').modal('show')
    $('#warningModals').on('shown.bs.modal', function(){
        $('#btn-close-modal').trigger('focus')
    })
    
}

//configurando a permisao de input de tarefas apertando apenas enter após selecionar campo

jQuery('#add-atividade').keypress(function(event){

	var keycode = (event.keyCode ? event.keyCode : event.which);
	if(keycode == '13'){
        listaTarefas.verificarAtividades();
        
	}

});
