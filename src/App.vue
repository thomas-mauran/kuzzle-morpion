<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import kuzzle from "./services/kuzzle"
import {ref} from "vue"

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
  await kuzzle.connect()
  const jwt = await kuzzle.auth.login('local', {username: "lambda", password: "1234"});

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
    else if (result._result.hits[0]._source.numberOfPlayers > 2){
      showError.value = "La partie est pleine"
      return
    }
    else{
      console.log(game_id.value)

      player1.value = false
      await kuzzle.document.update(
        "morpion",
        "games",
        game_id.value,
        {
          numberOfPlayers: result._result.hits[0]._source.numberOfPlayers + 1
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
  console.log(numberOfPlayers.value)

  if(!gameFinished.value && numberOfPlayers.value == 2){
    console.log("click")
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

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.morpion_tab{
  box-shadow: 3px 3px 3px 3px black;
  width: 600px;
  height: 600px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.case_btn{
  border-radius: 0px;
  border: 1px solid black !important;
  font-size: 3em;
  width: 200px;
  height: 200px;
}

</style>
