
<script setup>
import kuzzle from "../services/kuzzle"
import {ref} from "vue"
import {useRouter} from 'vue-router'


let router = useRouter()

console.log(localStorage.getItem('jwt'))

let kuzzle_connected = ref(false)

let game_id = ref("")
let local_cases = ref(["0", "1", "2", "3","4", "5","6","7","8"])
let player1 = ref(true)
let player1Turn = ref(true)


let showError = ref("")

let gameEndSentence = ref("")

let gameFinished = ref(false)

let numberOfPlayers = ref(0)

let inGameMsg = ref('')

let winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];


async function valid(action){
  
  if(! await kuzzle.index.exists("morpion")){
    await kuzzle.index.create("morpion")
    await kuzzle.collection.create("morpion", "games")
  }

  if(! await kuzzle.collection.exists("morpion", "games")){
    await kuzzle.collection.create("morpion", "games")
  }


  if(action == "create"){
    let plateau = local_cases.value

    let id = await kuzzle.document.create(
      "morpion", 
      "games", 
      {
        plateau,
        player1Turn: true,
        gameFinished: false,
        numberOfPlayers: 1,
      })

    game_id.value = id._id
    player1.value = true
    inGameMsg.value = "En attente d'un autre joueur"

  }

  if(game_id.value == "") {
    showError.value = "Rajoutez un code de partie"
    return

  }

  // Join une game 
  if(action == "join"){
    let result = await kuzzle.document.search(
      "morpion",
      "games",
      {query: {
        ids: {
          values: [game_id.value] 
        }
      }},
    )

    if (result.total == 0 ){
      showError.value = "Code de partie incorrect"
      return
    }
    else if (result._result.hits[0]._source.numberOfPlayers > 1){
      showError.value = "La partie est pleine"
      return
    }
    else{

      player1.value = false
      await kuzzle.document.update(
        "morpion",
        "games",
        game_id.value,
        {
          numberOfPlayers: parseInt(result._result.hits[0]._source.numberOfPlayers) + 1
        }

      )
    }
  }
  
  SubscribeToGame()
  kuzzle_connected.value = true

}

async function SubscribeToGame(){
  if(!gameFinished.value){
  await kuzzle.realtime.subscribe(
    "morpion",
    "games",
    {ids: {values: [game_id.value]}},
    notification => {
      gameFinished.value = notification.result._source.gameFinished

      if(notification.type != "document") return
      if(notification.action != "update") return
      if(notification.result._source.gameFinished) return
      local_cases.value = notification.result._source.plateau
      player1Turn.value = notification.result._source.player1Turn
      gameFinished.value = notification.result._source.gameFinished
      console.log(notification.result._source.numberOfPlayers)
      numberOfPlayers.value = notification.result._source.numberOfPlayers
      if(!checkEmpty()) {
        closeTheGame()
        gameEndSentence.value = "Match nul !"
      }
      console.log(numberOfPlayers.value)  

      if(numberOfPlayers.value > 1 ) {
        inGameMsg.value = player1Turn.value ? 'Au tour de O' : 'Au tour de X'
      }
      isWin()

    }
  )
}
}


async function clickOnCase(index){

  if(!gameFinished.value && numberOfPlayers.value == 2){
    if(player1.value == player1Turn.value){
      let newTab = local_cases.value
      let newPlayer1Value = !player1Turn.value

      player1Turn.value ? newTab[index] = "O" : newTab[index] = "X"

      await kuzzle.document.update(
        "morpion",
        "games",
        game_id.value,
        {plateau: newTab,
        player1Turn: newPlayer1Value}
        )
    }
  }
}

async function isWin(){

  // for(let i = 0; i < local_cases.value.length - 2; i ++)
  for(let i = 0; i < winningConditions.length; i ++){
    if (local_cases.value[winningConditions[i][0]] == local_cases.value[winningConditions[i][1]] && local_cases.value[winningConditions[i][1]] == local_cases.value[winningConditions[i][2]]){
      
      gameEndSentence.value = player1Turn.value ? "Le joueur X gagne la partie !" : "Le joueur O gagne la partie !"

      closeTheGame()
    }
  }

  
}

function checkEmpty(){
  let returnVal = false
  for(let i = 0; i < local_cases.value.length ; i ++){
    if(local_cases.value[i] != 'X' && local_cases.value[i] != 'O'){
      returnVal = true
    }
  }
  console.log(returnVal)
  return returnVal
}

async function closeTheGame(){
  await kuzzle.document.update(
        "morpion",
        "games",
        game_id.value,
        {gameFinished: true}

      )
} 


</script>

<template>

  <div v-if="kuzzle_connected">
    <div v-if="game_id">
      <h2>Game joined id : {{game_id}}</h2>
      <h3 v-if="inGameMsg != ''">{{inGameMsg}}</h3>
      <h3 v-if="gameSentence != ''">{{gameEndSentence}}</h3>
      <div class="morpion_tab">
        <button class="case_btn"  v-for="(element, index) in local_cases" :key="index.value" @click="clickOnCase(index)">
        <p v-if="element == 'X' || element == 'O'">{{element}}</p></button>
      </div>
    </div>
  </div>

  <div v-if="! kuzzle_connected">
    <h1>Morpion Kuzzle</h1>
  <button @click="valid('create')">Créer une partie</button>
  <h2>Rejoindre une partie :</h2>
  <h3 v-if="showError != ''">{{showError}}</h3>
  <input type="text" v-model="game_id" placeholder="game id">
  <button @click="valid('join')">Rejoindre une partie</button>
  </div>
  <!-- <h1 v-if="isWin()">{{isWin()}}</h1> -->
  



</template>

<style>

</style>